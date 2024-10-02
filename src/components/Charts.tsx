import { useContext, useEffect, useState } from "react";
import { LimitOrdersContext } from "../contexts/LimitOrdersContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { filterOffers } from "../services/filterOffers";
import { ConfigContext } from "../contexts/ConfigContext";
import { PriceContext } from "../contexts/PriceContext";

// const CustomXAxisTick: React.FC<any> = ({ x, y, payload }) => {
//   return (
//     <g transform={`translate(${x},${y})`}>
//       <text x={0} y={0} dy={16} textAnchor="middle" fill="#666" fontSize={12}>
//         {payload.value}
//       </text>
//     </g>
//   );
// };


const Charts = () => {
  const { borrowOffers: bos, loanOffers: los } = useContext(LimitOrdersContext)
  const { market } = useContext(ConfigContext)
  const { tokens } = market
  const { price } = useContext(PriceContext)
  const [amount, setAmount] = useState(10)

  const borrowOffers = filterOffers(tokens, bos, amount, true, 0, price)
  const loanOffers = filterOffers(tokens, los, amount, false, 0, price)

  // Combine all unique tenors
  const days = [...new Set([...borrowOffers.flatMap(o => o.curveRelativeTime.tenors), ...loanOffers.flatMap(o => o.curveRelativeTime.tenors)])].sort((a, b) => a - b)
    .map(e => e / 60 / 60 / 24)

  // Prepare data for the chart
  const data = days.map(day => {
    const point = { day } as any;
    borrowOffers.forEach((offer) => {
      const aprIndex = offer.curveRelativeTime.tenors.indexOf(day * 60 * 60 * 24);
      if (aprIndex !== -1) {
        point[`B ${offer.user.account}`] = (offer.curveRelativeTime.aprs[aprIndex] * 100).toFixed(2); // Convert to percentage
      }
    });
    loanOffers.forEach((offer) => {
      const aprIndex = offer.curveRelativeTime.tenors.indexOf(day * 60 * 60 * 24);
      if (aprIndex !== -1) {
        point[`L ${offer.user.account}`] = (offer.curveRelativeTime.aprs[aprIndex] * 100).toFixed(2); // Convert to percentage
      }
    });
    return point;
  });

  // Generate more distinct shades of blue and green
  const generateColors = (count: number, baseHue: number, saturationRange: number[], lightnessRange: number[]) => {
    return Array.from({ length: count }, (_, i) => {
      const saturation = saturationRange[0] + (i * (saturationRange[1] - saturationRange[0]) / (count - 1));
      const lightness = lightnessRange[0] + (i * (lightnessRange[1] - lightnessRange[0]) / (count - 1));
      return `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
    });
  };

  const borrowColors = generateColors(borrowOffers.length, 220, [70, 100], [30, 60]); // Shades of blue
  const loanColors = generateColors(loanOffers.length, 120, [70, 100], [30, 60]);  // Shades of green

  useEffect(() => {
    const el = document.getElementsByClassName('swap-container')[0]
    const style = (el as any).style
    const original = { ...style }
    style.width = '100%'
    style.height = '100%'
    return () => {
      Object.keys(original).forEach(key => {
        style[key] = original[key]
      })
    }
  }, [])

  return (
    <>
      <div className='chart-amount'>
        <label>Amount</label>
        <input type="text" value={amount} onChange={e => setAmount(Number(e.target.value))} />
      </div>
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            label={{ value: 'Maturity (days)', position: 'insideBottom', offset: -10 }}
            ticks={days}
            dataKey="day"
            scale="log"
          />
          <YAxis label={{ value: 'APR (%)', angle: -90 }} />
          <Tooltip />
          {borrowOffers.map((borrowOffer, index) => (
            <Line
              key={`borrow${index}`}
              type="linear"
              dataKey={`B ${borrowOffer.user.account}`}
              stroke={borrowColors[index]}
              name={`B ${borrowOffer.user.account}`}
              connectNulls
            />
          ))}
          {loanOffers.map((loanOffer, index) => (
            <Line
              key={`loan${index}`}
              type="linear"
              dataKey={`L ${loanOffer.user.account}`}
              stroke={loanColors[index]}
              name={`L ${loanOffer.user.account}`}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="disclaimers">
        <small>*Unofficial Size application</small>
      </div>
    </>
  );
};

export default Charts;