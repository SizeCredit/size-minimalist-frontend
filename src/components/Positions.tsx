import { useContext, useState } from "react";
import { PositionsContext } from "../contexts/PositionsContext";
import { SizeContext } from "../contexts/SizeContext";

const Positions = () => {
  const { debtPositions, creditPositions } = useContext(PositionsContext);
  const { claim, liquidate } = useContext(SizeContext);
  const [positionId, setPositionId] = useState("");

  const position =
    debtPositions.find(
      (debtPosition) => debtPosition.debtPositionId === positionId,
    ) ||
    creditPositions.find(
      (creditPosition) => creditPosition.creditPositionId === positionId,
    );

  function toObject(obj: any) {
    return JSON.parse(
      JSON.stringify(
        obj,
        (_, value) => (typeof value === "bigint" ? value.toString() : value), // return everything else unchanged
      ),
    );
  }

  return (
    <>
      <div className="swap-container">
        <div className="input-container">
          <div className="position-id">
            <label>Id</label>
            <input
              type="text"
              value={positionId}
              onChange={(e) => setPositionId(e.target.value)}
            />
          </div>
        </div>

        <div>
          <pre>
            {position ? JSON.stringify(toObject(position), null, 2) : null}
          </pre>
        </div>

        <div>
          <button className="action-button" onClick={() => claim(positionId)}>
            Claim
          </button>
        </div>

        <div>
          <button
            className="action-button"
            onClick={() => liquidate(positionId)}
          >
            Liquidate
          </button>
        </div>

        <div className="disclaimers">
          <small>*Unofficial Size application</small>
        </div>
      </div>
    </>
  );
};

export default Positions;
