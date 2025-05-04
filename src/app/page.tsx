'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';


interface Member {
  username: string;
  xp: number;
}

export default function Home() {
  const [topMembers, setTopMembers] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
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

        const current = Object.values(memberDict)
          .sort((a, b) => b.xp - a.xp)
          .slice(0, 3); // Limit to top 3
        setTopMembers(current);
      } catch (e) {
        if (e instanceof Error) setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuildData();
  }, []);

  const medalEmoji = ['🥇', '🥈', '🥉'];

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-8">
      <nav className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold">🌟 Ruwr </h1>
        <Link
          href="/leaderboard"
          className="w-full max-w-xs flex items-center justify-center text-center rounded-2xl shadow-2xl text-2xl font-bold py-3 animate-pulse bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 text-white drop-shadow-lg hover:bg-gradient-to-r hover:from-cyan-1000 hover:via-pink-1000 hover:to-purple-1000 transition"
        >
          EXP Leaderboard →
        </Link>
      </nav>

      <section className="text-center mb-10">
        <h2 className="text-4xl font-bold mb-4">Welcome to the Cat Society</h2>
        <p className="text-lg text-white/70 italic">
          "Together we rise, stronger every day!!"
        </p>
      </section>

      <div className="flex justify-center mb-10">
        <input
          type="text"
          placeholder="Search members..."
          className="w-full max-w-md px-4 py-2 rounded-xl bg-white/10 border border-white/20 placeholder-white/70 text-white transition-all duration-300 focus:outline-none hover:bg-white/20"
        />
      </div>

      <section className="max-w-3xl mx-auto text-center">
        <h3 className="text-2xl font-semibold mb-6">Lifetime Top EXP 🏆</h3>
        {error && (
          <div className="bg-red-200/90 border border-red-400 text-red-800 px-4 py-3 rounded-xl mb-4">
            Error: {error}
          </div>
        )}
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {topMembers.map((member, index) => (
              <div
                key={member.username}
                className={`rounded-xl p-4 shadow-md transition ${
                  index === 0
                    ? 'bg-yellow-600/20 border border-yellow-500'
                    : index === 1
                    ? 'bg-gray-400/20 border border-gray-400'
                    : 'bg-orange-500/20 border border-orange-500'
                }`}
              >
                <div className="text-4xl mb-2">{medalEmoji[index]}</div>
                <h4 className="text-xl font-bold">{member.username}</h4>
                <p className="text-sm text-white/70">{member.xp} XP</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}