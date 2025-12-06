import { getStocksData } from "@/app/api/stocks/[...path]/route";

export const runtime = "nodejs";


export default async function Page() {
    try {
        const endpoint = "/api/stocks/query?function=TOP_GAINERS_LOSERS"
        const resp = await getStocksData(endpoint)
        return (
            <div className="flex flex-col m-5 p-3 border border-gray-600 rounded-xl gap-5 justify-center">
                <h3>{resp.metadata}</h3>
                <h1>Top Gainers</h1>
                {resp.top_gainers?.map((item: any, index: any) => {
                    return (
                        <div key={index} className="m-5 p-3 bg-gray-700 border border-gray-600 rounded-xl">
                            <p>ticker: {item.ticker}</p>
                            <p>price: {item.price}</p>
                            <p>change_amount: {item.change_amount}</p>
                            <p>change_percentage: {item.change_percentage}</p>
                            <p>volume: {item.volume}</p>
                        </div>
                    );
                })}
            </div>
        );
    }
    catch (err) {
        console.error("Stocks page fetch error:", err);
        return (<div className="m-5 p-3">Unable to load stock data right now.</div>);
    }
}
