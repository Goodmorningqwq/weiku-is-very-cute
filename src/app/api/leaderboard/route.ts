import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

type Member = { username: string; xp: number };
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  const { leaderboard }: { leaderboard: Member[] } = await req.json();

  const { data: row, error } = await supabase
    .from('weekly_leaderboard')
    .select('*')
    .limit(1)
    .single();

  if (error || !row) {
    return NextResponse.json({ error: 'Could not fetch leaderboard' }, { status: 500 });
  }

  const now = Date.now();
  let lockedLeaderboard = row.locked;
  let lastLockedTime = row.last_locked_time;

  if (now - lastLockedTime >= ONE_WEEK_MS) {
    const { error: updateError } = await supabase
      .from('weekly_leaderboard')
      .update({
        locked: leaderboard,
        last_locked_time: now,
      })
      .eq('id', row.id);

    if (!updateError) {
      lockedLeaderboard = leaderboard;
      lastLockedTime = now;
    }
  }

  return NextResponse.json({ lockedLeaderboard, lastLockedTime });
}
