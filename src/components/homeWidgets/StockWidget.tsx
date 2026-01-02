import { prisma } from "@/lib/server/prisma";
import ClientCarousel from "./ClientCarousel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTrendUp, faArrowTrendDown, faChartLine } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default async function StockWidget() {
  // 1. Fetch from DB (Only items with valid price data)
  const stocks = await prisma.stock.findMany({
    where: {
      price: { not: null },
      changePct: { not: null }
    },
    take: 50, // Fetch a pool to randomize from
    orderBy: { cachedAt: 'desc' } // Prefer fresh data
  });

  if (stocks.length === 0) return null;

  // 2. Randomize & Slice
  const randomStocks = stocks
    .sort((a) => 0.5 - Math.sin(Number(a.price ?? 0)))
    .slice(0, 5);

  // 3. Render Items
  const items = randomStocks.map((stock) => {
    const isPositive = (stock.changeAmt ?? 0) > 0;
    const color = isPositive ? "text-success" : "text-error";
    const icon = isPositive ? faArrowTrendUp : faArrowTrendDown;

    return (
      <Link href={`/daily/stocks/${stock.ticker}`} key={stock.ticker} className="flex flex-col justify-center h-full w-full p-2 text-center group hover:bg-base-200/50 rounded-lg transition-colors">
        <div className="flex justify-center mb-2">
            <div className={`p-4 rounded-full bg-base-200 border border-base-300 shadow-sm ${color}`}>
                <FontAwesomeIcon icon={icon} className="text-2xl" />
            </div>
        </div>
        <h4 className="text-2xl font-bold tracking-tight">{stock.ticker}</h4>
        <p className="text-sm opacity-60 font-mono mb-2">Vol: {stock.volume ? Number(stock.volume).toLocaleString() : "-"}</p>
        <div className="flex items-center justify-center gap-2 text-lg font-semibold">
            <span>${stock.price?.toFixed(2)}</span>
            <span className={`text-sm ${color} bg-base-100 px-2 py-0.5 rounded border border-base-200`}>
                {stock.changePct}
            </span>
        </div>
      </Link>
    );
  });

  return (
    <ClientCarousel 
      items={items} 
      title="Market Watch" 
      icon={<FontAwesomeIcon icon={faChartLine} />} 
      color="green" // Using green for stocks
      href="/daily/stocks"
    />
  );
}