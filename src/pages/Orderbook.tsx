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
  name: string;
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
  const [selectedMarkets, setSelectedMarkets] = useState<APIMarket[]>([]);
  const [buyCurves, setBuyCurves] = useState<Record<string, APICurve[]>>(
    {} as Record<string, APICurve[]>,
  );
  const [sellCurves, setSellCurves] = useState<Record<string, APICurve[]>>(
    {} as Record<string, APICurve[]>,
  );
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
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!markets.length) return;

    Promise.all(
      markets.map((market) => {
        fetch(
          `${API_URL}/markets/${market.id}/buy-curves?include_zero_depth_curves=false`,
        )
          .then((res) => res.json())
          .then((res) =>
            res.filter(
              (c: APICurve) => c.curve_relative_time_tenors.length > 0,
            ),
          )
          .then((curves) => {
            setBuyCurves((prev) => ({ ...prev, [market.name]: curves }));
          })
          .catch(console.error);
      }),
    );

    Promise.all(
      markets.map((market) => {
        fetch(
          `${API_URL}/markets/${market.id}/sell-curves?include_zero_depth_curves=false`,
        )
          .then((res) => res.json())
          .then((res) =>
            res.filter(
              (c: APICurve) => c.curve_relative_time_tenors.length > 0,
            ),
          )
          .then((curves) => {
            setSellCurves((prev) => ({ ...prev, [market.name]: curves }));
          })
          .catch(console.error);
      }),
    );
  }, [markets]);

  const buyOrdersWithAprs = Object.entries(buyCurves).reduce(
    (acc, [marketName, curves]) => ({
      ...acc,
      [marketName]: curves
        .filter((curve) => getAprPercent(curve, days) !== undefined)
        .filter(
          (_) =>
            selectedMarkets.length === 0 ||
            selectedMarkets.some((m) => m.name === marketName),
        )
        .map((curve) => ({
          depth: Number(
            (
              curve.depth /
              10 **
                markets.find((m) => m.name === marketName)!.debt_token.decimals
            ).toFixed(0),
          ),
          apr: getAprPercent(curve, days) as number,
        }))
        .sort((a, b) => a.apr - b.apr),
    }),
    {} as Record<string, { depth: number; apr: number }[]>,
  );

  const sellOrdersWithAprs = Object.entries(sellCurves).reduce(
    (acc, [marketName, curves]) => ({
      ...acc,
      [marketName]: curves
        .filter((curve) => getAprPercent(curve, days) !== undefined)
        .filter(
          (_) =>
            selectedMarkets.length === 0 ||
            selectedMarkets.some((m) => m.name === marketName),
        )
        .map((curve) => ({
          depth: Number(
            (
              curve.depth /
              10 **
                markets.find((m) => m.name === marketName)!.collateral_token
                  .decimals
            ).toFixed(0),
          ),
          apr: getAprPercent(curve, days) as number,
        }))
        .sort((a, b) => a.apr - b.apr),
    }),
    {} as Record<string, { depth: number; apr: number }[]>,
  );

  return (
    <>
      <div className="orderbook-container">
        <div className="market-selector">
          <label>Market</label> &nbsp;
          <select
            multiple
            size={markets.length}
            value={selectedMarkets.map((m) => m.name)}
            onChange={(e) => {
              const selectedOptions = Array.from(e.target.selectedOptions);
              const selectedMarketObjects = selectedOptions
                .map((option) => markets.find((m) => m.name === option.value))
                .filter((m): m is APIMarket => m !== undefined);
              setSelectedMarkets(selectedMarketObjects);
            }}
          >
            {markets.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name}
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
