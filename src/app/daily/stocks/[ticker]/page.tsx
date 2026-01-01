import { getStockDetails } from "@/lib/server/stock-service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faBuilding, faChartLine, faMoneyBillWave } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export const runtime = "nodejs";

// Formatting helpers (BigInt handling)
function formatLargeCurrency(val?: bigint | null) {
  if (!val) return "—";
  const num = Number(val);
  if (Math.abs(num) >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (Math.abs(num) >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (Math.abs(num) >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}
function formatNumber(val?: number | null) {
    return val ? val.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—";
}
function formatCurrency(val?: number | null) {
    return val ? `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—";
}

export default async function StockDetailPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  
  // Use new Service
  const data = await getStockDetails(ticker);

  if (!data) {
    return (
      <div className="m-10 text-center text-base-content">
        <h1 className="text-2xl font-bold text-error mb-4">Stock Not Found</h1>
        <Link href="/daily/stocks" className="text-info hover:underline">← Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 text-base-content">
      <Link href="/daily/stocks" className="inline-flex items-center gap-2 mb-8 text-base-content/60 hover:text-base-content transition-colors">
        <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-baseline gap-3">
          <h1 className="text-4xl font-extrabold">{data.name}</h1>
          <span className="text-2xl font-mono text-base-content/60">{data.ticker}</span>
        </div>
        <div className="flex flex-wrap gap-3 mt-3 text-sm text-base-content/70">
          <span className="px-2 py-1 rounded-md bg-base-200 border border-base-400 font-semibold">{data.exchange}</span>
          <span>{data.sector}</span>
          <span>•</span>
          <span>{data.industry}</span>
          <span>•</span>
          <span>{data.assetType} ({data.country})</span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-base-200 border border-base-400 rounded-2xl p-6">
             <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-info"><FontAwesomeIcon icon={faBuilding} /> About</h2>
             <p className="text-base-content/80 text-sm leading-relaxed">{data.description}</p>
             {data.address && <p className="mt-4 pt-4 text-xs text-base-content/60 border-t border-base-400">{data.address}</p>}
          </section>

          <section className="bg-base-200 border border-base-400 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-success"><FontAwesomeIcon icon={faChartLine} /> Key Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                    ["Market Cap", formatLargeCurrency(data.marketCap)],
                    ["EBITDA", formatLargeCurrency(data.ebitda)],
                    ["P/E Ratio", formatNumber(data.peRatio)],
                    ["PEG Ratio", formatNumber(data.pegRatio)],
                    ["EPS", formatCurrency(data.eps)],
                    ["Beta", formatNumber(data.beta)],
                    ["Dividend Yield", data.divYield ? `${(data.divYield * 100).toFixed(2)}%` : "—"],
                    ["Profit Margin", data.profitMargin ? `${(data.profitMargin * 100).toFixed(2)}%` : "—"],
                ].map(([label, val]) => (
                    <div key={label}>
                        <p className="text-xs uppercase tracking-wide text-base-content/60">{label}</p>
                        <p className="mt-1 font-mono text-lg">{val}</p>
                    </div>
                ))}
            </div>
          </section>

          {/* Financial Health Section similar to above using revenueTTM, grossProfitTTM, etc */}
        </div>

        <div className="space-y-6">
            <section className="bg-base-200 border border-base-400 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-info"><FontAwesomeIcon icon={faMoneyBillWave} /> Price Info</h2>
                <div className="space-y-4">
                    {[
                        ["52 Week High", data.high52Week],
                        ["52 Week Low", data.low52Week],
                        ["50-Day MA", data.ma50Day],
                        ["200-Day MA", data.ma200Day],
                        ["Book Value", data.bookValue],
                    ].map(([label, val]) => (
                        <div key={label} className="flex justify-between text-sm text-base-content/70">
                            <span>{label}</span>
                            <span className="font-mono">{typeof val === 'number' ? formatCurrency(val) : "—"}</span>
                        </div>
                    ))}
                    <div className="pt-4 border-t border-base-400">
                        <p className="text-xs uppercase tracking-wide text-base-content/60">Analyst Target</p>
                        <p className="font-mono text-2xl text-warning mt-1">{formatCurrency(data.analystTarget)}</p>
                    </div>
                </div>
            </section>
        </div>
      </div>
    </div>
  );
}