'use client';

import { useState, useEffect } from 'react';
import { LeaderboardTable } from '@/component/LeaderboardTable';
import { StarField } from '@/component/StarField';

interface Member {
  username: string;
  xp: number;
}
interface DifferenceMember {
  [key: string]: string | number;
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

      const lockRes = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaderboard: current }),
      });

      if (!lockRes.ok) {
        const text = await lockRes.text();
        throw new Error(`Leaderboard API error: ${text}`);
      }

      const { lockedLeaderboard, lastLockedTime } = await lockRes.json();
      setLockedLeaderboard(lockedLeaderboard);
      setLastLockedTime(lastLockedTime);
      setLastUpdatedTime(Date.now());

      const lockedMap: Record<string, number> = {};
      lockedLeaderboard.forEach((m: Member) => {
        lockedMap[m.username] = m.xp;
      });

      const diffList: DifferenceMember[] = current.map((m: Member) => ({
        username: m.username,
        difference: m.xp - (lockedMap[m.username] || 0),
      }));

      lockedLeaderboard.forEach((m: Member) => {
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
    <div
      className="relative min-h-screen w-full overflow-hidden text-white bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('https://img.freepik.com/premium-vector/night-landscape-scene-with-full-moon-clouds-vector-illustration_263779-1357.jpg?semt=ais_hybrid&w=740')", backgroundSize: 'contain', backgroundPosition: '20% center',  }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 z-0" />
      <StarField maxStars={8} />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl flex flex-col items-center text-center rounded-2xl shadow-2xl bg-white/10 backdrop-blur-lg border border-white/10 p-6">
          <h1 className="text-4xl font-bold mb-6 animate-pulse bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
            ✨ Ruwr Guild Weekly XP ✨
          </h1>

          <div className="flex flex-col items-center mb-4 text-white space-y-2">
            <p><strong>Last Weekly Reset:</strong> {formatDate(lastLockedTime)}</p>
            <p><strong>Last Updated:</strong> {formatDate(lastUpdatedTime)}</p>
          </div>

          <button
            onClick={fetchGuildData}
            disabled={isLoading}
            className={`mb-6 px-4 py-2 rounded-xl text-white font-medium transition-all duration-150 ${
              isLoading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600'
            }`}
          >
            {isLoading ? 'Refreshing...' : 'Refresh Leaderboard'}
          </button>

          {error && (
            <div className="bg-red-200/90 border border-red-400 text-red-800 px-4 py-3 rounded-xl mb-4">
              Error: {error}
            </div>
          )}

          {!isLoading && (
            <div className="w-full rounded-2xl border border-white/10 shadow-lg backdrop-blur-sm p-4 bg-white/5">
              <LeaderboardTable
                data={differenceLeaderboard}
                columns={[
                  { key: 'username', label: 'Username' },
                  { key: 'difference', label: 'XP Gained' },
                ]}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}