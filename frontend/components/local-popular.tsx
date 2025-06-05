"use client"

import Image from "next/image"
import { Play, Plus, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for local popular songs
const localSongs = [
  {
    id: 1,
    title: "Golden Hour",
    artist: "JVKE",
    album: "this is what ____ feels like (Vol. 1-4)",
    listeners: 12453,
    duration: "3:29",
    image: "/placeholder.svg?height=80&width=80&text=Golden+Hour",
  },
  {
    id: 2,
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    listeners: 10982,
    duration: "3:20",
    image: "/placeholder.svg?height=80&width=80&text=Blinding+Lights",
  },
  {
    id: 3,
    title: "As It Was",
    artist: "Harry Styles",
    album: "Harry's House",
    listeners: 9876,
    duration: "2:47",
    image: "/placeholder.svg?height=80&width=80&text=As+It+Was",
  },
  {
    id: 4,
    title: "Heat Waves",
    artist: "Glass Animals",
    album: "Dreamland",
    listeners: 8765,
    duration: "3:58",
    image: "/placeholder.svg?height=80&width=80&text=Heat+Waves",
  },
  {
    id: 5,
    title: "Shivers",
    artist: "Ed Sheeran",
    album: "=",
    listeners: 7654,
    duration: "3:27",
    image: "/placeholder.svg?height=80&width=80&text=Shivers",
  },
  {
    id: 6,
    title: "Stay",
    artist: "The Kid LAROI & Justin Bieber",
    album: "F*CK LOVE 3: OVER YOU",
    listeners: 6543,
    duration: "2:21",
    image: "/placeholder.svg?height=80&width=80&text=Stay",
  },
  {
    id: 7,
    title: "Enemy",
    artist: "Imagine Dragons & JID",
    album: "Mercury - Act 1",
    listeners: 5432,
    duration: "2:53",
    image: "/placeholder.svg?height=80&width=80&text=Enemy",
  },
  {
    id: 8,
    title: "INDUSTRY BABY",
    artist: "Lil Nas X & Jack Harlow",
    album: "MONTERO",
    listeners: 4321,
    duration: "3:32",
    image: "/placeholder.svg?height=80&width=80&text=INDUSTRY+BABY",
  },
]

export function LocalPopular() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Popular in San Francisco</h2>
          <p className="text-muted-foreground">What people in your city are listening to right now</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Tracks in Your Area</CardTitle>
          <CardDescription>Based on listeners in San Francisco, CA</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] sm:w-[80px]">#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Album</TableHead>
                <TableHead className="hidden md:table-cell">
                  <Users className="h-4 w-4" />
                </TableHead>
                <TableHead className="text-right">
                  <span className="sr-only sm:not-sr-only">Duration</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localSongs.map((song, index) => (
                <TableRow key={song.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="relative h-8 w-8 sm:h-10 sm:w-10 overflow-hidden rounded">
                        <Image src={song.image || "/placeholder.svg"} alt={song.title} fill className="object-cover" />
                      </div>
                      <div>
                        <div className="font-medium text-sm sm:text-base line-clamp-1">{song.title}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{song.artist}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{song.album}</TableCell>
                  <TableCell className="hidden md:table-cell">{song.listeners.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <span className="text-xs sm:text-sm">{song.duration}</span>
                      <Button size="icon" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8">
                        <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8 hidden sm:flex">
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            View All Local Tracks
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
