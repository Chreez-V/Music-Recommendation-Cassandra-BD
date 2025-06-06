import type { Metadata } from "next"
import Link from "next/link"
import { Music, TrendingUp, MapPin, BarChart3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GenreRecommendations } from "@/components/genre-recommendations"
import { LocalPopular } from "@/components/local-popular"
import { PersonalRecommendations } from "@/components/personal-recommendations"
import { ListeningStats } from "@/components/listening-stats"
import { ClientHeader } from "@/components/ClientHeader";

export const metadata: Metadata = {
  title: "Music Recommendation System",
  description: "A personalized music recommendation system",
}



export default function DashboardPage() {

  const handleUserChange = (userId: number) => {
    console.log("User changed to:", userId);
    // Aquí puedes actualizar el estado global o hacer fetch de los datos del nuevo usuario
    // Por ejemplo, podrías usar React Context o Zustand para manejar el estado del usuario
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
<ClientHeader />
      {/*
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Music className="h-5 w-5 md:h-6 md:w-6" />
          <span className="sr-only md:not-sr-only">AuraBeat</span>
        </Link>
        <nav className="ml-auto flex gap-2">
            <UserSelector onUserChange={handleUserChange} />
          <Button size="sm">Sign Up</Button>
        </nav>
      </header>
      */}
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tracks</CardTitle>
              <Music className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,543</div>
              <p className="text-xs text-muted-foreground">+20% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Listening Time</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">267 hrs</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Genre</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Indie Rock</div>
              <p className="text-xs text-muted-foreground">32% of your listening</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Location</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">San Francisco</div>
              <p className="text-xs text-muted-foreground">Based on your IP address</p>
            </CardContent>
          </Card>
        </div>
        <Tabs defaultValue="genre">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="genre">By Genre</TabsTrigger>
            <TabsTrigger value="local">Local Hits</TabsTrigger>
            <TabsTrigger value="recommended">For You</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>
          <TabsContent value="genre" className="space-y-4">
            <GenreRecommendations />
          </TabsContent>
          <TabsContent value="local" className="space-y-4">
            <LocalPopular />
          </TabsContent>
          <TabsContent value="recommended" className="space-y-4">
            <PersonalRecommendations />
          </TabsContent>
          <TabsContent value="stats" className="space-y-4">
            <ListeningStats />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
