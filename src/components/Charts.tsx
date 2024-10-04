import { useContext, useEffect, useState } from "react";
import { LimitOrdersContext } from "../contexts/LimitOrdersContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { filterOffers } from "../services/filterOffers";
import { ConfigContext } from "../contexts/ConfigContext";
import { PriceContext } from "../contexts/PriceContext";
import { getRate } from "../services/getRate";
import { format } from "../services/format";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const bestBorrowOffer = Math.max(...payload.filter((p: any) => p.dataKey.includes('BO ')).map((p: any) => p.value))
    const bestLoanOffer = Math.min(...payload.filter((p: any) => p.dataKey.includes('LO ')).map((p: any) => p.value))
    return (
      <div className="bg-white border border-gray-200 p-4 rounded shadow-md">
        <p className="label">{`Day: ${label}`}</p>
        {payload
          .sort((a: any, b: any) => a.dataKey.startsWith('LO') === b.dataKey.startsWith('LO') ? Number(b.value) - Number(a.value) : b.dataKey.startsWith('LO') ? 1 : -1)
          .map((p: any) => (
            <div>
              <code key={p.dataKey} style={{ color: p.stroke, textDecoration: Number(p.value) === bestBorrowOffer || Number(p.value) === bestLoanOffer ? 'underline' : '' }}>{`${p.dataKey}: ${p.value}%`}</code>
            </div>
          ))}
      </div>
    );
  }
  return null;
}

const Charts = () => {
  const { borrowOffers: allBorrowOffers, loanOffers: allLoanOffers } = useContext(LimitOrdersContext)
  const { market } = useContext(ConfigContext)
  const { tokens } = market
  const { price } = useContext(PriceContext)
  const [amount, setAmount] = useState(market.minimumCreditAmount)
  const [maxDays, setMaxDays] = useState(365)

  const borrowOffers = filterOffers(tokens, allBorrowOffers, amount, false, price)
  const loanOffers = filterOffers(tokens, allLoanOffers, amount, true, price)

  // Combine all unique tenors
  // const days = [...new Set([...borrowOffers.flatMap(o => o.curveRelativeTime.tenors), ...loanOffers.flatMap(o => o.curveRelativeTime.tenors)])].sort((a, b) => a - b)
  //   .map(e => e / 60 / 60 / 24)
  const days = Array.from({ length: maxDays }, (_, i) => i + 1)

  // Prepare data for the chart
  const data = days.map(day => {
    const point = { day } as any;
    borrowOffers.forEach((offer) => {
      const aprIndex = offer.curveRelativeTime.tenors.indexOf(day * 60 * 60 * 24);
      if (aprIndex !== -1) {
        point[`BO ${offer.user.account}`] = (offer.curveRelativeTime.aprs[aprIndex] * 100).toFixed(2); // Convert to percentage
      }
      else if (offer.curveRelativeTime.tenors[0] / 60 / 60 / 24 <= day && day < offer.curveRelativeTime.tenors[offer.curveRelativeTime.tenors.length - 1] / 60 / 60 / 24) {
        point[`BO ${offer.user.account}`] = (getRate(offer.curveRelativeTime, day * 60 * 60 * 24) * 100).toFixed(2)
      }
    });
    loanOffers.forEach((offer) => {
      const aprIndex = offer.curveRelativeTime.tenors.indexOf(day * 60 * 60 * 24);
      if (aprIndex !== -1) {
        point[`LO ${offer.user.account}`] = (offer.curveRelativeTime.aprs[aprIndex] * 100).toFixed(2); // Convert to percentage
      }
      else if (offer.curveRelativeTime.tenors[0] / 60 / 60 / 24 <= day && day < offer.curveRelativeTime.tenors[offer.curveRelativeTime.tenors.length - 1] / 60 / 60 / 24) {
        point[`LO ${offer.user.account}`] = (getRate(offer.curveRelativeTime, day * 60 * 60 * 24) * 100).toFixed(2)
      }
    });
    return point;
  });

  const generateColors = (count: number, baseHue: number, saturationRange: number[], lightnessRange: number[]) => {
    return Array.from({ length: count }, (_, i) => {
      const saturation = saturationRange[0] + (i * (saturationRange[1] - saturationRange[0]) / (count - 1));
      const lightness = lightnessRange[0] + (i * (lightnessRange[1] - lightnessRange[0]) / (count - 1));
      return `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
    });
  };

  const loanColors = generateColors(loanOffers.length, 0, [70, 100], [30, 60]);
  const borrowColors = generateColors(borrowOffers.length, 180, [70, 100], [30, 60]);

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

  const copyOrders = () => {
    const orders = {
      borrowOffers: allBorrowOffers.map(offer => ({
        user: offer.user.account,
        openingLimitBorrowCR: Math.max(Number(offer.user.user.openingLimitBorrowCR) / 1e18, 1.5),
        borrowATokenBalance: format(offer.user.borrowATokenBalance, tokens.BorrowAToken.decimals),
        collateralTokenBalance: format(offer.user.collateralTokenBalance, tokens.CollateralToken.decimals),
        debtBalance: format(offer.user.debtBalance, tokens.DebtToken.decimals),
        maxDueDate: offer.maxDueDate,
        curveRelativeTime: offer.curveRelativeTime,
      })),
      loanOffers: allLoanOffers.map(offer => ({
        user: offer.user.account,
        openingLimitBorrowCR: Math.max(Number(offer.user.user.openingLimitBorrowCR) / 1e18, 1.5),
        borrowATokenBalance: format(offer.user.borrowATokenBalance, tokens.BorrowAToken.decimals),
        collateralTokenBalance: format(offer.user.collateralTokenBalance, tokens.CollateralToken.decimals),
        debtBalance: format(offer.user.debtBalance, tokens.DebtToken.decimals),
        maxDueDate: offer.maxDueDate,
        curveRelativeTime: offer.curveRelativeTime,
      })),
    }
    navigator.clipboard.writeText(JSON.stringify(orders, null, 2))
  }

  return (
    <>
      <div className='chart-amount'>
        <label>Amount ({(market.tokens.UnderlyingBorrowToken.symbol)})</label>
        <input type="text" value={amount} onChange={e => setAmount(Number(e.target.value))} />
      </div>
      <div className='chart-days'>
        <label>Max Days</label>
        <input type="text" value={maxDays} onChange={e => setMaxDays(Number(e.target.value))} />
      </div>
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            label={{ value: 'Maturity (days)', position: 'insideBottom', offset: -10 }}
            ticks={days}
            dataKey="day"
          />
          <YAxis label={{ value: 'APR (%)', angle: -90 }} />
          <Tooltip content={<CustomTooltip />} />
          {borrowOffers.map((borrowOffer, index) => (
            <Line
              key={`borrow${index}`}
              type="linear"
              dataKey={`BO ${borrowOffer.user.account}`}
              stroke={borrowColors[index]}
              name={`BO ${borrowOffer.user.account}`}
              connectNulls
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
            />
          ))}
          {loanOffers.map((loanOffer, index) => (
            <Line
              key={`loan${index}`}
              type="linear"
              dataKey={`LO ${loanOffer.user.account}`}
              stroke={loanColors[index]}
              name={`LO ${loanOffer.user.account}`}
              connectNulls
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <button className="button" onClick={copyOrders}>
        Copy orders to clipboard
      </button>

      <div className="disclaimers">
        <small>*Unofficial Size application</small>
      </div>
    </>
  );
};

export default Charts;