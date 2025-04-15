import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import LoadingBar from "react-top-loading-bar";
import { LimitOrdersContext } from "./contexts/LimitOrdersContext";
import { useContext } from "react";
import { PositionsContext } from "./contexts/PositionsContext";
import { SidebarContext } from "./contexts/SidebarContext";

import Registry from "./pages/Registry";
import Factory from "./pages/Factory";
import Swap from "./pages/Swap";
import Limit from "./pages/Limit";
import CopyLimitOrders from "./pages/CopyLimitOrders";
import Funding from "./pages/Funding";
import Charts from "./pages/Charts";
import Positions from "./pages/Positions";
import Sidebar from "./components/Sidebar";
import Orderbook from "./pages/Orderbook";
import Authorization from "./pages/Authorization";

export const pages = [
  {
    path: "/registry",
    label: "Registry",
    component: <Registry />,
    default: true,
  },
  { path: "/swap", label: "Swap", component: <Swap /> },
  { path: "/limit", label: "Limit", component: <Limit /> },
  { path: "/copy", label: "CopyLimitOrders", component: <CopyLimitOrders /> },
  { path: "/funding", label: "Funding", component: <Funding /> },
  { path: "/charts", label: "Charts", component: <Charts /> },
  { path: "/positions", label: "Positions", component: <Positions /> },
  { path: "/orderbook", label: "Orderbook", component: <Orderbook /> },
  {
    path: "/authorization",
    label: "Authorization",
    component: <Authorization />,
  },
  { path: "/factory", label: "Factory", component: <Factory /> },
];

const App: React.FC = () => {
  const { progress: limitOrdersProgress } = useContext(LimitOrdersContext);
  const { progress: positionsProgress } = useContext(PositionsContext);
  const { collapsed, setCollapsed } = useContext(SidebarContext);
  const location = useLocation();
  const params = location.search;

  return (
    <div className="flex">
      <LoadingBar progress={(limitOrdersProgress + positionsProgress) / 2} />
      <Sidebar />
      <ToastContainer />
      <main className="ml-64 w-full min-h-screen bg-gray-50 p-6">
        <Routes>
          <Route
            path="/"
            element={
              <Navigate
                to={pages.find((page) => page.default)!.path + params}
                replace
              />
            }
          />
          {pages.map((page) => (
            <Route key={page.path} path={page.path} element={page.component} />
          ))}
        </Routes>
      </main>

      <div className={collapsed ? "" : "collapsed"}>
        <button
          className="button-collapse right"
          onClick={() => setCollapsed(false)}
        >
          « Expand
        </button>
      </div>
    </div>
  );
};

export default App;
