import { useContext, useMemo } from "react";
import { TxContext, Tx } from "../contexts/TxContext";
import { format } from "../services/format";
import { gasCost } from "../services/gasCost";

const calculateStats = (
  transactions: Tx[],
  gasPrice: number,
  ethToUsd: number,
) => {
  // Group transactions by data
  const groupedTx = transactions.reduce(
    (acc, tx) => {
      if (!acc[tx.data]) {
        acc[tx.data] = [];
      }
      acc[tx.data].push(tx);
      return acc;
    },
    {} as Record<string, Tx[]>,
  );

  // Helper functions for statistics
  const calculateMean = (array: number[]) =>
    array.reduce((a, b) => a + b, 0) / array.length;
  const calculateMedian = (array: number[]) => {
    const sorted = [...array].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  };
  const calculateStdDev = (array: number[]) => {
    const mean = calculateMean(array);
    const squareDiffs = array.map((value) => Math.pow(value - mean, 2));
    const avgSquareDiff = calculateMean(squareDiffs);
    return Math.sqrt(avgSquareDiff);
  };

  // Calculate statistics for each group and sort by data
  return Object.entries(groupedTx)
    .map(([data, txs]) => {
      const gasCosts = txs.map((tx) => gasCost(tx.gasUsed, gasPrice, ethToUsd));

      return {
        data,
        count: txs.length,
        average: calculateMean(gasCosts),
        median: calculateMedian(gasCosts),
        stdDev: calculateStdDev(gasCosts),
      };
    })
    .sort((a, b) => a.data.localeCompare(b.data));
};

const TxStats = ({ price, gasPrice }: { price: number; gasPrice: number }) => {
  const { transactions } = useContext(TxContext);

  const stats = useMemo(
    () => calculateStats(transactions, gasPrice, price),
    [transactions, gasPrice, price],
  );

  return (
    <div className="stats-container">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Transaction Type</th>
            <th className="p-2 border">Count</th>
            <th className="p-2 border">Average Cost ($)</th>
            <th className="p-2 border">Median Cost ($)</th>
            <th className="p-2 border">Std Dev ($)</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((stat, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="p-2 border">{stat.data}</td>
              <td className="p-2 border text-right">{stat.count}</td>
              <td className="p-2 border text-right">{format(stat.average)}</td>
              <td className="p-2 border text-right">{format(stat.median)}</td>
              <td className="p-2 border text-right">{format(stat.stdDev)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TxStats;
