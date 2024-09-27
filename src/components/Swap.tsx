import { useState } from 'react';

const tabs = [
  'Swap',
  'Limit',
  'Balance',
  'Positions'
]

const currencies = ['Credit', 'Cash']

const Swap = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [sellAmount, setSellAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [sellCurrency, setSellCurrency] = useState(currencies[0]);
  const [buyCurrency, setBuyCurrency] = useState(currencies[1]);

  const handleSellAmountChange = (e) => {
    setSellAmount(e.target.value);
    // Simple conversion logic (replace with actual logic)
    setBuyAmount(e.target.value ? (parseFloat(e.target.value) * 1000).toFixed(2) : '');
  };

  const handleBuyAmountChange = (e) => {
    setBuyAmount(e.target.value);
    // Simple conversion logic (replace with actual logic)
    setSellAmount(e.target.value ? (parseFloat(e.target.value) / 1000).toFixed(6) : '');
  };

  const swapCurrencies = () => {
    const tempCurrency = sellCurrency;
    setSellCurrency(buyCurrency);
    setBuyCurrency(tempCurrency);
    setSellAmount('');
    setBuyAmount('');
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
          <label>Sell</label>
          <div className="input-group">
            <input
              type="number"
              value={sellAmount}
              onChange={handleSellAmountChange}
              placeholder="0"
            />
            <select
              value={sellCurrency}
              onChange={(e) => setSellCurrency(e.target.value)}
            >
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
            </select>
          </div>
          <div className="balance">Balance: 0</div>
        </div>

        <button className="swap-button" onClick={swapCurrencies}>
          ↓
        </button>

        <div className="input-container">
          <label>Buy</label>
          <div className="input-group">
            <input
              type="number"
              value={buyAmount}
              onChange={handleBuyAmountChange}
              placeholder="0"
            />
            <select
              value={buyCurrency}
              onChange={(e) => setBuyCurrency(e.target.value)}
            >
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
            </select>
          </div>
          <div className="balance">Balance: 0</div>
        </div>

        <button className="action-button">
          {sellAmount && buyAmount ? 'Swap' : 'Enter amount'}
        </button>
      </div>
    </div>
  );
};

export default Swap;