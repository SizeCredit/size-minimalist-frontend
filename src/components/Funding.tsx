import { useContext, useState } from 'react';
import { ConfigContext } from '../contexts/ConfigContext';
import { UserContext } from '../contexts/UserContext';
import { merge } from '../services/merge';
import { parseUnits } from 'ethers';

const actions = [
  'Deposit',
  'Withdraw'
]

const Funding = () => {
  const { deployment, tokens } = useContext(ConfigContext)
  const tokenDeployment = merge(deployment, tokens)
  const [action, setAction] = useState(actions[0])

  const depositTokens = [
    tokenDeployment.UnderlyingCollateralToken,
    tokenDeployment.UnderlyingBorrowToken
  ]

  const { deposit, withdraw } = useContext(UserContext)
  const [token, setToken] = useState<Record<string, any>>(
    depositTokens[0]
  );
  const [amount, setAmount] = useState('0');

  const onClick = () => action === actions[0] ? deposit(token!.address, parseUnits(amount, token!.decimals)) : withdraw(token!.address, parseUnits(amount, token!.decimals))

  console.log(token)

  return (
    <>
      <div className="input-container">
        <div className='deposit'>
          <select onChange={e => setAction(e.target.value)}>
            {
              actions.map((action) => (
                <option key={action} value={action}>{action}</option>
              ))
            }
          </select>
          <input type="text" className="w-80" value={amount} onChange={e => setAmount(e.target.value)} />
          <select onChange={e => setToken(depositTokens.find(x => x.symbol === e.target.value)!)}>
            {
              depositTokens.map((token) => (
                <option key={token.symbol} value={token.symbol}>{token.symbol}</option>
              ))
            }
          </select>
        </div>
      </div>

      <button className="action-button" onClick={onClick}>
        Funding
      </button>
    </>
  );
};

export default Funding;