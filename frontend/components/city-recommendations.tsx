// components/city-recommendations.tsx
'use client';

import { useEffect, useState } from 'react';
import { Music, TrendingUp } from 'lucide-react';

interface Recommendation {
  song_id: number;
  title: string;
  artist: string;
  genre: string;
  score: number;
}

export function CityRecommendations({ city }: { city: string }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const res = await fetch(`http://localhost:8080/recomendaciones/ciudad/${encodeURIComponent(city)}`);
        const data = await res.json();
        setRecommendations(data.tracks || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [city]);

  if (loading) {
    return <div className="p-4">Cargando recomendaciones...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Top Tracks in Your Area</h2>
        <span className="text-sm text-muted-foreground">
          Based on listeners in {city}
        </span>
      </div>

      <div className="space-y-2">
        {recommendations.map((track, index) => (
          <div key={track.song_id} className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <span className="font-bold w-8 text-center">{index + 1}</span>
            <div className="flex-1 ml-4">
              <p className="font-medium">{track.title}</p>
              <p className="text-sm text-muted-foreground">{track.artist}</p>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-1" />
              {Math.round(track.score)}
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-muted-foreground">
        <p>Recommendations based on recent popularity in your city.</p>
      </div>
    </div>
  );
}
