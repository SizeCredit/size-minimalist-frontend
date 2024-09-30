import { useContext, useState } from 'react';
import { SwapContext } from '../contexts/SwapContext';

const tabs = [
  'Swap',
  'Limit',
  'Deposit',
  'Withdraw'
]

const actions = ['Buy', 'Sell'];

const Swap = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [sellAmount, setSellAmount] = useState('10');
  const [buyAmount, setBuyAmount] = useState('');
  const [action, setAction] = useState(actions[0]);
  const [days, setDays] = useState(30);

  const {sellCreditQuote, buyCreditQuote} = useContext(SwapContext)

  const handleSellAmountChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSellAmount(e.target.value);
    const quote = sellCreditQuote(parseFloat(e.target.value), days * 24 * 60 * 60)
    setBuyAmount(quote.toString());
  };

  const handleBuyAmountChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setBuyAmount(e.target.value);
    const quote = buyCreditQuote(parseFloat(e.target.value), days * 24 * 60 * 60)
    setSellAmount(quote.toString());
  };

  const swapAction = () => {
    const newAction = action === actions[0] ? actions[1] : actions[0];
    const newSellAmount = buyAmount ;
    const newBuyAmount = sellAmount ;
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
            <input type="text" value={days} onChange={(e) => setDays(Number(e.target.value))}/>
            <label className="days">days</label>
          </div>
        </div>

        <div className="input-container">
          <label>{action}</label>
          <div className="input-group">
            <input
              type="number"
              value={sellAmount}
              onChange={handleSellAmountChange}
              placeholder="0"
            />
            Credit
          </div>
        </div>

        <button className="swap-button" onClick={swapAction}>
          ↓
        </button>

        <div className="input-container">
          <label>{action  === actions[0] ? actions[1] : actions[0]}
          </label>
          <div className="input-group">
            <input
              type="number"
              value={buyAmount}
              onChange={handleBuyAmountChange}
              placeholder="0"
            />
            Cash
          </div>
        </div>

        <button className="action-button">
          {sellAmount && buyAmount ? 'Swap' : 'Enter amount'}
        </button>
      </div>
    </div>
  );
};

export default Swap;