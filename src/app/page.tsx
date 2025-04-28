'use client';

import { useState, useEffect } from 'react';
import { LeaderboardTable } from '@/component/LeaderboardTable';

// Interfaces for typing
interface Member {
  username: string;
  xp: number;
}

interface DifferenceMember {
  username: string;
  difference: number;
}

export default function HomePage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentLeaderboard, setCurrentLeaderboard] = useState<Member[]>([]);
  const [lockedLeaderboard, setLockedLeaderboard] = useState<Member[]>([]);
  const [differenceLeaderboard, setDifferenceLeaderboard] = useState<DifferenceMember[]>([]);
  const [lastLockedTime, setLastLockedTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load locked leaderboard and last locked time from localStorage on mount
  useEffect(() => {
    const savedLocked = localStorage.getItem('lockedLeaderboard');
    const savedTime = localStorage.getItem('lastLockedTime');
    if (savedLocked) {
      setLockedLeaderboard(JSON.parse(savedLocked) as Member[]);
    }
    if (savedTime) {
      setLastLockedTime(new Date(parseInt(savedTime)).toLocaleString());
    }
  }, []);

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

      // Process members, handling duplicates
      const memberDict: Record<string, Member> = {};
      const ranks = ['owner', 'chief', 'strategist', 'captain', 'recruiter', 'recruit'] as const;

      ranks.forEach((rank) => {
        if (members[rank]) {
          Object.keys(members[rank]).forEach((memberKey) => {
            const memberData = members[rank][memberKey];
            const username = memberKey;
            const xp = Number(memberData.contributed) || 0;
            if (memberDict[username]) {
              console.warn(`Duplicate username ${username}: ${memberDict[username].xp}, ${xp}`);
              memberDict[username].xp = Math.max(memberDict[username].xp, xp);
            } else {
              memberDict[username] = { username, xp };
            }
          });
        }
      });

      // Convert to array and sort by XP descending
      const newCurrentLeaderboard: Member[] = Object.values(memberDict).sort((a, b) => b.xp - a.xp);
      setCurrentLeaderboard(newCurrentLeaderboard);

      // Update locked leaderboard if unlocked
      if (isUnlocked) {
        setLockedLeaderboard(newCurrentLeaderboard);
        localStorage.setItem('lockedLeaderboard', JSON.stringify(newCurrentLeaderboard));
        const currentTime = Date.now();
        setLastLockedTime(new Date(currentTime).toLocaleString());
        localStorage.setItem('lastLockedTime', currentTime.toString());
      }

      // Calculate difference leaderboard
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

      // Include members only in locked leaderboard
      lockedLeaderboard.forEach((member) => {
        if (!memberDict[member.username]) {
          differenceList.push({
            username: member.username,
            difference: -member.xp,
          });
        }
      });

      // Sort by difference descending
      differenceList.sort((a, b) => b.difference - a.difference);
      setDifferenceLeaderboard(differenceList);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
        console.error('Error:', e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchGuildData();
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-4xl bg-gray-900 dark:bg-gray-900" suppressHydrationWarning>
      <h1 className="text-3xl font-bold text-center mb-6 text-white dark:text-gray-100">Guild XP Leaderboard</h1>
      <span className='text-3xl text-cyan-500 hover:text-cyan-700 transition-all duration-150'>weiku is very cute yes</span>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="unlock"
              checked={isUnlocked}
              onChange={(e) => setIsUnlocked(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="unlock" className="text-lg text-white dark:text-gray-100">Unlock Leaderboard</label>
          </div>
          {lastLockedTime && (
            <span className="text-sm text-white dark:text-gray-300">
              Last Locked: {lastLockedTime}
            </span>
          )}
        </div>
        <button
          onClick={fetchGuildData}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg text-white ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {isLoading ? 'Loading...' : 'Refresh Leaderboards'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:space-x-4">
        <LeaderboardTable
          title="Current Leaderboard"
          data={differenceLeaderboard}
          columns={[
            { key: 'username', label: 'Username' },
            { key: 'difference', label: 'XP Difference' },
          ]}
        />
        <LeaderboardTable
          title="Difference Leaderboard"
          data={currentLeaderboard}
          columns={[
            { key: 'username', label: 'Username' },
            { key: 'xp', label: 'XP' },
          ]}
        />
      </div>
    </div>
  );
}
