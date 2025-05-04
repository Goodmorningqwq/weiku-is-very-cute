import { Card, CardContent } from '@/components/ui/card';
import { notFound } from 'next/navigation';

type PageProps = {
  params: {
    playerName: string;
  };
};

export default async function PlayerStatsPage({ params }: PageProps) {
  const { playerName } = params;

  const res = await fetch(`https://api.wynncraft.com/v3/player/${playerName}`, {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!res.ok) return notFound();

  const data = await res.json();
  const player = data.data[0]; // Wynncraft API returns an array in `data`

  if (!player) return notFound();

  return (
    <main className="max-w-2xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-4">{player.username}</h1>
      <Card>
        <CardContent className="p-4">
          <p><strong>Rank:</strong> {player.rank}</p>
          <p><strong>Total Level:</strong> {player.meta.level}</p>
          <p><strong>Playtime:</strong> {player.meta.playtime} minutes</p>
          <p><strong>First Join:</strong> {player.meta.firstJoin}</p>
          <p><strong>Last Join:</strong> {player.meta.lastJoin}</p>
        </CardContent>
      </Card>
    </main>
  );
}
