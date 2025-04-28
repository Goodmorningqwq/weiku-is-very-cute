import { useState } from "react";

// Type for a single column
interface Column {
  key: string;
  label: string;
}

// Props for LeaderboardTable
interface LeaderboardTableProps {
  title: string;
  data: Record<string, any>[]; // or you can make this stricter if needed
  columns: Column[];
}

interface SortConfig {
  key: string;
  direction: 'ascending' | 'descending';
}

export function LeaderboardTable({ title, data, columns }: LeaderboardTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: columns[1]?.key ?? columns[0]?.key ?? '', // fallback if columns array is weird
    direction: 'descending',
  });

  const sortedData = [...data].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending',
    }));
  };

  return (
    <div className="mb-8 w-full max-w-md">
      <h2 className="text-xl font-bold mb-2 text-white dark:text-gray-100">{title}</h2>
      <table className="min-w-full bg-white dark:bg-gray-800 border rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-300 dark:bg-gray-700">
            {columns.map((col) => (
              <th
                key={col.key}
                className="py-2 px-4 border-b cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                onClick={() => handleSort(col.key)}
              >
                {col.label} {sortConfig.key === col.key ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-2 px-4 text-center text-gray-900 dark:text-gray-100">
                No data available
              </td>
            </tr>
          ) : (
            sortedData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-200 dark:hover:bg-gray-700">
                {columns.map((col) => (
                  <td key={col.key} className="py-2 px-4 border-b text-gray-900 dark:text-gray-100">
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
