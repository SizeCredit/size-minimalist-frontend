import { useContext, useEffect, useState } from 'react';
import { SwapContext } from '../contexts/SwapContext';
import { format } from '../services/format';
import { LimitOrdersContext } from '../contexts/LimitOrdersContext';

const tabs = [
  'Swap',
  'Limit',
  'Deposit',
  'Withdraw'
]

const actions = ['Buy', 'Sell'];

const Swap = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [sellAmount, setSellAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [action, setAction] = useState(actions[0]);
  const [days, setDays] = useState(30);

  const { sellCreditQuote, buyCreditQuote } = useContext(SwapContext)
  const { progress } = useContext(LimitOrdersContext)

  useEffect(() => {
    if (progress === 100) {
      handleSellAmountChange('10')
    }
  }, [progress])

  const handleSellAmountChange = async (value: string) => {
    console.log('handleSellAmountChange')
    const quote = sellCreditQuote(parseFloat(value), days * 24 * 60 * 60)
    setSellAmount(value);
    setBuyAmount(format(quote));
  };

  const handleBuyAmountChange = async (value: string) => {
    const quote = buyCreditQuote(parseFloat(value), days * 24 * 60 * 60)
    setBuyAmount(value);
    setSellAmount(format(quote));
  };

  const handleDaysChange = async (value: string) => {
    setDays(Number(value));
    handleSellAmountChange(sellAmount)
  }

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
  };

  return (
    <div className="container">
      <div className="swap-container">
        <div className="tab-container">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

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
              value={sellAmount}
              onChange={e => handleSellAmountChange(e.target.value)}
              placeholder="0"
            />
            Credit
          </div>
        </div>

        <button className="swap-button" onClick={swapAction}>
          ↓
        </button>

        <div className="input-container">
          <label>{action === actions[0] ? actions[1] : actions[0]}
          </label>
          <div className="input-group">
            <input
              type="number"
              value={buyAmount}
              onChange={e => handleBuyAmountChange(e.target.value)}
              placeholder="0"
            />
            Cash
          </div>
        </div>

        <button className="action-button">
          {sellAmount && buyAmount ? 'Swap' : 'Enter amount'}
        </button>

        <div className="disclaimers">
          <small>*Swap amounts do not include fees</small>
          <small>*Unoptimized matching engine</small>
          <small>*Unnoficial Size application</small>
        </div>
      </div>
    </div>
  );
};

export default Swap;