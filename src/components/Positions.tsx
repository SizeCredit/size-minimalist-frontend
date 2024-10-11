import { useContext, useState } from 'react';
import { PositionsContext } from '../contexts/PositionsContext';

const Positions = () => {
  const { debtPositions, creditPositions } = useContext(PositionsContext)
  const [positionId, setPositionId] = useState('');

  const position = debtPositions.find(debtPosition => debtPosition.debtPositionId === positionId) || creditPositions.find(creditPosition => creditPosition.creditPositionId === positionId)


  function toObject(obj: any) {
    return JSON.parse(JSON.stringify(obj, (_, value) =>
      typeof value === 'bigint'
        ? value.toString()
        : value // return everything else unchanged
    ));
  }


  return (
    <>
      <div className="input-container">
        <div className='position-id'>
          <label>Id</label>
          <input type="text" value={positionId} onChange={e => setPositionId(e.target.value)} />
        </div>
      </div>

      <div>
        <code>
          {position ? JSON.stringify(toObject(position), null, 2) : null}
        </code>
      </div>

      <div className="disclaimers">
        <small>*Unofficial Size application</small>
      </div>
    </>
  );
};

export default Positions;