'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Track {
  id: number;
  title: string;
  artist: string;
  genre: string;
  listens: number;
}

export function LocalPopular({ city }: { city: string }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTracks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(
          `http://localhost:8080/api/recommendations/local?city=${encodeURIComponent(city)}`,
          {
            next: { revalidate: 60 } // Revalidar cada 60 segundos
          }
        );
        
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        
        const data = await res.json();
        setTracks(data.tracks || []);
      } catch (err) {
        console.error('Error loading tracks:', err);
        setError('Failed to load tracks');
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };

    // Cargar inmediatamente y cuando cambie la ciudad
    loadTracks();
    
    // Opcional: Configurar polling cada 30 segundos
    const interval = setInterval(loadTracks, 30000);
    return () => clearInterval(interval);
  }, [city]);

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error: {error}
        <Button 
          variant="outline" 
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Tracks in {city}</CardTitle>
        <CardDescription>
          Most popular songs in your location
          <span className="ml-2 text-xs text-muted-foreground">
            (Updated {new Date().toLocaleTimeString()})
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tracks.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No popular tracks found in {city}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead className="text-right">Listens</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tracks.map((track, index) => (
                <TableRow key={`${track.id}-${index}`}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{track.title}</TableCell>
                  <TableCell>{track.artist}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs">
                      {track.genre}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {track.listens?.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {tracks.length} tracks
        </div>
        <Button variant="outline">View All</Button>
      </CardFooter>
    </Card>
  );
}
