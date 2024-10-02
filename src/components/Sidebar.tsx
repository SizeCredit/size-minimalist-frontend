import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { format, smallId } from '../services/format';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useContext, useEffect } from 'react';
import { ConfigContext } from '../contexts/ConfigContext';
import { UserContext } from '../contexts/UserContext';
import Blockies from 'react-blockies';
import { formatDistance } from 'date-fns/formatDistance'
import { SidebarContext } from '../contexts/SidebarContext';

const Sidebar = () => {
  const account = useAccount()
  const { connectors, connect, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { chain, tokens } = useContext(ConfigContext)
  const { user, creditPositions, debtPositions, repay } = useContext(UserContext)
  const { collapsed, setCollapsed } = useContext(SidebarContext)

  useEffect(() => {
    toast.error(error?.message)
  }, [error])

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
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
      <div className="position-list">
        {creditPositions.filter(e => e.credit > 0).map((creditPosition, index) => (
          <div key={index} className="position-item">
            <div className="position-details">
              <div className="position-name">Credit Position #{smallId(creditPosition.creditPositionId)}</div>
              <div className="position-amount positive">{format(creditPosition.credit, tokens.BorrowAToken.decimals)} {tokens.UnderlyingBorrowToken.symbol}</div>
              <div className="">Due {formatDistance(creditPosition.debtPosition.dueDate, new Date())}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="position-list">
        {debtPositions.filter(e => e.futureValue > 0).map((debtPosition, index) => (
          <div key={index} className="position-item">
            <div className="position-details">
              <div className="position-name">Debt Position #{debtPosition.debtPositionId}</div>
              <div className="position-amount negative">{format(debtPosition.futureValue, tokens.BorrowAToken.decimals)} {tokens.UnderlyingBorrowToken.symbol}</div>
              <div className="">Due {formatDistance(debtPosition.dueDate, new Date())}</div>
              <button className="repay" onClick={() => repay(debtPosition.debtPositionId)}>Repay</button>
            </div>
          </div>
        ))}
      </div>
      <div>
        <button className='button-collapse' onClick={() => setCollapsed(true)}>
          » Collapse
        </button>
      </div>
    </div>
  );
};

export default Sidebar;