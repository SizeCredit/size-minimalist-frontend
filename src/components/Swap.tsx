import { useContext, useEffect, useState } from 'react';
import { Quote, SwapContext } from '../contexts/SwapContext';
import { format } from '../services/format';
import { LimitOrdersContext } from '../contexts/LimitOrdersContext';
import { parseUnits } from 'ethers';
import { ConfigContext } from '../contexts/ConfigContext';
import { SizeContext } from '../contexts/SizeContext';

const actions = ['Buy', 'Sell'];

const DECIMALS = 4

const Swap = () => {
  const { market } = useContext(ConfigContext)
  const { tokens } = market
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [action, setAction] = useState(actions[0]);
  const [days, setDays] = useState(30);
  const [quote, setQuote] = useState<Quote>(
    {
      user: '0x',
      rate: 0,
    }
  );

  const tenor = days * 24 * 60 * 60

  const { sellCreditQuote, buyCreditQuote } = useContext(SwapContext)
  const { sellCreditMarket, buyCreditMarket } = useContext(SizeContext)
  const { progress } = useContext(LimitOrdersContext)

  useEffect(() => {
    if (progress === 100) {
      handleBuyAmountChange('10', days)
    }
  }, [progress])

  const handleSellAmountChange = async (value: string, days: number) => {
    const quote = sellCreditQuote(parseFloat(value), tenor)
    setQuote(quote)
    setSellAmount(value);
    const newBuyAmount = action === actions[0] ? format(Number(value) * (1 + quote.rate * days / 365), DECIMALS) : format(Number(value) / (1 + quote.rate * days / 365), DECIMALS);
    setBuyAmount(newBuyAmount);
  };

  const handleBuyAmountChange = async (value: string, days: number) => {
    const quote = buyCreditQuote(parseFloat(value), tenor)
    setQuote(quote)
    setBuyAmount(value);
    const newSellAmount = action === actions[0] ? format(Number(value) / (1 + quote.rate * days / 365), DECIMALS) : format(Number(value) * (1 + quote.rate * days / 365), DECIMALS);
    setSellAmount(newSellAmount);
  };

  const handleDaysChange = async (value: string) => {
    setDays(Number(value));
    if (action === actions[0]) handleBuyAmountChange(buyAmount, Number(value))
    else handleSellAmountChange(sellAmount, Number(value))
  }

  const swap = () => action === actions[0] ? buyCreditMarket(
    quote,
    parseUnits(Number(buyAmount).toString(), tokens.BorrowAToken.decimals),
    tenor
  ) :
    sellCreditMarket(
      quote,
      parseUnits(Number(sellAmount).toString(), tokens.BorrowAToken.decimals),
      tenor
    )

  const swapAction = () => {
    const newAction = action === actions[0] ? actions[1] : actions[0];
    const newSellAmount = buyAmount;
    const newBuyAmount = sellAmount;
    setAction(
      newAction
    );
    setSellAmount(
      newSellAmount
    );
    setBuyAmount(
      newBuyAmount
    );
    if (newAction === actions[0]) {
      handleBuyAmountChange(newBuyAmount, days)
    }
    else {
      handleSellAmountChange(newSellAmount, days)
    }
  };

  return (
    <>

      <div className="input-container">
        <div className='maturity'>
          <label>Maturity</label>
          <input type="text" value={days} onChange={e => handleDaysChange(e.target.value)} />
          <label className="days">days</label>
        </div>
      </div>

      <div className="input-container">
        <label>{action}</label>
        <div className="input-group">
          <input
            type="number"
            value={action === actions[0] ? buyAmount : sellAmount}
            onChange={e => action === actions[0] ? handleBuyAmountChange(e.target.value, days) : handleSellAmountChange(e.target.value, days)}
            placeholder="0"
          />
          Credit
        </div>
      </div>

      <button className="swap-button" onClick={swapAction}>
        <span>
          ↓
        </span>
        {
          quote.rate !== 0 && quote.rate !== undefined ? <small>{(quote.rate * 100).toFixed(2)}% APR</small> : null
        }
      </button>

      <div className="input-container">
        <label>{action === actions[0] ? actions[1] : actions[0]}
        </label>
        <div className="input-group">
          <input
            type="number"
            value={action === actions[0] ? sellAmount : buyAmount}
            onChange={e => action === actions[0] ? handleSellAmountChange(e.target.value, days) : handleBuyAmountChange(e.target.value, days)}
            placeholder="0"
          />
          Cash
        </div>
      </div>

      <button className="action-button" onClick={() => swap()}>
        {sellAmount && buyAmount ? 'Swap' : 'Enter amount'}
      </button>

      <div className="disclaimers">
        <small>*Swap amounts do not include fees</small>
        <small>*Unoptimized matching engine</small>
        <small>*Unofficial Size application</small>
      </div>
    </>
  );
};

export default Swap;