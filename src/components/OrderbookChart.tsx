import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface Props {
  buyOrders: Record<string, { depth: number; apr: number }[]>;
  sellOrders: Record<string, { depth: number; apr: number }[]>;
}

const OrderbookDepth = ({ buyOrders, sellOrders }: Props) => {
  const sellOrdersCumulative: Record<string, { x: number; y: number }[]> = {};
  Object.entries(sellOrders).forEach(([marketName, orders]) => {
    if (!sellOrdersCumulative[marketName]) {
      sellOrdersCumulative[marketName] = [] as {
        x: number;
        y: number;
      }[];
    }
    for (let i = 0; i < orders.length; i++) {
      const prevY: number =
        i > 0 ? sellOrdersCumulative[marketName][i - 1].y : 0;
      sellOrdersCumulative[marketName].push({
        x: orders[i].apr,
        y: prevY + orders[i].depth,
      });
    }
  });

  const buyOrdersCumulative: Record<string, { x: number; y: number }[]> = {};
  Object.entries(buyOrders).forEach(([marketName, orders]) => {
    if (!buyOrdersCumulative[marketName]) {
      buyOrdersCumulative[marketName] = [] as {
        x: number;
        y: number;
      }[];
    }
    for (let i = 0; i < orders.length; i++) {
      const prevY: number =
        i > 0 ? buyOrdersCumulative[marketName][i - 1].y : 0;
      buyOrdersCumulative[marketName].push({
        x: orders[i].apr,
        y: prevY + orders[i].depth,
      });
    }
  });

  const buyData: Record<string, { x: number; y: number }[]> = {};
  const sellData: Record<string, { x: number; y: number }[]> = {};

  Object.entries(buyOrdersCumulative).forEach(([marketName, orders]) => {
    if (!buyData[marketName]) {
      buyData[marketName] = [] as { x: number; y: number }[];
    }
    for (let i = 0; i < orders.length; i++) {
      const nextX =
        i < orders.length - 1
          ? buyOrdersCumulative[marketName][i + 1].x
          : buyOrdersCumulative[marketName][i].x + 1;
      buyData[marketName].push({
        x: buyOrdersCumulative[marketName][i].x,
        y: buyOrdersCumulative[marketName][i].y,
      });
      buyData[marketName].push({
        x: nextX,
        y: buyOrdersCumulative[marketName][i].y,
      });
    }
  });

  Object.entries(sellOrdersCumulative).forEach(([marketName, orders]) => {
    if (!sellData[marketName]) {
      sellData[marketName] = [] as { x: number; y: number }[];
    }
    for (let i = 0; i < orders.length; i++) {
      const nextX = i < orders.length - 1 ? orders[i + 1].x : orders[i].x + 1;
      sellData[marketName].push({
        x: orders[i].x,
        y: orders[i].y,
      });
      sellData[marketName].push({ x: nextX, y: orders[i].y });
    }
  });

  const buyDatasets = Object.entries(buyData).map(
    ([marketName, data], index) => ({
      label: `Buy Credit ${marketName}`,
      data,
      borderColor: `hsl(120, 70%, ${40 + index * 10}%)`,
      backgroundColor: `hsla(120, 70%, ${40 + index * 10}%, 0.5)`,
      fill: true,
      pointRadius: 5,
    }),
  );

  const sellDatasets = Object.entries(sellData).map(
    ([marketName, data], index) => ({
      label: `Sell Credit ${marketName}`,
      data,
      borderColor: `hsl(0, 70%, ${40 + index * 10}%)`,
      backgroundColor: `hsla(0, 70%, ${40 + index * 10}%, 0.5)`,
      fill: true,
      pointRadius: 5,
    }),
  );

  const data = {
    datasets: [...buyDatasets, ...sellDatasets],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Orderbook Depth View",
      },
      tooltip: {
        mode: "nearest" as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        type: "linear" as const,
        position: "bottom" as const,
        title: {
          display: true,
          text: "APR (%)",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Depth",
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default OrderbookDepth;
