import { getMarketStatus } from "@/lib/server/stock-service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import {
    faArrowTrendUp,
    faArrowTrendDown,
    faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import StockSectionClient, { StockSectionData } from "@/components/StockSectionClient";

export const runtime = "nodejs";

function formatCurrency(val: number | null | undefined) {
    if (val == null) return "—";
    return val.toFixed(2);
}

// ... StockCard ...
// Note: In StockCard, access properties like item.ticker, item.price directly.
function StockCard({ item, idx }: { item: any; idx: number }) {
    // The service returns Prisma objects (camelCase), but original API was snake_case
    // We can handle both or standardize.

    const price = item.price;
    const changeAmt = item.changeAmt;
    const changePct = item.changePct; // "10.5%" string

    const isPositive = (changeAmt ?? 0) > 0;
    const isNegative = (changeAmt ?? 0) < 0;

    const trendIcon = isPositive ? faArrowTrendUp : isNegative ? faArrowTrendDown : faChartLine;
    const trendColor = isPositive ? "text-success" : isNegative ? "text-error" : "text-gray-400";
    const pctColor = isNegative ? "text-error" : isPositive ? "text-success" : "text-gray-300";

    return (
        <Link href={`/daily/stocks/${item.ticker}`} className="group block w-full focus:outline-none rounded-xl">
            <article className="relative w-full px-2 py-4 hover:bg-base-300 border border-transparent hover:border-base-400/50 rounded-xl transition-all duration-200 flex items-center justify-between group-focus:ring-1 group-focus:ring-indigo-400">
                <div className="flex items-center gap-3 xl:gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-400/30 text-sm font-bold text-base-content">{idx + 1}</span>
                    <div>
                        <h3 className="font-bold text-lg text-base-content flex items-center gap-2">
                            {item.ticker}
                            <FontAwesomeIcon icon={trendIcon} className={`w-3 h-3 ${trendColor}`} />
                        </h3>
                        <p className="text-xs text-info mt-0.5 font-mono">Vol: {item.volume ? Number(item.volume).toLocaleString() : "—"}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-base-content font-mono font-semibold text-lg">${formatCurrency(price)}</p>
                    <p className={`text-xs font-bold ${pctColor} flex items-center justify-end gap-1`}>
                        <span>{changeAmt == null ? "—" : `${changeAmt > 0 ? "+" : ""}${changeAmt.toFixed(2)}`}</span>
                        <span>({changePct ? changePct : "—"})</span>
                    </p>
                </div>
            </article>
        </Link>
    );
}

const LoadingPlaceholder = () => (
    <div className="p-6 border border-base-200 bg-base-100/50 rounded-2xl animate-pulse">
        <div className="h-4 bg-base-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-gray-700 rounded col-span-2"></div>
                <div className="h-2 bg-gray-700 rounded col-span-1"></div>
            </div>
            <div className="h-2 bg-gray-700 rounded"></div>
        </div>
    </div>
);

export default async function Page() {
    let data;
    try {
        data = await getMarketStatus();
    } catch (err) {
        console.error("Stocks page error:", err);

        return (
            <div className="m-5 p-3 text-error space-y-4">
                <p>Unable to load stock data right now. Showing fallback content...</p>
                <div className="max-w-7xl mx-auto grid gap-6 xl:grid-cols-3">
                    <LoadingPlaceholder />
                    <LoadingPlaceholder />
                    <LoadingPlaceholder />
                </div>
            </div>
        );
        console.error("Stocks page error:", err);
    }

    // Helper to render
    const renderList = (list: any[]) => {
        if (!list?.length) return <p className="text-gray-400 p-4">No data available</p>;
        return (
            <div className="mt-5 grid grid-cols-1 gap-3 mx-1">
                {list.map((item, i) => <StockCard key={item.ticker} item={item} idx={i} />)}
            </div>
        );
    };

    const sections: StockSectionData[] = [
        {
            secName: "Top Gainers",
            secIcon: faArrowTrendUp,
            secColor: "green",
            secSubHeading: "Largest positive movers",
            renderedList: renderList(data.top_gainers),
            defaultOpen: true,
        },
        {
            secName: "Top Losers",
            secIcon: faArrowTrendDown,
            secColor: "red",
            secSubHeading: "Largest negative movers",
            renderedList: renderList(data.top_losers),
            defaultOpen: false,
        },
        {
            secName: "Most Active",
            secIcon: faChartLine,
            secColor: "blue",
            secSubHeading: "Highest trading volume",
            renderedList: renderList(data.most_actively_traded),
            defaultOpen: false,
        }
    ];

    return (
        <div className="min-h-screen text-base-content p-4 xl:p-8">
            {/* Header... (same as before) */}
            <header className="text-center mb-10 space-y-4">
                <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-base-content">Market Snapshot</h1>
                <p className="text-base-content/80 max-w-2xl mx-auto text-sm xl:text-base">Top gainers, losers, and most active stocks in the US market.</p>
            </header>

            <div className="max-w-7xl mx-auto">
                <div className="grid gap-6 xl:grid-cols-3">
                    {sections.map((item, i) => <StockSectionClient key={`s-${i}`} item={item} />)}
                </div>
            </div>
        </div>
    );
}