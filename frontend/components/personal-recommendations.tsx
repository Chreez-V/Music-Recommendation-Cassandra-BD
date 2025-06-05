"use client"

import Image from "next/image"
import { Play, Plus, ThumbsDown, ThumbsUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

// Mock data for personalized recommendations
const recommendedPlaylists = [
  {
    id: 1,
    title: "Discover Weekly",
    description: "Your weekly mixtape of fresh music",
    image: "/placeholder.svg?height=200&width=200&text=Discover+Weekly",
    tracks: 30,
  },
  {
    id: 2,
    title: "Release Radar",
    description: "New releases from artists you follow",
    image: "/placeholder.svg?height=200&width=200&text=Release+Radar",
    tracks: 25,
  },
  {
    id: 3,
    title: "Daily Mix 1",
    description: "Indie rock and alternative",
    image: "/placeholder.svg?height=200&width=200&text=Daily+Mix+1",
    tracks: 20,
  },
  {
    id: 4,
    title: "Daily Mix 2",
    description: "Hip hop and R&B",
    image: "/placeholder.svg?height=200&width=200&text=Daily+Mix+2",
    tracks: 20,
  },
  {
    id: 5,
    title: "Daily Mix 3",
    description: "Electronic and dance",
    image: "/placeholder.svg?height=200&width=200&text=Daily+Mix+3",
    tracks: 20,
  },
]

const recommendedTracks = [
  {
    id: 1,
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    image: "/placeholder.svg?height=60&width=60&text=Levitating",
    reason: "Based on your recent listening",
  },
  {
    id: 2,
    title: "Save Your Tears",
    artist: "The Weeknd",
    album: "After Hours",
    image: "/placeholder.svg?height=60&width=60&text=Save+Your+Tears",
    reason: "You might like this",
  },
  {
    id: 3,
    title: "Leave The Door Open",
    artist: "Bruno Mars, Anderson .Paak, Silk Sonic",
    album: "An Evening with Silk Sonic",
    image: "/placeholder.svg?height=60&width=60&text=Leave+The+Door+Open",
    reason: "Similar to songs you like",
  },
  {
    id: 4,
    title: "Peaches",
    artist: "Justin Bieber ft. Daniel Caesar, Giveon",
    album: "Justice",
    image: "/placeholder.svg?height=60&width=60&text=Peaches",
    reason: "Trending in your genres",
  },
  {
    id: 5,
    title: "Kiss Me More",
    artist: "Doja Cat ft. SZA",
    album: "Planet Her",
    image: "/placeholder.svg?height=60&width=60&text=Kiss+Me+More",
    reason: "New release from an artist you follow",
  },
]

export function PersonalRecommendations() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Recommended for You</h2>
        <p className="text-muted-foreground">Personalized recommendations based on your listening history</p>
      </div>

      <div>
        <h3 className="mb-4 text-base sm:text-lg font-semibold">Recommended Playlists</h3>
        <ScrollArea>
          <div className="flex gap-3 sm:gap-4 pb-4">
            {recommendedPlaylists.map((playlist) => (
              <Card key={playlist.id} className="min-w-[180px] sm:min-w-[250px] max-w-[180px] sm:max-w-[250px]">
                <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
                  <div className="relative aspect-square w-full overflow-hidden rounded-md">
                    <Image
                      src={playlist.image || "/placeholder.svg"}
                      alt={playlist.title}
                      fill
                      className="object-cover"
                    />
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-2 right-2 h-8 w-8 sm:h-10 sm:w-10 rounded-full"
                    >
                      <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-1 sm:pt-2">
                  <CardTitle className="line-clamp-1 text-sm sm:text-base">{playlist.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs sm:text-sm">{playlist.description}</CardDescription>
                </CardContent>
                <CardFooter className="p-3 sm:p-4 pt-0">
                  <div className="text-xs sm:text-sm text-muted-foreground">{playlist.tracks} tracks</div>
                </CardFooter>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <Separator />

      <div>
        <h3 className="mb-4 text-base sm:text-lg font-semibold">Songs You Might Like</h3>
        <div className="space-y-4">
          {recommendedTracks.map((track) => (
            <div key={track.id} className="flex items-center gap-3 sm:gap-4">
              <div className="relative h-12 w-12 sm:h-16 sm:w-16 overflow-hidden rounded-md">
                <Image src={track.image || "/placeholder.svg"} alt={track.title} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm sm:text-base line-clamp-1">{track.title}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{track.artist}</p>
                <p className="text-xs text-muted-foreground hidden sm:block">{track.reason}</p>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Button size="icon" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8 hidden sm:flex">
                  <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8 hidden sm:flex">
                  <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8">
                  <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
