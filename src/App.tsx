import Tabs from "./components/Tabs";
import Sidebar from "./components/Sidebar";
import { ToastContainer } from "react-toastify";
import LoadingBar from "react-top-loading-bar";
import { LimitOrdersContext } from "./contexts/LimitOrdersContext";
import { useContext } from "react";
import { PositionsContext } from "./contexts/PositionsContext";
import { SidebarContext } from "./contexts/SidebarContext";

function App() {
  const { progress: limitOrdersProgress } = useContext(LimitOrdersContext);
  const { progress: positionsProgress } = useContext(PositionsContext);
  const { collapsed, setCollapsed } = useContext(SidebarContext);

  return (
    <>
      <LoadingBar progress={(limitOrdersProgress + positionsProgress) / 2} />
      <Tabs />
      <Sidebar />
      <ToastContainer />
      <div className={collapsed ? "" : "collapsed"}>
        <button
          className="button-collapse right"
          onClick={() => setCollapsed(false)}
        >
          « Expand
        </button>
      </div>
    </>
  );
}

export default App;
