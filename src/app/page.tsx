'use client';

import { useState, useEffect } from 'react';
import { LeaderboardTable } from '@/component/LeaderboardTable';

// Interfaces
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

  // Load from localStorage
  useEffect(() => {
    const savedLocked = localStorage.getItem('lockedLeaderboard');
    const savedTime = localStorage.getItem('lastLockedTime');
    if (savedLocked) {
      setLockedLeaderboard(JSON.parse(savedLocked) as Member[]);
    }
    if (savedTime) {
      setLastLockedTime(parseInt(savedTime));
    }
  }, []);

  // After loading time, fetch data
  useEffect(() => {
    if (lastLockedTime !== null) {
      fetchGuildData();
    }
  }, [lastLockedTime]);

  // Fetch guild data
  const fetchGuildData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/guild');
      if (!response.ok) {
        throw new Error('API call failed');
      }
      const data = await response.json();
      const members = data.members;
      if (!members || members.total === 0) {
        throw new Error('No members found in guild');
      }

      const memberDict: Record<string, Member> = {};
      const ranks = ['owner', 'chief', 'strategist', 'captain', 'recruiter', 'recruit'] as const;

      ranks.forEach((rank) => {
        if (members[rank]) {
          Object.keys(members[rank]).forEach((memberKey) => {
            const memberData = members[rank][memberKey];
            const username = memberKey;
            const xp = Number(memberData.contributed) || 0;
            if (memberDict[username]) {
              memberDict[username].xp = Math.max(memberDict[username].xp, xp);
            } else {
              memberDict[username] = { username, xp };
            }
          });
        }
      });

      const newCurrentLeaderboard: Member[] = Object.values(memberDict).sort((a, b) => b.xp - a.xp);
      setCurrentLeaderboard(newCurrentLeaderboard);

      const now = Date.now();
      const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

      if (!lastLockedTime || now - lastLockedTime >= oneWeekMs) {
        setLockedLeaderboard(newCurrentLeaderboard);
        localStorage.setItem('lockedLeaderboard', JSON.stringify(newCurrentLeaderboard));
        localStorage.setItem('lastLockedTime', now.toString());
        setLastLockedTime(now);
      }

      const lockedDict: Record<string, number> = {};
      lockedLeaderboard.forEach((member) => {
        lockedDict[member.username] = member.xp;
      });

      const differenceList: DifferenceMember[] = [];
      newCurrentLeaderboard.forEach((member) => {
        const lockedXP = lockedDict[member.username] || 0;
        differenceList.push({
          username: member.username,
          difference: member.xp - lockedXP,
        });
      });

      lockedLeaderboard.forEach((member) => {
        if (!memberDict[member.username]) {
          differenceList.push({
            username: member.username,
            difference: -member.xp,
          });
        }
      });

      differenceList.sort((a, b) => b.difference - a.difference);
      setDifferenceLeaderboard(differenceList);

      setLastUpdatedTime(now);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
        console.error('Error:', e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 dark:bg-gray-900" suppressHydrationWarning>
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

        {isLoading ? (
          <div className="text-center text-white">Loading...</div>
        ) : (
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
