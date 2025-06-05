"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for listening statistics
const monthlyData = [
  { month: "Jan", pop: 45, rock: 32, hiphop: 18, electronic: 25, jazz: 8, classical: 5 },
  { month: "Feb", pop: 50, rock: 35, hiphop: 20, electronic: 28, jazz: 10, classical: 7 },
  { month: "Mar", pop: 35, rock: 40, hiphop: 25, electronic: 30, jazz: 12, classical: 8 },
  { month: "Apr", pop: 30, rock: 45, hiphop: 30, electronic: 35, jazz: 15, classical: 10 },
  { month: "May", pop: 25, rock: 50, hiphop: 35, electronic: 40, jazz: 18, classical: 12 },
  { month: "Jun", pop: 20, rock: 55, hiphop: 40, electronic: 45, jazz: 20, classical: 15 },
  { month: "Jul", pop: 15, rock: 60, hiphop: 45, electronic: 50, jazz: 22, classical: 18 },
  { month: "Aug", pop: 20, rock: 55, hiphop: 50, electronic: 45, jazz: 25, classical: 20 },
  { month: "Sep", pop: 25, rock: 50, hiphop: 45, electronic: 40, jazz: 20, classical: 15 },
  { month: "Oct", pop: 30, rock: 45, hiphop: 40, electronic: 35, jazz: 15, classical: 10 },
  { month: "Nov", pop: 35, rock: 40, hiphop: 35, electronic: 30, jazz: 10, classical: 5 },
  { month: "Dec", pop: 40, rock: 35, hiphop: 30, electronic: 25, jazz: 8, classical: 3 },
]

const genreColors = {
  pop: "#8884d8",
  rock: "#82ca9d",
  hiphop: "#ffc658",
  electronic: "#ff8042",
  jazz: "#0088fe",
  classical: "#00c49f",
}

export function ListeningStats() {
  const [year, setYear] = useState("2023")
  const [viewType, setViewType] = useState("monthly")

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Listening Statistics</h2>
          <p className="text-muted-foreground text-sm sm:text-base">Track your music listening habits over time</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{year}</span>
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[80px] sm:w-[100px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2021">2021</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tracks by Genre</CardTitle>
              <CardDescription>Number of tracks listened by genre each month</CardDescription>
            </div>
            <Select value={viewType} onValueChange={setViewType}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] sm:h-[400px]">
            <ChartContainer
              config={{
                rock: {
                  label: "Rock",
                  color: "hsl(var(--chart-1))",
                },
                pop: {
                  label: "Pop",
                  color: "hsl(var(--chart-2))",
                },
                hiphop: {
                  label: "Hip Hop",
                  color: "hsl(var(--chart-3))",
                },
                electronic: {
                  label: "Electronic",
                  color: "hsl(var(--chart-4))",
                },
                jazz: {
                  label: "Jazz",
                  color: "hsl(var(--chart-5))",
                },
                classical: {
                  label: "Classical",
                  color: "hsl(var(--chart-6))",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} width={30} />
                  <Bar dataKey="rock" stackId="a" fill="var(--color-rock)" />
                  <Bar dataKey="pop" stackId="a" fill="var(--color-pop)" />
                  <Bar dataKey="hiphop" stackId="a" fill="var(--color-hiphop)" />
                  <Bar dataKey="electronic" stackId="a" fill="var(--color-electronic)" />
                  <Bar dataKey="jazz" stackId="a" fill="var(--color-jazz)" />
                  <Bar dataKey="classical" stackId="a" fill="var(--color-classical)" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Genres</CardTitle>
            <CardDescription>Your most listened genres in {year}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: genreColors.rock }}></div>
                  <span>Rock</span>
                </div>
                <span className="font-medium">45%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: genreColors.pop }}></div>
                  <span>Pop</span>
                </div>
                <span className="font-medium">25%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: genreColors.electronic }}></div>
                  <span>Electronic</span>
                </div>
                <span className="font-medium">15%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: genreColors.hiphop }}></div>
                  <span>Hip Hop</span>
                </div>
                <span className="font-medium">10%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: genreColors.jazz }}></div>
                  <span>Jazz</span>
                </div>
                <span className="font-medium">3%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: genreColors.classical }}></div>
                  <span>Classical</span>
                </div>
                <span className="font-medium">2%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listening Activity</CardTitle>
            <CardDescription>Your listening patterns in {year}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm">Total Tracks</span>
                  <span className="text-sm font-medium">2,543</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 w-[85%] rounded-full bg-primary"></div>
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm">Total Hours</span>
                  <span className="text-sm font-medium">267 hrs</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 w-[70%] rounded-full bg-primary"></div>
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm">Unique Artists</span>
                  <span className="text-sm font-medium">342</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 w-[60%] rounded-full bg-primary"></div>
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm">Unique Albums</span>
                  <span className="text-sm font-medium">189</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 w-[45%] rounded-full bg-primary"></div>
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm">Peak Listening Day</span>
                  <span className="text-sm font-medium">Saturday</span>
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm">Peak Listening Time</span>
                  <span className="text-sm font-medium">7:00 PM - 10:00 PM</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
