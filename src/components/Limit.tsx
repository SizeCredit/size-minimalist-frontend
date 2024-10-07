import { useContext, useState } from 'react';
import { SizeContext } from '../contexts/SizeContext';
import { UserContext } from '../contexts/UserContext';

const actions = [
  'BuyCreditLimit',
  'SellCreditLimit'
]

const Limit = () => {
  const {user} = useContext(UserContext)
  const { buyCreditLimit, sellCreditLimit } = useContext(SizeContext)

  const defaultOffer = {
    maxDueDate: 0,
    curveRelativeTime: {
      tenors: [],
      aprs: [],
      marketRateMultipliers: []
    }
  }

  const borrowOffer = user?.user.borrowOffer || defaultOffer
  const loanOffer = user?.user.loanOffer || defaultOffer

  const [action, setAction] = useState(actions[0])

  const offer = action === actions[0] ? loanOffer : borrowOffer

  const [days, setDays] = useState(offer.curveRelativeTime.tenors.map(e => Number(e) / (60 * 60 * 24)))
  const [aprs, setAprs] = useState(offer.curveRelativeTime.aprs.map(e => 100 * Number(e) / 1e18))

  const remove = (index: number) => {
    setDays(days.filter((_, i) => i !== index))
    setAprs(aprs.filter((_, i) => i !== index))
  }

  const add = () => {
    setDays([...days, 0])
    setAprs([...aprs, 0])
  }

  const onChangeAction = (action: string) => {
    setAction(action)
    const offer = action === actions[0] ? loanOffer : borrowOffer
    setDays(offer.curveRelativeTime.tenors.map(e => Number(e) / (60 * 60 * 24)))
    setAprs(offer.curveRelativeTime.aprs.map(e => 100 * Number(e) / 1e18))
  }

  const onClick = () => {
    if (action === actions[0]) {
      buyCreditLimit(days.map(e => BigInt(e * 60 * 60 * 24)), aprs.map(e => BigInt(e * 1e18 / 100)))
    }
    else {
      sellCreditLimit(days.map(e => BigInt(e * 60 * 60 * 24)), aprs.map(e => BigInt(e * 1e18 / 100)))
    }
  }

  return (
    <>
      <div className="input-container">
        <div className='limit'>
          <select onChange={e => onChangeAction(e.target.value)}>
            {
              actions.map((action) => (
                <option key={action} value={action}>{action}</option>
              ))
            }
          </select>
          {
            days.map((_, index) => {
              return (
                <div key={index} className='limit-row'>
                  <div className='limit-days'>
                    <input type="text" value={days[index]} onChange={e =>
                      setDays(days.map((day, i) => i === index ? (e.target.value) : day) as number[])
                    } />
                    <label>days</label>
                  </div>
                  <div className='limit-aprs'>
                    <input type="text" value={aprs[index]} onChange={e =>
                      setAprs(aprs.map((apr, i) => i === index ? (e.target.value) : apr) as number[])
                    } />
                    <label>% APR</label>
                  </div>
                  <button className='button' onClick={() => remove(index)}>✕</button>
                </div>
              )
            })
          }
        </div>
        <button className='button' onClick={() => add()}>+</button>
      </div>

      <button className="action-button" onClick={onClick}>
        {action}
      </button>

      <div className="disclaimers">
        <small>*Unofficial Size application</small>
      </div>
    </>
  );
};

export default Limit;