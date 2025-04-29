import { useState } from "react";

interface Column {
  key: string;
  label: string;
}

interface Row {
  [key: string]: string | number;
}

interface Props {
  title: string;
  data: Row[];
  columns: Column[];
}

export function LeaderboardTable({ title, data, columns }: Props) {
  const [sortConfig, setSortConfig] = useState({
    key: columns[1].key,
    direction: 'descending',
  });

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortConfig.direction === 'ascending' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending',
    }));
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold text-white mb-4">{title}</h2>
      <div className="overflow-x-auto rounded-xl border border-white/10 shadow">
        <table className="min-w-full table-auto border-collapse bg-black/30 text-white">
          <thead className="bg-white/10 backdrop-blur text-white">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-blue-300"
                >
                  {col.label}
                  {sortConfig.key === col.key && (
                    <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-4 text-center text-gray-400">
                  No data available
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-white/10 transition-colors border-t border-white/10"
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-2">
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
