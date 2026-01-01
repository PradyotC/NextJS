// src/lib/server/stock-service.ts
import { console } from "inspector";
import { prisma } from "./prisma";

const BASE_URL = process.env.ALPHAVANTAGE_BASE_URL || "https://www.alphavantage.co/query";
const API_KEY = process.env.ALPHAVANTAGE_API_KEY;

// TTL Config
const LIST_TTL = 1000 * 60 * 60; // 1 Hour for lists (gainers/losers)
const OVERVIEW_TTL = 1000 * 60 * 60 * 24 * 7; // 7 Days for company details

// Helper: Safe Number Parsing (AlphaVantage returns "None", "-", or "123.45")
function safeFloat(val: any): number | null {
    if (!val || val === "None" || val === "-") return null;
    const clean = String(val).replace(/[^0-9.\-]/g, "");
    const num = parseFloat(clean);
    return isFinite(num) ? num : null;
}

function safeInt(val: any): bigint | null {
    if (!val || val === "None" || val === "-") return null;
    const clean = String(val).replace(/[^0-9.\-]/g, "");
    const num = parseInt(clean, 10);
    return isFinite(num) ? BigInt(num) : null;
}

// --- 1. FETCH MARKET LISTS (Gainers/Losers) ---
export async function getMarketStatus() {
    const now = new Date();

    // Check if we have valid cached lists
    const gainersList = await prisma.stockList.findUnique({ where: { category: "top_gainers" } });
    
    // If cache is fresh, fetch Stocks from DB and return
    if (gainersList && gainersList.expireAt > now) {
        const losersList = await prisma.stockList.findUnique({ where: { category: "top_losers" } });
        const activeList = await prisma.stockList.findUnique({ where: { category: "most_actively_traded" } });

        const allTickers = [
            ...(gainersList?.tickers || []),
            ...(losersList?.tickers || []),
            ...(activeList?.tickers || [])
        ];

        const stocks = await prisma.stock.findMany({
            where: { ticker: { in: allTickers } }
        });

        // Helper to map tickers back to stock objects in order
        const mapStocks = (tickers: string[] = []) => 
            tickers.map(t => stocks.find(s => s.ticker === t)).filter(Boolean);

        return {
            top_gainers: mapStocks(gainersList?.tickers),
            top_losers: mapStocks(losersList?.tickers),
            most_actively_traded: mapStocks(activeList?.tickers),
            source: "db"
        };
    }

    // --- FETCH FROM API ---
    console.log("[StockService] Fetching fresh Top Gainers/Losers");
    const res = await fetch(`${BASE_URL}/query/?function=TOP_GAINERS_LOSERS&apikey=${API_KEY}`, { 
        method: "GET",
        redirect: "follow",
        next: { revalidate: LIST_TTL } });
    
    if (!res.ok) throw new Error("AlphaVantage API Failed");
    const data = await res.json();
    console.log("DATA: ",res)

    if (!data.top_gainers) {
         // API limit reached or error
         console.warn("[StockService] API Limit likely reached, returning stale if available");
         return { top_gainers: [], top_losers: [], most_actively_traded: [] };
    }

    // Helper to process and save a list
    const processList = async (category: string, rawList: any[]) => {
        const tickers: string[] = [];

        for (const item of rawList) {
            const ticker = item.ticker;
            tickers.push(ticker);

            // 1. Upsert basic quote data from the List API
            await prisma.stock.upsert({
                where: { ticker },
                update: {
                    price: safeFloat(item.price),
                    changeAmt: safeFloat(item.change_amount),
                    changePct: item.change_percentage, // Keep string like "10.5%"
                    volume: safeInt(item.volume),
                    cachedAt: now
                },
                create: {
                    ticker,
                    price: safeFloat(item.price),
                    changeAmt: safeFloat(item.change_amount),
                    changePct: item.change_percentage,
                    volume: safeInt(item.volume),
                    cachedAt: now
                }
            });

            // 2. Hit Tracker/Details Endpoint (Overview)
            // The list only gives us Price/Ticker. We need Name, Sector, etc.
            // We call getStockDetails here to ensure the DB is enriched.
            // NOTE: AlphaVantage Free Tier is 5 calls/min. This loop might hit limits.
            // getStockDetails internally checks the DB cache before hitting the API.
            try {
                // We await here to populate data sequentially. 
                // In a production environment with higher limits, you might Promise.all() chunks.
                await getStockDetails(ticker); 
            } catch (err) {
                console.warn(`[StockService] Failed to fetch details for ${ticker} (likely rate limited):`, err);
                // Proceed to next item; do not break the list loading.
            }
        }

        // Save the list order
        await prisma.stockList.upsert({
            where: { category },
            update: {
                tickers,
                cachedAt: now,
                expireAt: new Date(now.getTime() + LIST_TTL)
            },
            create: {
                category,
                tickers,
                cachedAt: now,
                expireAt: new Date(now.getTime() + LIST_TTL)
            }
        });

        return tickers;
    };

    const gainerTickers = await processList("top_gainers", data.top_gainers || []);
    const loserTickers = await processList("top_losers", data.top_losers || []);
    const activeTickers = await processList("most_actively_traded", data.most_actively_traded || []);

    // Return the mapped objects (re-fetch from DB to match return type)
    const newStocks = await prisma.stock.findMany({
        where: { ticker: { in: [...gainerTickers, ...loserTickers, ...activeTickers] } }
    });
    
    const mapNewStocks = (tickers: string[]) => tickers.map(t => newStocks.find(s => s.ticker === t)).filter(Boolean);

    return {
        top_gainers: mapNewStocks(gainerTickers),
        top_losers: mapNewStocks(loserTickers),
        most_actively_traded: mapNewStocks(activeTickers),
        source: "api"
    };
}

// --- 2. FETCH STOCK OVERVIEW (Details) ---
export async function getStockDetails(ticker: string) {
    if (!ticker) return null;
    const now = new Date();
    
    // 1. Check DB
    const existing = await prisma.stock.findUnique({ where: { ticker } });

    // If exists and overview data is fresh (within 7 days)
    if (existing?.overviewCachedAt && existing.overviewCachedAt.getTime() + OVERVIEW_TTL > now.getTime()) {
        // We have valid details, return them without hitting API
        return existing;
    }

    // 2. Fetch API
    console.log(`[StockService] Fetching Overview for ${ticker}`);
    const res = await fetch(`${BASE_URL}/query/?function=OVERVIEW&symbol=${ticker}&apikey=${API_KEY}`, 
        { method: "GET", redirect: "follow", next: { revalidate: OVERVIEW_TTL } });
    const data = await res.json();

    // If API returns empty or error (e.g. rate limit), return what we have (stale) or null
    if (!data.Symbol) {
        console.warn(`[StockService] No data returned for ${ticker}`, data);
        return existing || null;
    }

    // 3. Update DB
    const updated = await prisma.stock.upsert({
        where: { ticker: data.Symbol },
        update: {
            name: data.Name,
            description: data.Description,
            exchange: data.Exchange,
            sector: data.Sector,
            industry: data.Industry,
            assetType: data.AssetType,
            country: data.Country,
            address: data.Address,
            marketCap: safeInt(data.MarketCapitalization),
            ebitda: safeInt(data.EBITDA),
            peRatio: safeFloat(data.PERatio),
            pegRatio: safeFloat(data.PEGRatio),
            eps: safeFloat(data.EPS),
            beta: safeFloat(data.Beta),
            divYield: safeFloat(data.DividendYield),
            profitMargin: safeFloat(data.ProfitMargin),
            revenueTTM: safeInt(data.RevenueTTM),
            grossProfitTTM: safeInt(data.GrossProfitTTM),
            dilutedEPSTTM: safeFloat(data.DilutedEPSTTM),
            roaTTM: safeFloat(data.ReturnOnAssetsTTM),
            roeTTM: safeFloat(data.ReturnOnEquityTTM),
            revGrowthYOY: safeFloat(data.QuarterlyRevenueGrowthYOY),
            high52Week: safeFloat(data["52WeekHigh"]),
            low52Week: safeFloat(data["52WeekLow"]),
            ma50Day: safeFloat(data["50DayMovingAverage"]),
            ma200Day: safeFloat(data["200DayMovingAverage"]),
            bookValue: safeFloat(data.BookValue),
            analystTarget: safeFloat(data.AnalystTargetPrice),
            overviewCachedAt: now
        },
        create: {
            ticker: data.Symbol,
            name: data.Name,
            description: data.Description,
            exchange: data.Exchange,
            sector: data.Sector,
            industry: data.Industry,
            assetType: data.AssetType,
            country: data.Country,
            address: data.Address,
            marketCap: safeInt(data.MarketCapitalization),
            ebitda: safeInt(data.EBITDA),
            peRatio: safeFloat(data.PERatio),
            pegRatio: safeFloat(data.PEGRatio),
            eps: safeFloat(data.EPS),
            beta: safeFloat(data.Beta),
            divYield: safeFloat(data.DividendYield),
            profitMargin: safeFloat(data.ProfitMargin),
            revenueTTM: safeInt(data.RevenueTTM),
            grossProfitTTM: safeInt(data.GrossProfitTTM),
            dilutedEPSTTM: safeFloat(data.DilutedEPSTTM),
            roaTTM: safeFloat(data.ReturnOnAssetsTTM),
            roeTTM: safeFloat(data.ReturnOnEquityTTM),
            revGrowthYOY: safeFloat(data.QuarterlyRevenueGrowthYOY),
            high52Week: safeFloat(data["52WeekHigh"]),
            low52Week: safeFloat(data["52WeekLow"]),
            ma50Day: safeFloat(data["50DayMovingAverage"]),
            ma200Day: safeFloat(data["200DayMovingAverage"]),
            bookValue: safeFloat(data.BookValue),
            analystTarget: safeFloat(data.AnalystTargetPrice),
            overviewCachedAt: now
        }
    });

    return updated;
}