import { useContext, useState } from "react";
import { ConfigContext } from "../contexts/ConfigContext";
import { PriceFeedParamsStruct } from "../typechain/SizeFactory";

const Factory = () => {
  const { chain } = useContext(ConfigContext);
  const [priceFeedParams, setPriceFeedParams] = useState<PriceFeedParamsStruct>(
    {
      uniswapV3Factory: chain.UniswapV3Factory,
      pool: "",
      twapWindow: 0,
      averageBlockTime: 0,
      baseToken: "",
      quoteToken: "",
      baseAggregator: "",
      quoteAggregator: "",
      baseStalePriceInterval: 0,
      quoteStalePriceInterval: 0,
      sequencerUptimeFeed: "",
    } as PriceFeedParamsStruct,
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPriceFeedParams({
      ...priceFeedParams,
      [name]: value,
    });
  };

  const safeInput = `[${Object.values(priceFeedParams)
    .map((value) => `"${value}"`)
    .join(",")}]`;

  return (
    <>
      <div className="factory-container">
        <table className="factory-table">
          <thead>
            <tr>
              <th style={{ width: "40%" }}>Parameter</th>
              <th style={{ width: "60%" }}>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(priceFeedParams).map((key, index) => (
              <tr
                key={key}
                className={index % 2 === 0 ? "even-row" : "odd-row"}
              >
                <td>{key}</td>
                <td>
                  <input
                    type="text"
                    style={{
                      whiteSpace: "pre",
                      fontFamily: "monospace",
                      fontSize: "12px",
                      width: "100%",
                    }}
                    name={key}
                    value={
                      priceFeedParams[
                        key as keyof PriceFeedParamsStruct
                      ] as string
                    }
                    onChange={handleInputChange}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="safe-input-container">
          <h5>Safe input</h5>
          <div className="flex-row safe-input-row">
            <textarea
              style={{
                whiteSpace: "pre-wrap",
                fontFamily: "monospace",
              }}
              value={safeInput}
              readOnly
              rows={2}
            />
            <button
              title="Copy to clipboard"
              className="button"
              onClick={() => navigator.clipboard.writeText(safeInput)}
              style={{ marginLeft: "10px" }}
            >
              <span role="img" aria-label="copy">
                📋
              </span>
            </button>
          </div>
        </div>

        <div className="disclaimers">
          <small>*Unofficial Size application</small>
        </div>
      </div>
    </>
  );
};

export default Factory;
