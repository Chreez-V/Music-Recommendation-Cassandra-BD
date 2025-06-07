"use client"

import { useEffect, useState } from "react"
import { Play, Plus, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

interface Track {
  id: number
  title: string
  artist: string
  genre: string
  listen_date?: string
}

export function PersonalRecommendations({ userId }: { userId?: number }) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserListens = async () => {
      try {
        if (!userId) {
          setTracks([])
          setError("No user selected")
          setLoading(false)
          return
        }

      setLoading(true)
        setError(null)
        
        const listensRes = await fetch(`http://localhost:8080/users/${userId}/listens`)
        
        if (!listensRes.ok) {
          const errorData = await listensRes.json()
          throw new Error(errorData.error || 'Failed to fetch user listens')
        }
        
        const listensData = await listensRes.json()
        
        // Mapear directamente los datos que ahora vienen con más información del backend
        const tracksWithDetails = listensData.map((listen: any) => ({
          id: listen.song_id,
          title: listen.song_title,
          artist: listen.artist,
          genre: listen.genre,
          listen_date: listen.listen_date
        }))
        setTracks(tracksWithDetails.filter(Boolean))
      } catch (err) {
        console.error('Error fetching user listens:', err)
        setError('Failed to load your listening history')
      } finally {
        setLoading(false)
      }
    }

    fetchUserListens()
  }, [userId])

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Listening History</h2>
          <p className="text-muted-foreground">Loading your recently played tracks...</p>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Listening History</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Your Listening History</h2>
        <p className="text-muted-foreground">
          {tracks.length > 0 
            ? "Tracks you've recently listened to" 
            : "No listening history found"}
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="mb-4 text-base sm:text-lg font-semibold">Recently Played</h3>
        <div className="space-y-4">
          {tracks.map((track) => (
            <div key={`${track.id}-${track.listen_date}`} className="flex items-center gap-3 sm:gap-4">
              <div className="relative h-12 w-12 sm:h-16 sm:w-16 overflow-hidden rounded-md bg-muted flex items-center justify-center">
                <Music className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm sm:text-base line-clamp-1">{track.title}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{track.artist}</p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {track.genre} • {track.listen_date ? new Date(track.listen_date).toLocaleDateString() : ''}
                </p>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
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
