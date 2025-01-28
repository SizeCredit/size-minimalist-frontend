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
  const sellOrdersCumulative = [];
  for (let i = 0; i < sellOrders.length; i++) {
    const prevY: number = i > 0 ? sellOrdersCumulative[i - 1].y : 0;
    sellOrdersCumulative.push({
      x: sellOrders[i].apr,
      y: prevY + sellOrders[i].depth,
    });
  }

  const buyOrdersCumulative = [];
  for (let i = 0; i < buyOrders.length; i++) {
    const prevY: number = i > 0 ? buyOrdersCumulative[i - 1].y : 0;
    buyOrdersCumulative.push({
      x: buyOrders[i].apr,
      y: prevY + buyOrders[i].depth,
    });
  }

  const buyData = [];
  const sellData = [];

  for (let i = 0; i < buyOrdersCumulative.length; i++) {
    const nextX =
      i < buyOrdersCumulative.length - 1
        ? buyOrdersCumulative[i + 1].x
        : buyOrdersCumulative[i].x + 1;
    buyData.push({ x: buyOrdersCumulative[i].x, y: buyOrdersCumulative[i].y });
    buyData.push({ x: nextX, y: buyOrdersCumulative[i].y });
  }

  for (let i = 0; i < sellOrdersCumulative.length; i++) {
    const nextX =
      i < sellOrdersCumulative.length - 1
        ? sellOrdersCumulative[i + 1].x
        : sellOrdersCumulative[i].x + 1;
    sellData.push({
      x: sellOrdersCumulative[i].x,
      y: sellOrdersCumulative[i].y,
    });
    sellData.push({ x: nextX, y: sellOrdersCumulative[i].y });
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
