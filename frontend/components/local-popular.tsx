'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function LocalPopular({ city }: { city: string }) {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTracks = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/recommendations/local?city=${encodeURIComponent(city)}`);
        const data = await res.json();
        
        // Manejar tanto null como array vacío
        setTracks(data.tracks || []);
      } catch (error) {
        console.error('Error loading tracks:', error);
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };

    loadTracks();
  }, [city]);

  if (loading) {
    return <div className="p-4">Cargando canciones populares en {city}...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Top Tracks in {city}</CardTitle>
          <CardDescription>Based on local listeners</CardDescription>
        </CardHeader>
        <CardContent>
          {tracks.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No se encontraron tracks populares en {city}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>Listens</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tracks.map((track, index) => (
                  <TableRow key={track.id || index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{track.title || 'Unknown'}</TableCell>
                    <TableCell>{track.artist || 'Unknown'}</TableCell>
                    <TableCell>{track.listens?.toLocaleString() || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            View All
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
