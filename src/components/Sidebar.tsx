import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { format } from '../services/format';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useContext, useEffect } from 'react';
import { ConfigContext } from '../contexts/ConfigContext';
import { UserContext } from '../contexts/UserContext';
import Blockies from 'react-blockies';
import { formatDistance } from 'date-fns/formatDistance'

const Sidebar = () => {
  const account = useAccount()
  const { connectors, connect, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { chain, tokens } = useContext(ConfigContext)
  const { user, creditPositions, debtPositions } = useContext(UserContext)

  useEffect(() => {
    toast(error?.message)
  }, [error])

  return (
    <div className="sidebar">
      <div className="wallet-info">
        <div className="wallet-address">
          <button
           onClick={
            account.status === 'connected' ? () => disconnect() : () => connect({ connector: connectors[0] })} className="connect-button">
            {
              account.status === 'connected' ?
                (

                  <Blockies
                    seed={account.address as string}
                    size={10}
                    scale={3}
                    className="blockies"
                  />

                ) : (null)
            }
            &nbsp;
            <code className="address">
              {format(account.address) || 'Connect wallet'}
            </code>
            &nbsp;
            &nbsp;
            &nbsp;
            <small>
              {chain.name}
            </small>
          </button>
        </div>
      </div>
      <div className="balance-info">
        <h2>{format(user?.borrowATokenBalance, tokens.BorrowAToken.decimals)} {tokens.BorrowAToken.symbol}</h2>
        <h2>{format(user?.collateralTokenBalance, tokens.CollateralToken.decimals)} {tokens.CollateralToken.symbol}</h2>
        <h2>{format(user?.debtBalance, tokens.DebtToken.decimals)} {tokens.DebtToken.symbol}</h2>
      </div>
      <div className="tabs">
        <div
          key="Positions"
        >
          Positions
        </div>
      </div>
      <div className="currency-list">
        {creditPositions.filter(e => e.credit > 0).map((creditPosition, index) => (
          <div key={index} className="currency-item">
            <div className="currency-details">
              <div className="">Credit {creditPosition.creditPositionId}</div>
              <div className="currency-amount positive">{format(creditPosition.credit)}</div>
              <div className="currency-name">Due {formatDistance(creditPosition.debtPosition.dueDate, new Date())}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="currency-list">
        {debtPositions.filter(e => e.futureValue > 0).map((debtPosition, index) => (
          <div key={index} className="currency-item">
            <div className="currency-details">
              <div className="">Debt {debtPosition.debtPositionId}</div>
              <div className="currency-amount negative">{format(debtPosition.futureValue)}</div>
              <div className="currency-name">Due {formatDistance(debtPosition.dueDate, new Date())}</div>
            </div>
          </div>
        ))}
      </div>
      {/* <div className="tabs">
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
      </div> */}
    </div>
  );
};

export default Sidebar;