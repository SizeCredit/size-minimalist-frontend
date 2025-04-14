import { useContext, useEffect, useRef, useState } from "react";
import { ConfigContext } from "../contexts/ConfigContext";
import {
  InitializeDataParamsStruct,
  InitializeFeeConfigParamsStruct,
  InitializeOracleParamsStruct,
  InitializeRiskConfigParamsStruct,
  PriceFeedParamsStruct,
} from "../types/ethers-contracts/SizeFactory";
import { Address, isAddress, parseUnits } from "viem";

interface CreateBorrowATokenV1_5Params {
  variablePool: Address;
  underlyingBorrowToken: Address;
}

const HOURS = 60 * 60;
const YEARS = 365 * 24 * HOURS;

const Factory = () => {
  const { chainInfo } = useContext(ConfigContext);
  if (!chainInfo) return <div>Loading...</div>;

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const actions = [
    "createBorrowATokenV1_5",
    "createMarketFeeConfig",
    "createMarketRiskConfig",
    "createMarketOracle",
    "createMarketData",
    "createPriceFeed",
  ];
  const [action, setAction] = useState<string>(actions[0]);
  const [priceFeedParams, setPriceFeedParams] = useState<PriceFeedParamsStruct>(
    {
      uniswapV3Pool: "",
      twapWindow: 0,
      averageBlockTime: 0,
      baseToken: "",
      quoteToken: "",
      baseAggregator: "",
      quoteAggregator: "",
      baseStalePriceInterval: 0,
      quoteStalePriceInterval: 0,
      sequencerUptimeFeed: chainInfo.addresses.ChainlinkSequencerUptimeFeed,
    } as PriceFeedParamsStruct,
  );
  const [createBorrowATokenV1_5Params, setCreateBorrowATokenV1_5Params] =
    useState<CreateBorrowATokenV1_5Params>({
      variablePool: chainInfo.addresses.AaveV3Pool as Address,
      underlyingBorrowToken: "" as Address,
    });
  const [createMarketFeeConfigParams, setCreateMarketFeeConfigParams] =
    useState<InitializeFeeConfigParamsStruct>({
      swapFeeAPR: "0.005e18",
      fragmentationFee: 0,
      liquidationRewardPercent: "0.05e18",
      overdueCollateralProtocolPercent: "0.01e18",
      collateralProtocolPercent: "0.10e18",
      feeRecipient: chainInfo.addresses.feeRecipient as Address,
    } as InitializeFeeConfigParamsStruct);
  const [createMarketRiskConfigParams, setCreateMarketRiskConfigParams] =
    useState<InitializeRiskConfigParamsStruct>({
      crOpening: "1.3e18",
      crLiquidation: "1.2e18",
      minimumCreditBorrowAToken: "10e6",
      borrowATokenCap: "1_000_000e6",
      minTenor: 1 * HOURS,
      maxTenor: 5 * YEARS,
    } as InitializeRiskConfigParamsStruct);
  const [createMarketOracleParams, setCreateMarketOracleParams] =
    useState<InitializeOracleParamsStruct>({
      priceFeed: "" as Address,
      variablePoolBorrowRateStaleRateInterval: 0,
    } as InitializeOracleParamsStruct);
  const [createMarketDataParams, setCreateMarketDataParams] =
    useState<InitializeDataParamsStruct>({
      weth: chainInfo.addresses.WETH,
      underlyingCollateralToken: "" as Address,
      underlyingBorrowToken: "" as Address,
      variablePool: chainInfo.addresses.AaveV3Pool as Address,
      borrowATokenV1_5: "" as Address,
    } as InitializeDataParamsStruct);
  const actionParams = {
    createPriceFeed: priceFeedParams,
    createBorrowATokenV1_5: createBorrowATokenV1_5Params,
    createMarketFeeConfig: createMarketFeeConfigParams,
    createMarketRiskConfig: createMarketRiskConfigParams,
    createMarketOracle: createMarketOracleParams,
    createMarketData: createMarketDataParams,
  };
  const settersMap = {
    createPriceFeed: setPriceFeedParams,
    createBorrowATokenV1_5: setCreateBorrowATokenV1_5Params,
    createMarketFeeConfig: setCreateMarketFeeConfigParams,
    createMarketRiskConfig: setCreateMarketRiskConfigParams,
    createMarketOracle: setCreateMarketOracleParams,
    createMarketData: setCreateMarketDataParams,
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const setter = settersMap[action as keyof typeof settersMap];

    setter((prevParams: any) => {
      const newParams = { ...prevParams };
      newParams[name] = value;
      return newParams;
    });
  };

  const formatInput = (value: string): string | undefined => {
    value = value.trim();
    value = value.replace(/_/g, "");
    if (value === "") {
      return undefined;
    }
    // address
    else if (isAddress(value)) {
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

  const safeInput = `[${Object.values(
    actionParams[action as keyof typeof actionParams],
  )
    .map((value) => value.toString())
    .map(formatInput)
    .join(",")}]`;

  const isValid = Object.values(
    actionParams[action as keyof typeof actionParams],
  ).map((value) => formatInput(value.toString()) !== undefined);

  const isAllValid = isValid.every((isValid) => isValid);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [safeInput]);

  return (
    <>
      <div className="factory-container">
        <h3>Action</h3>
        <div className="flex-row">
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            {actions.map((action) => (
              <option value={action}>{action}</option>
            ))}
          </select>
        </div>
        <table className="factory-table">
          <thead>
            <tr>
              <th style={{ width: "40%" }}>Parameter</th>
              <th style={{ width: "60%" }}>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(actionParams[action as keyof typeof actionParams]).map(
              (key, index) => (
                <tr
                  key={key}
                  className={index % 2 === 0 ? "even-row" : "odd-row"}
                  style={
                    isValid[index]
                      ? {}
                      : {
                          backgroundColor: "lightpink",
                        }
                  }
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
                        (
                          actionParams[
                            action as keyof typeof actionParams
                          ] as any
                        )[key]?.toString() ?? ""
                      }
                      onChange={handleInputChange}
                    />
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>

        <div className="safe-input-container">
          <h4>Safe input</h4>
          <div className="flex-row safe-input-row">
            <textarea
              ref={textAreaRef}
              disabled={!isAllValid}
              style={{
                whiteSpace: "pre-wrap",
                fontFamily: "monospace",
                backgroundColor: isAllValid ? "white" : "lightpink",
              }}
              value={safeInput}
              readOnly
            />
            <button
              disabled={!isAllValid}
              title="Copy to clipboard"
              className="button"
              onClick={() => navigator.clipboard.writeText(safeInput)}
              style={{
                marginLeft: "10px",
                cursor: isAllValid ? "pointer" : "not-allowed",
              }}
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
