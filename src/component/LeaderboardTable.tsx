'use client';

import React from 'react';

interface Row {
  [key: string]: string | number;
}

interface LeaderboardTableProps {
  columns: { key: string; label: string }[];
  data: Row[];
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ columns, data }) => {
  // Sort the data by XP descending
  const sortedData = [...data].sort((a, b) => {
    const aXP = typeof a.xp === 'number' ? a.xp : parseFloat(String(a.xp));
    const bXP = typeof b.xp === 'number' ? b.xp : parseFloat(String(b.xp));
    return bXP - aXP;
  });

  return (
    <div className="overflow-x-auto rounded-xl bg-black/30 bg-opacity-70 backdrop-blur-md p-4 shadow-lg">
      <table className="min-w-full table-auto">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-2 text-left text-sm font-semibold text-white border-b border-gray-500"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row: Row, index: number) => {
            let medal = '';
            let textColor = 'text-white';

            if (index === 0) {
              medal = '🥇';
              textColor = 'text-yellow-400 font-bold';
            } else if (index === 1) {
              medal = '🥈';
              textColor = 'text-gray-300 font-semibold';
            } else if (index === 2) {
              medal = '🥉';
              textColor = 'text-amber-600 font-medium';
            }

            return (
              <tr key={index} className="hover:bg-gray-800">
                {columns.map((col, colIndex) => (
                  <td
                    key={col.key}
                    className={`px-4 py-2 border-b border-gray-700 ${
                      col.key === 'username' ? textColor : 'text-white'
                    }`}
                  >
                    {col.key === 'username' && medal ? `${medal} ${row[col.key]}` : row[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
