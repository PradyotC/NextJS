// src/app/stocks/[ticker]/page.tsx
import { getStocksData } from "@/app/api/stocks/[...path]/route";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faBuilding, faChartLine, faMoneyBillWave } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export const runtime = "nodejs";

// Helper functions for formatting
function formatCurrency(val: string | undefined) {
    if (!val || val === "None" || val === "-") return "—";
    const num = parseFloat(val);
    return isNaN(num) ? "—" : "$" + num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatLargeCurrency(val: string | undefined) {
    if (!val || val === "None" || val === "-") return "—";
    const num = parseFloat(val);
    if (isNaN(num)) return "—";
    if (Math.abs(num) >= 1.0e12) return "$" + (num / 1.0e12).toFixed(2) + "T";
    if (Math.abs(num) >= 1.0e9) return "$" + (num / 1.0e9).toFixed(2) + "B";
    if (Math.abs(num) >= 1.0e6) return "$" + (num / 1.0e6).toFixed(2) + "M";
    return "$" + num.toLocaleString();
}

function formatNumber(val: string | undefined) {
    if (!val || val === "None" || val === "-") return "—";
    const num = parseFloat(val);
    return isNaN(num) ? "—" : num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default async function StockDetailPage({params}:{params: Promise<{ ticker?: string }>} ) {
    const {ticker} = await params;
    
    // We use the OVERVIEW endpoint to get company details.
    // The route handler logic strips '/api/stocks' prefix if present, 
    // so we construct a path that results in the correct upstream call.
    const endpoint = `/api/stocks/query?function=OVERVIEW&symbol=${ticker}`;
    
    let data: any = null;
    try {
        data = await getStocksData(endpoint);
    } catch (err) {
        console.error(`Error fetching details for :`, err);
    }

    // Basic error handling if data is missing or empty
    if (!data || !data.Symbol) {
        return (
            <div className="m-10 text-center">
                <h1 className="text-2xl text-red-400 mb-4 font-bold">Stock Not Found</h1>
                <p className="text-gray-400 mb-6">Unable to retrieve details for <span className="font-mono text-white">{ticker}</span>.</p>
                <Link href="/stocks" className="text-blue-400 hover:underline">
                    &larr; Return to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 text-white">
            <Link href="/stocks" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" /> Back to Dashboard
            </Link>

            <header className="mb-8">
                <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4">
                    <h1 className="text-4xl font-bold">{data.Name}</h1>
                    <span className="text-2xl text-gray-500 font-mono">{data.Symbol}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-400">
                    <span className="bg-gray-800 px-2 py-1 rounded border border-gray-700 font-semibold text-gray-300">{data.Exchange}</span>
                    <span>{data.Sector}</span>
                    <span className="hidden md:inline">&bull;</span>
                    <span>{data.Industry}</span>
                    <span className="hidden md:inline">&bull;</span>
                    <span className="text-gray-500">{data.AssetType} ({data.Country})</span>
                </div>
            </header>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Info Column */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-300">
                            <FontAwesomeIcon icon={faBuilding} className="w-5 h-5" /> About
                        </h2>
                        <p className="text-gray-300 leading-relaxed text-sm">
                            {data.Description}
                        </p>
                        {data.Address && data.Address !== "None" && (
                            <p className="text-gray-500 text-xs mt-4 pt-4 border-t border-gray-800">{data.Address}</p>
                        )}
                    </section>

                    <section className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-300">
                            <FontAwesomeIcon icon={faChartLine} className="w-5 h-5" /> Key Statistics
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider">Market Cap</p>
                                <p className="font-mono text-lg mt-1">
                                    {formatLargeCurrency(data.MarketCapitalization)}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider">EBITDA</p>
                                <p className="font-mono text-lg mt-1">
                                    {formatLargeCurrency(data.EBITDA)}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider">P/E Ratio</p>
                                <p className="font-mono text-lg mt-1">{formatNumber(data.PERatio)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider">PEG Ratio</p>
                                <p className="font-mono text-lg mt-1">{formatNumber(data.PEGRatio)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider">EPS</p>
                                <p className="font-mono text-lg mt-1">{formatCurrency(data.EPS)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider">Beta</p>
                                <p className="font-mono text-lg mt-1">{formatNumber(data.Beta)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider">Div Yield</p>
                                <p className="font-mono text-lg mt-1">
                                    {data.DividendYield && data.DividendYield !== "None" && data.DividendYield !== "0"
                                        ? (Number(data.DividendYield) * 100).toFixed(2) + "%"
                                        : "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider">Profit Margin</p>
                                <p className="font-mono text-lg mt-1">
                                    {data.ProfitMargin && data.ProfitMargin !== "None"
                                        ? (Number(data.ProfitMargin) * 100).toFixed(2) + "%"
                                        : "—"}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-purple-300">
                            <FontAwesomeIcon icon={faMoneyBillWave} className="w-5 h-5" /> Financial Health
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider">Revenue (TTM)</p>
                                <p className="font-mono text-lg mt-1">{formatLargeCurrency(data.RevenueTTM)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider">Gross Profit</p>
                                <p className="font-mono text-lg mt-1">{formatLargeCurrency(data.GrossProfitTTM)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider">Diluted EPS</p>
                                <p className="font-mono text-lg mt-1">{formatCurrency(data.DilutedEPSTTM)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider">ROA (TTM)</p>
                                <p className="font-mono text-lg mt-1">
                                    {data.ReturnOnAssetsTTM && data.ReturnOnAssetsTTM !== "None"
                                        ? (Number(data.ReturnOnAssetsTTM) * 100).toFixed(2) + "%"
                                        : "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider">ROE (TTM)</p>
                                <p className="font-mono text-lg mt-1">
                                    {data.ReturnOnEquityTTM && data.ReturnOnEquityTTM !== "None"
                                        ? (Number(data.ReturnOnEquityTTM) * 100).toFixed(2) + "%"
                                        : "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider">Rev Growth (YOY)</p>
                                <p className="font-mono text-lg mt-1">
                                    {data.QuarterlyRevenueGrowthYOY && data.QuarterlyRevenueGrowthYOY !== "None"
                                        ? (Number(data.QuarterlyRevenueGrowthYOY) * 100).toFixed(2) + "%"
                                        : "—"}
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    <section className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-yellow-300">
                            <FontAwesomeIcon icon={faMoneyBillWave} className="w-5 h-5" /> Price Info
                        </h2>
                        <div className="space-y-5">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">52 Week High</span>
                                    <span className="font-mono text-white">{formatCurrency(data["52WeekHigh"])}</span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">52 Week Low</span>
                                    <span className="font-mono text-white">{formatCurrency(data["52WeekLow"])}</span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '30%' }}></div>
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-gray-800">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">50-Day MA</span>
                                    <span className="font-mono text-white">{formatCurrency(data["50DayMovingAverage"])}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">200-Day MA</span>
                                    <span className="font-mono text-white">{formatCurrency(data["200DayMovingAverage"])}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-800">
                                <p className="text-gray-500 text-xs uppercase tracking-wider">Analyst Target</p>
                                <p className="font-mono text-2xl text-yellow-400 mt-1">{formatCurrency(data.AnalystTargetPrice)}</p>
                            </div>
                            
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider">Book Value</p>
                                <p className="font-mono text-lg text-white mt-1">{formatCurrency(data.BookValue)}</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
