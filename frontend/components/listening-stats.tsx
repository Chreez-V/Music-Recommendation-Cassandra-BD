"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Calendar } from "lucide-react"
import { getMonthlyGenres, getQuarterlyGenres, getUserGenres } from "@/lib/olap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const genreColors = {
  pop: "#8884d8",
  rock: "#82ca9d",
  hiphop: "#ffc658",
  electronic: "#ff8042",
  jazz: "#0088fe",
  classical: "#00c49f",
}

export function ListeningStats() {
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [viewType, setViewType] = useState<"monthly" | "quarterly" | "byUser">("monthly")
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        let result
        if (viewType === "monthly") {
          result = await getMonthlyGenres(year)
        } else if (viewType === "quarterly") {
          result = await getQuarterlyGenres(year)
        } else {
          result = await getUserGenres()
        }
        setData(result)
      } catch (error) {
        console.error("Error fetching OLAP data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [viewType, year])

  // Obtener todos los géneros únicos presentes en los datos
  const allGenres = Array.from(
    new Set(
      data.flatMap(item => 
        Object.keys(item).filter(key => key !== "month" && key !== "quarter" && key !== "userId" && key !== "userName")
      )
    )
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Análisis OLAP de Escuchas</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Datos reales agregados desde Cassandra
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select 
            value={viewType} 
            onValueChange={(v: "monthly" | "quarterly" | "byUser") => setViewType(v)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Vista" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Por Mes</SelectItem>
              <SelectItem value="quarterly">Por Trimestre</SelectItem>
              <SelectItem value="byUser">Por Usuario</SelectItem>
            </SelectContent>
          </Select>

          {viewType !== "byUser" && (
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Gráfico principal */}
      <Card>
        <CardHeader>
          <CardTitle>
            {viewType === "monthly" ? "Escuchas Mensuales por Género" :
             viewType === "quarterly" ? "Escuchas Trimestrales por Género" :
             "Escuchas por Usuario y Género"}
          </CardTitle>
          <CardDescription>
            {viewType !== "byUser" && `Año: ${year}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: viewType === "byUser" ? 100 : 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey={viewType === "monthly" ? "month" : viewType === "quarterly" ? "quarter" : "userName"} 
                    angle={-45} 
                    textAnchor="end"
                    height={viewType === "byUser" ? 100 : 60}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {allGenres.map(genre => (
                    <Bar 
                      key={genre} 
                      dataKey={genre} 
                      fill={genreColors[genre as keyof typeof genreColors] || "#8884d8"} 
                      name={genre.charAt(0).toUpperCase() + genre.slice(1)} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p className="text-muted-foreground">No hay datos disponibles</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabla de datos */}
      <Card>
        <CardHeader>
          <CardTitle>Datos Detallados</CardTitle>
          <CardDescription>
            {viewType === "monthly" ? "Escuchas por mes y género" :
             viewType === "quarterly" ? "Escuchas por trimestre y género" :
             "Escuchas por usuario y género"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{viewType === "monthly" ? "Mes" : viewType === "quarterly" ? "Trimestre" : "Usuario"}</TableHead>
                  {allGenres.map(genre => (
                    <TableHead key={genre} className="text-right capitalize">{genre}</TableHead>
                  ))}
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.month || row.quarter || row.userId}>
                    <TableCell>{row.month || row.quarter || row.userName || `Usuario ${row.userId}`}</TableCell>
                    {allGenres.map(genre => (
                      <TableCell key={genre} className="text-right">{row[genre] || 0}</TableCell>
                    ))}
                    <TableCell className="text-right font-medium">
                      {allGenres.reduce((sum, genre) => sum + (row[genre] || 0), 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
