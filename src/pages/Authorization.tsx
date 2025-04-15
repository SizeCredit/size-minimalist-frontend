import { useContext, useEffect, useState } from "react";
import { AuthorizationContext } from "../contexts/AuthorizationContext";
import { Action } from "../services/Authorization";
import { Address } from "viem";

const Authorization = () => {
  const { setAuthorization, revokeAllAuthorizations, isAuthorizedAll } =
    useContext(AuthorizationContext);
  const [operator, setOperator] = useState<Address>("" as Address);
  const [selectedActions, setSelectedActions] = useState<Action[]>([]);
  const [isAuthorizedAllResult, setIsAuthorizedAllResult] =
    useState<boolean>(false);

  const allActions = Object.keys(Action)
    .filter((key) => isNaN(Number(key)) && key !== "NUMBER_OF_ACTIONS")
    .map((key) => Action[key as keyof typeof Action]);

  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => Number(option.value) as Action,
    );
    setSelectedActions(selectedOptions);
  };

  useEffect(() => {
    if (operator && selectedActions.length > 0) {
      isAuthorizedAll(operator, selectedActions).then((result) => {
        setIsAuthorizedAllResult(result);
      });
    }
  }, [isAuthorizedAll, operator, selectedActions]);

  return (
    <>
      <div className="authorization-container">
        <div className="input-container">
          <div className="set-authorization">
            <label>Actions</label>
            <select
              multiple
              className="w-80"
              onChange={handleActionChange}
              value={selectedActions.map(String)}
            >
              {allActions.map((action) => (
                <option key={action} value={action}>
                  {Action[action]}
                </option>
              ))}
            </select>

            <label>Operator</label>
            <input
              type="text"
              className="w-80"
              value={operator}
              onChange={(e) => setOperator(e.target.value as Address)}
              placeholder="0x..."
            />

            <div>
              <label>Selected Actions: </label>
              <span>
                {selectedActions.length > 0
                  ? selectedActions.map((action) => Action[action]).join(", ")
                  : "None"}
              </span>
            </div>

            <div>
              <label>Is Authorized All: </label>
              <b>{isAuthorizedAllResult ? "Yes" : "No"}</b>
            </div>
          </div>
        </div>

        <button
          className="action-button"
          onClick={() => setAuthorization(operator, selectedActions)}
          disabled={!operator || selectedActions.length === 0}
        >
          Set Authorization
        </button>

        <button
          className="action-button"
          onClick={() => revokeAllAuthorizations()}
        >
          Revoke All Authorizations
        </button>

        <div className="disclaimers">
          <small>*Unofficial Size application</small>
        </div>
      </div>
    </>
  );
};

export default Authorization;
