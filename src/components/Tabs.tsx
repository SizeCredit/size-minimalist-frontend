import { useState } from "react";
import Swap from "./Swap";
import Funding from "./Funding";
import Limit from "./Limit";
import Charts from "./Charts";
import Positions from "./Positions";
import Factory from "./Factory";
import Registry from "./Registry";

const tabs = [
  "Swap",
  "Limit",
  "Funding",
  "Charts",
  "Positions",
  "Factory",
  "Registry",
];

const Tabs = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className="container">
      <div className="swap-container">
        <div className="tab-container">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        {activeTab === "Swap" ? <Swap /> : null}
        {activeTab === "Limit" ? <Limit /> : null}
        {activeTab === "Funding" ? <Funding /> : null}
        {activeTab === "Charts" ? <Charts /> : null}
        {activeTab === "Positions" ? <Positions /> : null}
        {activeTab === "Factory" ? <Factory /> : null}
        {activeTab === "Registry" ? <Registry /> : null}
      </div>
    </div>
  );
};

export default Tabs;
