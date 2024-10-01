import { useState } from 'react';
import Swap from './Swap';
import Funding from './Funding';

const tabs = [
  'Swap',
  'Limit',
  'Funding',
  'Statistics'
]

const Tabs = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className="container">
      <div className="swap-container">
        <div className="tab-container">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        {
          activeTab === 'Swap' ? <Swap /> : null
        }
        {
          activeTab === 'Limit' ? <Swap /> : null
        }
        {
          activeTab === 'Funding' ? <Funding /> : null
        }
        {
          activeTab === 'Statistics' ? <Swap /> : null
        }
        <div className="disclaimers">
          <small>*Tabs amounts do not include fees</small>
          <small>*Unoptimized matching engine</small>
          <small>*Unofficial Size application</small>
        </div>
      </div>
    </div>
  );
};

export default Tabs;