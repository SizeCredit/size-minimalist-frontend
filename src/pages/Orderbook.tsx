import { useEffect, useState } from "react";
import OrderbookChart from "../components/OrderbookChart";

const API_URL = "https://api.size.credit";

interface GetAPIMarketsResponse {
  markets_by_chain: {
    [chain: string]: APIMarket[];
  };
}

interface APIMarket {
  id: string;
  collateral_token: {
    address: string;
    decimals: number;
  };
  debt_token: {
    address: string;
    decimals: number;
  };
}

interface APICurve {
  curve_relative_time_aprs: number[];
  curve_relative_time_market_rate_multipliers: number[];
  curve_relative_time_tenors: number[];
  max_due_date: number;
  user_address: string;
  depth: number;
}

function getTenor(days: number): number {
  return days * 24 * 60 * 60;
}

function getAprPercent(curve: APICurve, days: number): number | undefined {
  let leftIndex = -1;
  const tenor = getTenor(days);
  for (let i = 0; i < curve.curve_relative_time_tenors.length; i++) {
    if (curve.curve_relative_time_tenors[i] <= tenor) {
      leftIndex = i;
    } else {
      break;
    }
  }

  if (leftIndex === -1) return undefined;
  if (leftIndex === curve.curve_relative_time_tenors.length - 1)
    return undefined;

  const x1 = curve.curve_relative_time_tenors[leftIndex];
  const x2 = curve.curve_relative_time_tenors[leftIndex + 1];
  const y1 = curve.curve_relative_time_aprs[leftIndex];
  const y2 = curve.curve_relative_time_aprs[leftIndex + 1];

  return (y1 + ((y2 - y1) * (tenor - x1)) / (x2 - x1)) / 1e16;
}

const Orderbook = () => {
  const [markets, setMarkets] = useState<APIMarket[]>([]);
  const [market, setMarket] = useState<APIMarket | undefined>(undefined);
  const [buyCurves, setBuyCurves] = useState<APICurve[]>([]);
  const [sellCurves, setSellCurves] = useState<APICurve[]>([]);
  const [days, setDays] = useState<number>(30);

  useEffect(() => {
    fetch(`${API_URL}/`)
      .then((res) => res.json())
      .then((data: GetAPIMarketsResponse) => {
        const ms: APIMarket[] = [];
        Object.entries(data.markets_by_chain).forEach(([, markets]) => {
          ms.push(...markets);
        });
        setMarkets(ms);
        setMarket(ms[0]);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!market) return;

    fetch(
      `${API_URL}/markets/${market.id}/buy-curves?include_zero_depth_curves=false`,
    )
      .then((res) => res.json())
      .then((res) =>
        res.filter((c: APICurve) => c.curve_relative_time_tenors.length > 0),
      )
      .then(setBuyCurves)
      .catch(console.error);

    fetch(
      `${API_URL}/markets/${market.id}/sell-curves?include_zero_depth_curves=false`,
    )
      .then((res) => res.json())
      .then((res) =>
        res.filter((c: APICurve) => c.curve_relative_time_tenors.length > 0),
      )
      .then(setSellCurves)
      .catch(console.error);
  }, [market]);

  const buyOrdersWithAprs = buyCurves
    .filter((curve) => getAprPercent(curve, days) !== undefined)
    .map((curve) => ({
      depth: Number(
        (curve.depth / 10 ** market!.debt_token.decimals).toFixed(0),
      ),
      apr: getAprPercent(curve, days) as number,
    }))
    .sort((a, b) => a.apr - b.apr);

  const sellOrdersWithAprs = sellCurves
    .filter((curve) => getAprPercent(curve, days) !== undefined)
    .map((curve) => ({
      depth: Number(
        (curve.depth / 10 ** market!.collateral_token.decimals).toFixed(0),
      ),
      apr: getAprPercent(curve, days) as number,
    }))
    .sort((a, b) => a.apr - b.apr);

  return (
    <>
      <div className="orderbook-container">
        <div className="market-selector">
          <label>Market</label> &nbsp;
          <select
            value={market?.id}
            onChange={(e) =>
              setMarket(markets.find((m) => m.id === e.target.value))
            }
          >
            {markets.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id}
              </option>
            ))}
          </select>
        </div>
        <div className="input-container">
          <div className="days">
            <label>Days</label> &nbsp;
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </div>
        </div>
        <OrderbookChart
          buyOrders={buyOrdersWithAprs}
          sellOrders={sellOrdersWithAprs}
        />

        <div className="disclaimers">
          <small>*Unofficial Size application</small>
        </div>
      </div>
    </>
  );
};

export default Orderbook;
