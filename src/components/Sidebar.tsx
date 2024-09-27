import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { format } from '../services/format';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useContext, useEffect } from 'react';
import { ConfigContext } from '../contexts/ConfigContext';
import { UserContext } from '../contexts/UserContext';

const Sidebar = () => {
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const {chain, deployment} = useContext(ConfigContext)
  const {user} = useContext(UserContext)

  const currencies = [
    { name: 'USD Coin', symbol: 'USDC', amount: 152.72, value: 152.83, change: -0.58 },
    { name: 'Ethereum', symbol: 'ETH', amount: 0.044, value: 116.39, change: 0.66 },
    { name: 'Ethereum', symbol: 'ETH', amount: 0.010, value: 25.91, change: 0.66 },
  ];

  const history = [
    { from: '0x1', action: 'BuyCreditMarket', to: '0x2', amount: 100, currency: 'USDC', timestamp: '2021-10-01T12:00:00Z' },
    { from: '0x2', action: 'SellCreditMarket', to: '0x1', amount: 100, currency: 'USDC', timestamp: '2021-10-01T12:00:00Z' },
    { from: '0x1', action: 'BuyCreditMarket', to: '0x2', amount: 100, currency: 'USDC', timestamp: '2021-10-01T12:00:00Z' },
  ]

  useEffect(() => {
    toast(error?.message)
  }, [error])

  console.log(status, account.status, error)

  return (
    <div className="sidebar">
      <div className="wallet-info">
        <div className="wallet-address">
          <button onClick={
            account.status === 'connected' ? () => disconnect() : () => connect({ connector: connectors[0] })} className="connect-button">
            <span className="icon">{account.status === 'connected' ? '🟢' : '🟡'}</span>
            &nbsp;
            <code className="address">
              {format(account.address) || 'Connect wallet'}
            </code>
          </button>
        </div>
      </div>
      <div className="balance-info">
        <h2>${format(user?.borrowATokenBalance, deployment.BorrowAToken.decimals)}</h2>
        <p className="balance-change">
          {1 >= 0 ? '▲' : '▼'} ${12}%
        </p>
      </div>
      <div>
        {chain.name}
      </div>
      <div className="tabs">
        <div
          key="Positions"
          className={`tab`}
        >
          Positions
        </div>
      </div>
      <div className="currency-list">
        {currencies.map((currency, index) => (
          <div key={index} className="currency-item">
            <div className="currency-icon">{currency.symbol === 'USDC' ? '💰' : '⟠'}</div>
            <div className="currency-details">
              <div className="currency-name">{currency.name}</div>
              <div className="currency-amount">{currency.amount} {currency.symbol}</div>
            </div>
            <div className="currency-value">
              <div>${currency.value.toFixed(2)}</div>
              <div className={`currency-change ${currency.change >= 0 ? 'positive' : 'negative'}`}>
                {currency.change >= 0 ? '▲' : '▼'} {Math.abs(currency.change)}%
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="tabs">
        <div
          key="History"
          className={`tab`}
        >
          History
        </div>
      </div>
      <div className="currency-list">
        {history.map((currency, index) => (
          <div key={index} className="currency-item">
            <div className="currency-details">
              <div className="currency-name">{currency.action}</div>
            </div>
            <div className="currency-value">
              <div>${currency.amount.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;