export async function getMonthlyGenres(year: string) {
  const res = await fetch(`http://localhost:8080/api/olap/monthly?year=${year}`)
  if (!res.ok) {
    throw new Error('Failed to fetch monthly OLAP data')
  }
  return await res.json()
}

export async function getQuarterlyGenres(year: string) {
  const res = await fetch(`http://localhost:8080/api/olap/quarterly?year=${year}`)
  if (!res.ok) {
    throw new Error('Failed to fetch quarterly OLAP data')
  }
  return await res.json()
}

export async function getUserGenres() {
  const res = await fetch('http://localhost:8080/api/olap/by-user')
  if (!res.ok) {
    throw new Error('Failed to fetch user OLAP data')
  }
  return await res.json()
}
