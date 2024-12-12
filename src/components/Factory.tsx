import { useContext, useEffect, useRef, useState } from "react";
import { ConfigContext } from "../contexts/ConfigContext";
import { PriceFeedParamsStruct } from "../typechain/SizeFactory";
import { isAddress, parseUnits } from "viem";

const Factory = () => {
  const { chain } = useContext(ConfigContext);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
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

  const formatInput = (value: string): string | undefined => {
    value = value.trim();
    value = value.replace(/_/g, "");
    // address
    if (isAddress(value)) {
      return `"${value}"`;
    }
    // time
    else if (value.includes("second")) {
      return `"${Number(value.replace(/seconds?/g, ""))}"`;
    } else if (value.includes("minute")) {
      return `"${Number(value.replace(/minutes?/g, "")) * 60}"`;
    } else if (value.includes("hour")) {
      return `"${Number(value.replace(/hours?/g, "")) * 60 * 60}"`;
    } else if (value.includes("day")) {
      return `"${Number(value.replace(/days?/g, "")) * 60 * 60 * 24}"`;
    }
    // scientific notation
    else if (value.includes("e")) {
      const [mantissa, exponent] = value.split("e");
      if (
        !Number.isNaN(Number.parseFloat(mantissa)) &&
        Number.isInteger(Number.parseFloat(exponent))
      ) {
        return `"${parseUnits(mantissa, Number(exponent))}"`;
      } else {
        return undefined;
      }
    }
    // integer
    else if (Number.isInteger(Number(value))) {
      return `"${value}"`;
    } else {
      return undefined;
    }
  };

  const safeInput = `[${Object.values(priceFeedParams)
    .map((value) => value.toString())
    .map(formatInput)
    .join(",")}]`;

  const isValid = Object.values(priceFeedParams).map(
    (value) => formatInput(value.toString()) !== undefined,
  );

  console.log(safeInput);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [safeInput]);

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
                style={{
                  backgroundColor: isValid[index] ? "white" : "lightpink",
                }}
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
              ref={textAreaRef}
              disabled={!isValid.every((isValid) => isValid)}
              style={{
                whiteSpace: "pre-wrap",
                fontFamily: "monospace",
                backgroundColor: isValid.every((isValid) => isValid)
                  ? "white"
                  : "lightpink",
              }}
              value={safeInput}
              readOnly
            />
            <button
              disabled={!isValid.every((isValid) => isValid)}
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
