import { getStocksData } from "@/app/api/stocks/[...path]/route";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faBuilding,
  faChartLine,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export const runtime = "nodejs";

function formatCurrency(val?: string) {
  if (!val || val === "None" || val === "-") return "—";
  const num = Number(val);
  if (!Number.isFinite(num)) return "—";
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatLargeCurrency(val?: string) {
  if (!val || val === "None" || val === "-") return "—";
  const num = Number(val);
  if (!Number.isFinite(num)) return "—";
  if (Math.abs(num) >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (Math.abs(num) >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (Math.abs(num) >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

function formatNumber(val?: string) {
  if (!val || val === "None" || val === "-") return "—";
  const num = Number(val);
  return Number.isFinite(num)
    ? num.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : "—";
}

export default async function StockDetailPage({
  params,
}: {
  params: Promise<{ ticker?: string }>;
}) {
  const { ticker } = await params;
  const endpoint = `/api/stocks/query?function=OVERVIEW&symbol=${ticker}`;

  let data: any = null;
  try {
    data = await getStocksData(endpoint);
  } catch {
    data = null;
  }

  if (!data?.Symbol) {
    return (
      <div className="m-10 text-center text-base-content">
        <h1 className="text-2xl font-bold text-error mb-4">Stock Not Found</h1>
        <p className="mb-6 text-base-content/70">
          Unable to retrieve details for{" "}
          <span className="font-mono">{ticker}</span>.
        </p>
        <Link href="/daily/stocks" className="text-info hover:underline">
          ← Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 text-base-content">
      <Link
        href="/daily/stocks"
        className="inline-flex items-center gap-2 mb-8 text-base-content/60 hover:text-base-content transition-colors"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-baseline gap-3">
          <h1 className="text-4xl font-extrabold">{data.Name}</h1>
          <span className="text-2xl font-mono text-base-content/60">
            {data.Symbol}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 mt-3 text-sm text-base-content/70">
          <span className="px-2 py-1 rounded-md bg-base-200 border border-base-400 font-semibold">
            {data.Exchange}
          </span>
          <span>{data.Sector}</span>
          <span>•</span>
          <span>{data.Industry}</span>
          <span>•</span>
          <span>{data.AssetType} ({data.Country})</span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-base-200 border border-base-400 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-info">
              <FontAwesomeIcon icon={faBuilding} />
              About
            </h2>
            <p className="text-base-content/80 text-sm leading-relaxed">
              {data.Description}
            </p>
            {data.Address && data.Address !== "None" && (
              <p className="mt-4 pt-4 text-xs text-base-content/60 border-t border-base-400">
                {data.Address}
              </p>
            )}
          </section>

          <section className="bg-base-200 border border-base-400 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-success">
              <FontAwesomeIcon icon={faChartLine} />
              Key Statistics
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                ["Market Cap", formatLargeCurrency(data.MarketCapitalization)],
                ["EBITDA", formatLargeCurrency(data.EBITDA)],
                ["P/E Ratio", formatNumber(data.PERatio)],
                ["PEG Ratio", formatNumber(data.PEGRatio)],
                ["EPS", formatCurrency(data.EPS)],
                ["Beta", formatNumber(data.Beta)],
                [
                  "Dividend Yield",
                  data.DividendYield && data.DividendYield !== "None"
                    ? `${(Number(data.DividendYield) * 100).toFixed(2)}%`
                    : "—",
                ],
                [
                  "Profit Margin",
                  data.ProfitMargin && data.ProfitMargin !== "None"
                    ? `${(Number(data.ProfitMargin) * 100).toFixed(2)}%`
                    : "—",
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs uppercase tracking-wide text-base-content/60">
                    {label}
                  </p>
                  <p className="mt-1 font-mono text-lg">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-base-200 border border-base-400 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-warning">
              <FontAwesomeIcon icon={faMoneyBillWave} />
              Financial Health
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                ["Revenue (TTM)", formatLargeCurrency(data.RevenueTTM)],
                ["Gross Profit", formatLargeCurrency(data.GrossProfitTTM)],
                ["Diluted EPS", formatCurrency(data.DilutedEPSTTM)],
                [
                  "ROA (TTM)",
                  data.ReturnOnAssetsTTM && data.ReturnOnAssetsTTM !== "None"
                    ? `${(Number(data.ReturnOnAssetsTTM) * 100).toFixed(2)}%`
                    : "—",
                ],
                [
                  "ROE (TTM)",
                  data.ReturnOnEquityTTM && data.ReturnOnEquityTTM !== "None"
                    ? `${(Number(data.ReturnOnEquityTTM) * 100).toFixed(2)}%`
                    : "—",
                ],
                [
                  "Rev Growth (YOY)",
                  data.QuarterlyRevenueGrowthYOY &&
                  data.QuarterlyRevenueGrowthYOY !== "None"
                    ? `${(Number(data.QuarterlyRevenueGrowthYOY) * 100).toFixed(2)}%`
                    : "—",
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs uppercase tracking-wide text-base-content/60">
                    {label}
                  </p>
                  <p className="mt-1 font-mono text-lg">{value}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-base-200 border border-base-400 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-info">
              <FontAwesomeIcon icon={faMoneyBillWave} />
              Price Info
            </h2>

            <div className="space-y-4">
              {[
                ["52 Week High", data["52WeekHigh"]],
                ["52 Week Low", data["52WeekLow"]],
                ["50-Day MA", data["50DayMovingAverage"]],
                ["200-Day MA", data["200DayMovingAverage"]],
                ["Book Value", data.BookValue],
              ].map(([label, val]) => (
                <div key={label}>
                  <div className="flex justify-between text-sm text-base-content/70">
                    <span>{label}</span>
                    <span className="font-mono">
                      {formatCurrency(val)}
                    </span>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-base-400">
                <p className="text-xs uppercase tracking-wide text-base-content/60">
                  Analyst Target
                </p>
                <p className="font-mono text-2xl text-warning mt-1">
                  {formatCurrency(data.AnalystTargetPrice)}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
