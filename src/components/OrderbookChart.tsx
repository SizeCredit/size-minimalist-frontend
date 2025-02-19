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
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export interface Order {
  depth: number;
  apr: number;
  user_address: string;
}

interface Point {
  x: number;
  y: number;
  user_address: string;
}

interface Props {
  buyOrders: Record<string, Order[]>;
  sellOrders: Record<string, Order[]>;
}

const OrderbookDepth = ({ buyOrders, sellOrders }: Props) => {
  const getCumulativeOrders = (orders: Record<string, Order[]>) => {
    const cumulativeOrders: Record<string, Point[]> = {};
    Object.entries(orders).forEach(([marketName, orders]) => {
      if (!cumulativeOrders[marketName]) {
        cumulativeOrders[marketName] = [] as Point[];
      }
      for (let i = 0; i < orders.length; i++) {
        const prevY: number = i > 0 ? cumulativeOrders[marketName][i - 1].y : 0;
        cumulativeOrders[marketName].push({
          x: orders[i].apr,
          y: prevY + orders[i].depth,
          user_address: orders[i].user_address,
        });
      }
    });
    return cumulativeOrders;
  };

  const sellOrdersCumulative = getCumulativeOrders(sellOrders);
  const buyOrdersCumulative = getCumulativeOrders(buyOrders);

  const getData = (cumulativeOrders: Record<string, Point[]>) => {
    const data: Record<string, Point[]> = {};
    Object.entries(cumulativeOrders).forEach(([marketName, orders]) => {
      if (!data[marketName]) {
        data[marketName] = [] as Point[];
      }
      for (let i = 0; i < orders.length; i++) {
        const nextX =
          i < orders.length - 1
            ? cumulativeOrders[marketName][i + 1].x
            : cumulativeOrders[marketName][i].x + 1;
        data[marketName].push({
          x: cumulativeOrders[marketName][i].x,
          y: cumulativeOrders[marketName][i].y,
          user_address: cumulativeOrders[marketName][i].user_address,
        });
        data[marketName].push({
          x: nextX,
          y: cumulativeOrders[marketName][i].y,
          user_address: cumulativeOrders[marketName][i].user_address,
        });
      }
    });
    return data;
  };

  const buyData = getData(buyOrdersCumulative);
  const sellData = getData(sellOrdersCumulative);

  const getDatasets = (
    label: string,
    borderColorPrefix: string,
    backgroundColorPrefix: string,
    data: Record<string, Point[]>,
  ) => {
    return Object.entries(data).map(([marketName, data], index) => ({
      label: `${label} Credit ${marketName}`,
      data,
      borderColor: `${borderColorPrefix} ${40 + index * 10}%)`,
      backgroundColor: `${backgroundColorPrefix} ${40 + index * 10}%, 0.5)`,
      fill: true,
      pointRadius: 5,
    }));
  };
  const buyDatasets = getDatasets(
    "Buy",
    "hsl(120, 70%,",
    "hsla(120, 70%,",
    buyData,
  );
  const sellDatasets = getDatasets(
    "Sell",
    "hsl(0, 70%,",
    "hsla(0, 70%,",
    sellData,
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
