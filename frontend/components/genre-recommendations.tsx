"use client"

import { useState } from "react"
import Image from "next/image"
import { Play, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for genre-based recommendations
const genreData = {
  "Indie Rock": [
    { id: 1, title: "Midnight City", artist: "M83", album: "Hurry Up, We're Dreaming", duration: "4:03" },
    { id: 2, title: "Do I Wanna Know?", artist: "Arctic Monkeys", album: "AM", duration: "4:32" },
    { id: 3, title: "Myth", artist: "Beach House", album: "Bloom", duration: "4:18" },
    { id: 4, title: "The Less I Know The Better", artist: "Tame Impala", album: "Currents", duration: "3:38" },
    { id: 5, title: "Two Weeks", artist: "Grizzly Bear", album: "Veckatimest", duration: "4:03" },
  ],
  "Hip Hop": [
    { id: 1, title: "SICKO MODE", artist: "Travis Scott", album: "ASTROWORLD", duration: "5:12" },
    { id: 2, title: "DNA.", artist: "Kendrick Lamar", album: "DAMN.", duration: "3:05" },
    { id: 3, title: "Alright", artist: "Kendrick Lamar", album: "To Pimp a Butterfly", duration: "3:39" },
    { id: 4, title: "EARFQUAKE", artist: "Tyler, The Creator", album: "IGOR", duration: "3:10" },
    { id: 5, title: "Hotline Bling", artist: "Drake", album: "Views", duration: "4:27" },
  ],
  Electronic: [
    { id: 1, title: "Get Lucky", artist: "Daft Punk", album: "Random Access Memories", duration: "6:07" },
    { id: 2, title: "Strobe", artist: "deadmau5", album: "For Lack of a Better Name", duration: "10:33" },
    { id: 3, title: "Flume", artist: "Bon Iver", album: "Bon Iver", duration: "3:39" },
    { id: 4, title: "Lean On", artist: "Major Lazer & DJ Snake", album: "Peace Is The Mission", duration: "2:56" },
    {
      id: 5,
      title: "Scary Monsters and Nice Sprites",
      artist: "Skrillex",
      album: "Scary Monsters and Nice Sprites",
      duration: "4:03",
    },
  ],
  Pop: [
    {
      id: 1,
      title: "Bad Guy",
      artist: "Billie Eilish",
      album: "WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?",
      duration: "3:14",
    },
    { id: 2, title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", duration: "3:20" },
    { id: 3, title: "Don't Start Now", artist: "Dua Lipa", album: "Future Nostalgia", duration: "3:03" },
    { id: 4, title: "Watermelon Sugar", artist: "Harry Styles", album: "Fine Line", duration: "2:54" },
    { id: 5, title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", duration: "3:23" },
  ],
}

export function GenreRecommendations() {
  const [selectedGenre, setSelectedGenre] = useState("Indie Rock")
  const songs = genreData[selectedGenre as keyof typeof genreData]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2 sm:mb-0">Top Songs by Genre</h2>
        <Select value={selectedGenre} onValueChange={setSelectedGenre}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Indie Rock">Indie Rock</SelectItem>
            <SelectItem value="Hip Hop">Hip Hop</SelectItem>
            <SelectItem value="Electronic">Electronic</SelectItem>
            <SelectItem value="Pop">Pop</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {songs.map((song) => (
          <Card key={song.id} className="overflow-hidden">
            <CardHeader className="p-0">
              <div className="relative h-48 w-full">
                <Image
                  src={`/placeholder.svg?height=200&width=400&text=${encodeURIComponent(song.title)}`}
                  alt={song.title}
                  fill
                  className="object-cover"
                />
                <Button size="icon" variant="secondary" className="absolute bottom-2 right-2 h-10 w-10 rounded-full">
                  <Play className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="line-clamp-1">{song.title}</CardTitle>
              <CardDescription className="line-clamp-1">{song.artist}</CardDescription>
            </CardContent>
            <CardFooter className="flex justify-between p-4 pt-0">
              <div className="text-sm text-muted-foreground">{song.album}</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{song.duration}</span>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
