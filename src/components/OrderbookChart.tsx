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
  buyOrders: { depth: number; apr: number }[];
  sellOrders: { depth: number; apr: number }[];
}

const OrderbookDepth = ({ buyOrders, sellOrders }: Props) => {
  if (!buyOrders.length || !sellOrders.length) return null;

  console.log(buyOrders, sellOrders);
  const buyData = [];
  const sellData = [];

  for (let i = 0; i < buyOrders.length; i++) {
    const nextX =
      i < buyOrders.length - 1 ? buyOrders[i + 1].apr : buyOrders[i].apr + 1;
    buyData.push({ x: buyOrders[i].apr, y: buyOrders[i].depth });
    buyData.push({ x: nextX, y: buyOrders[i].depth });
  }

  for (let i = 0; i < sellOrders.length; i++) {
    const nextX = i < sellOrders.length - 1 ? sellOrders[i + 1].apr : 0;
    sellData.push({ x: sellOrders[i].apr, y: sellOrders[i].depth });
    sellData.push({ x: nextX, y: sellOrders[i].depth });
  }

  const data = {
    datasets: [
      {
        label: "Buy Credit Depth",
        data: buyData,
        borderColor: "green",
        backgroundColor: "rgba(0, 255, 0, 0.5)",
        fill: true,
        pointRadius: 5,
      },
      {
        label: "Sell Credit Depth",
        data: sellData,
        borderColor: "red",
        backgroundColor: "rgba(255, 0, 0, 0.5)",
        fill: true,
        pointRadius: 5,
      },
    ],
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
