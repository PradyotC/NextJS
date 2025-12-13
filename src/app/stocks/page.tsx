import { getStocksData } from "@/app/api/stocks/[...path]/route";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import {
    faArrowTrendUp,
    faArrowTrendDown,
    faChartLine,
    faClock
} from "@fortawesome/free-solid-svg-icons";
import StockSectionClient, { StockSectionData } from "@/components/StockSectionClient";

export const runtime = "nodejs";

// --- Helper Functions (Server-Side) ---

function safeNumber(val: any): number | null {
    if (val == null) return null;
    const s = String(val).trim().replace(/%|,/g, "");
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
}

function formatCurrency(val: number | null, fallback = "—") {
    if (val == null) return fallback;
    return val.toFixed(2);
}

function sanitizeId(s: string) {
    return String(s).replace(/[^a-z0-9\-_]/gi, "-");
}

// --- StockCard Component (Server-Side) ---

/** Renders a single, fully-formed stock item. */
function StockCard({ item, idx }: { item: any; idx: number }) {
    const priceNum = safeNumber(item?.price);
    const changeAmount = safeNumber(item?.change_amount);
    const changePct =
        item?.change_percentage != null
            ? safeNumber(item.change_percentage)
            : safeNumber(item?.change_percentage_raw) ?? null;

    const isPositive = (changeAmount ?? 0) > 0 || (changePct ?? 0) > 0;
    const isNegative = (changeAmount ?? 0) < 0 || (changePct ?? 0) < 0;

    const trendIcon = isPositive
        ? faArrowTrendUp
        : isNegative
            ? faArrowTrendDown
            : faChartLine;
    const trendColor = isPositive
        ? "text-green-400"
        : isNegative
            ? "text-red-400"
            : "text-gray-400";
    const pctColor = isNegative
        ? "text-red-400"
        : isPositive
            ? "text-green-400"
            : "text-gray-300";
    const hoverClass = isNegative
        ? "hover:border-red-400"
        : isPositive
            ? "hover:border-green-400"
            : "hover:border-gray-400";

    const uid = `${sanitizeId(String(item?.ticker ?? "unk"))}-${idx}`;

    return (
        <Link
            href={`/stocks/${item?.ticker}`}
            className="group block w-full focus:outline-none rounded-xl"
        >
            <article
                className={`relative w-full px-2 py-4 hover:bg-gray-800 border border-transparent hover:border-gray-700/50 ${hoverClass} rounded-xl transition-all duration-200 flex items-center justify-between group-focus:ring-1 group-focus:ring-indigo-500`}
                role="article"
                aria-labelledby={`ticker-${uid}`}
            >
                <div className="flex items-center gap-3 lg:gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700/30 text-sm font-bold text-gray-500 group-hover:text-white group-hover:bg-gray-700 transition-colors">
                        {idx + 1}
                    </span>
                    <div>
                        <h3
                            id={`ticker-${uid}`}
                            className="font-bold text-lg text-white flex items-center gap-2"
                        >
                            {item?.ticker ?? "—"}
                            <FontAwesomeIcon
                                icon={trendIcon}
                                className={`w-3 h-3 ${trendColor}`}
                                aria-hidden
                            />
                        </h3>
                        <p className="text-xs text-blue-500 mt-0.5 font-mono">
                            Vol: {item?.volume ?? "—"}
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-white font-mono font-semibold text-lg">
                        ${formatCurrency(priceNum)}
                    </p>
                    <p
                        className={`text-xs font-bold ${pctColor} flex items-center justify-end gap-1`}
                    >
                        <span>
                            {changeAmount == null
                                ? "—"
                                : `${changeAmount > 0 ? "+" : ""}${changeAmount.toFixed(2)}`}
                        </span>
                        <span>
                            (
                            {changePct == null
                                ? "—"
                                : `${changePct > 0 ? "+" : ""}${changePct.toFixed(2)}%`}
                            )
                        </span>
                    </p>
                </div>
            </article>
        </Link>
    );
}


// --- Main Server Component Logic ---

export default async function Page() {
    try {
        const endpoint = "/api/stocks/query?function=TOP_GAINERS_LOSERS";
        const resp = await getStocksData(endpoint);

        // Function to render the list of cards server-side
        const renderStockCards = (data: any[] | undefined) => {
            if (!data?.length) {
                return <p className="text-gray-400">No data available</p>;
            }
            return (
                <div className="mt-5 grid grid-cols-1 gap-3 mx-1 ">
                    {data.map((item: any, i: number) => (
                        <StockCard key={item?.ticker ?? `unk-${i}`} item={item} idx={i} />
                    ))}
                </div>
            );
        };

        const sections: StockSectionData[] = [
            {
                secName: "Top Gainers",
                secIcon: faArrowTrendUp,
                secColor: "green",
                secSubHeading: "Largest positive movers",
                renderedList: renderStockCards(resp?.top_gainers),
                defaultOpen: true,
            },
            {
                secName: "Top Losers",
                secIcon: faArrowTrendDown,
                secColor: "red",
                secSubHeading: "Largest negative movers",
                renderedList: renderStockCards(resp?.top_losers),
                defaultOpen: false,
            },
            {
                secName: "Most Active",
                secIcon: faChartLine,
                secColor: "blue",
                secSubHeading: "Highest trading volume",
                renderedList: renderStockCards(resp?.most_actively_traded),
                defaultOpen: false,
            }
        ]
        
        return (
            <div className="min-h-screen text-white p-4 lg:p-8">
                <header className="text-center mb-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-900/20 border border-yellow-700/30 text-yellow-500 text-xs font-medium">
                        <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                        <span>Data delayed approx. 1 hour • Not real-time</span>
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                        Market Snapshot
                    </h1>

                    <p className="text-gray-400 max-w-2xl mx-auto text-sm lg:text-base">
                        Top gainers, losers, and most active stocks in the US market.
                    </p>
                </header>

                <div className="max-w-7xl mx-auto">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {sections?.map((item, i) => (
                            <StockSectionClient key={`s-${i}`} item={item} /> // Pass rendered JSX
                        ))}
                    </div>
                </div>
            </div>
        );
    } catch (err) {
        console.error("Stocks page fetch error:", err);
        
        // Basic loading placeholder for SSR failure
        const LoadingPlaceholder = () => (
            <div className="p-6 border border-gray-700 bg-gray-900/50 rounded-2xl animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="h-2 bg-gray-700 rounded col-span-2"></div>
                        <div className="h-2 bg-gray-700 rounded col-span-1"></div>
                    </div>
                    <div className="h-2 bg-gray-700 rounded"></div>
                </div>
            </div>
        );

        return (
            <div className="m-5 p-3 text-red-400 space-y-4">
                <p>Unable to load stock data right now. Showing fallback content...</p>
                <div className="max-w-7xl mx-auto grid gap-6 lg:grid-cols-3">
                    <LoadingPlaceholder />
                    <LoadingPlaceholder />
                    <LoadingPlaceholder />
                </div>
            </div>
        );
    }
}