'use client';

import { useState, useEffect } from 'react';
import { LeaderboardTable } from '@/component/LeaderboardTable';

interface Member {
  username: string;
  xp: number;
}
interface DifferenceMember {
  username: string;
  difference: number;
}

export default function HomePage() {
  const [currentLeaderboard, setCurrentLeaderboard] = useState<Member[]>([]);
  const [lockedLeaderboard, setLockedLeaderboard] = useState<Member[]>([]);
  const [differenceLeaderboard, setDifferenceLeaderboard] = useState<DifferenceMember[]>([]);
  const [lastLockedTime, setLastLockedTime] = useState<number | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchGuildData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/guild');
      if (!res.ok) throw new Error('Failed to fetch guild data');
      const data = await res.json();
      const members = data.members;

      const memberDict: Record<string, Member> = {};
      const ranks = ['owner', 'chief', 'strategist', 'captain', 'recruiter', 'recruit'] as const;

      ranks.forEach((rank) => {
        if (members[rank]) {
          Object.keys(members[rank]).forEach((key) => {
            const xp = Number(members[rank][key].contributed || 0);
            const username = key;
            if (memberDict[username]) {
              memberDict[username].xp = Math.max(memberDict[username].xp, xp);
            } else {
              memberDict[username] = { username, xp };
            }
          });
        }
      });

      const current = Object.values(memberDict).sort((a, b) => b.xp - a.xp);
      setCurrentLeaderboard(current);

      // Server call to get or update locked leaderboard
      const lockRes = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaderboard: current }),
      });
      const { lockedLeaderboard, lastLockedTime } = await lockRes.json();
      setLockedLeaderboard(lockedLeaderboard);
      setLastLockedTime(lastLockedTime);
      setLastUpdatedTime(Date.now());

      // Compute XP diff
      const lockedMap: Record<string, number> = {};
      lockedLeaderboard.forEach((m) => (lockedMap[m.username] = m.xp));

      const diffList: DifferenceMember[] = current.map((m) => ({
        username: m.username,
        difference: m.xp - (lockedMap[m.username] || 0),
      }));

      lockedLeaderboard.forEach((m) => {
        if (!memberDict[m.username]) {
          diffList.push({ username: m.username, difference: -m.xp });
        }
      });

      diffList.sort((a, b) => b.difference - a.difference);
      setDifferenceLeaderboard(diffList);
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuildData();
  }, []);

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 dark:bg-gray-900">
      <div className="w-full max-w-2xl flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold mb-6 text-white dark:text-gray-100">
          Ruwr members Guild Weekly XP
        </h1>

        <div className="flex flex-col items-center mb-4 text-white dark:text-gray-300 space-y-2">
          <p><strong>Last Weekly Reset:</strong> {formatDate(lastLockedTime)}</p>
          <p><strong>Last Updated:</strong> {formatDate(lastUpdatedTime)}</p>
        </div>

        <button
          onClick={fetchGuildData}
          disabled={isLoading}
          className={`mb-6 px-4 py-2 rounded-lg text-white font-medium transition-colors duration-150 ${
            isLoading
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Refreshing...' : 'Refresh Leaderboard'}
        </button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
        )}

        {!isLoading && (
          <LeaderboardTable
            title="Weekly XP Leaderboard"
            data={differenceLeaderboard}
            columns={[
              { key: 'username', label: 'Username' },
              { key: 'difference', label: 'XP Gained' },
            ]}
          />
        )}
      </div>
    </div>
  );
}
