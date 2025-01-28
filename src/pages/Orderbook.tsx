import { useEffect, useState } from "react";

const API_URL =
  "https://api.size.credit/markets/ethereum-0x65767ab18A2854895D5287Ac689A18B54A17DFb1";
interface Curve {
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

function getAprPercent(curve: Curve, days: number): number | undefined {
  let leftIndex = -1;
  const tenor = getTenor(days);
  for (let i = 0; i < curve.curve_relative_time_tenors.length; i++) {
    if (curve.curve_relative_time_tenors[i] <= tenor) {
      leftIndex = i;
    } else {
      break;
    }
  }

  // If tenor is outside the curve range
  if (leftIndex === -1) return undefined;
  if (leftIndex === curve.curve_relative_time_tenors.length - 1)
    return undefined;

  // Linear interpolation
  const x1 = curve.curve_relative_time_tenors[leftIndex];
  const x2 = curve.curve_relative_time_tenors[leftIndex + 1];
  const y1 = curve.curve_relative_time_aprs[leftIndex];
  const y2 = curve.curve_relative_time_aprs[leftIndex + 1];

  return (y1 + ((y2 - y1) * (tenor - x1)) / (x2 - x1)) / 1e16;
}

const Orderbook = () => {
  const [buyCurves, setBuyCurves] = useState<Curve[]>([]);
  const [sellCurves, setSellCurves] = useState<Curve[]>([]);
  const [days, setDays] = useState<number>(30);

  useEffect(() => {
    fetch(`${API_URL}/buy-curves?include_zero_depth_curves=false`)
      .then((res) => res.json())
      .then(setBuyCurves)
      .catch(console.error);

    fetch(`${API_URL}/sell-curves?include_zero_depth_curves=false`)
      .then((res) => res.json())
      .then(setSellCurves)
      .catch(console.error);
  }, []);

  return (
    <>
      <div className="orderbook-container">
        <div className="input-container">
          <div className="days">
            <label>Days</label> &nbsp;
            <input
              type="text"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </div>
        </div>
        <h1>Buy Curves</h1>
        <div className="buy-curves">
          {buyCurves.map((curve) => (
            <div key={curve.user_address}>
              <pre>Depth: {curve.depth / 1e6}</pre>
              <pre>APR: {getAprPercent(curve, days)}%</pre>
            </div>
          ))}
        </div>

        <h1>Sell Curves</h1>
        <div className="sell-curves">
          {sellCurves.map((curve) => (
            <div key={curve.user_address}>
              <pre>Depth: {curve.depth / 1e18}</pre>
              <pre>APR: {getAprPercent(curve, days)}%</pre>
            </div>
          ))}
        </div>

        <div className="disclaimers">
          <small>*Unofficial Size application</small>
        </div>
      </div>
    </>
  );
};

export default Orderbook;
