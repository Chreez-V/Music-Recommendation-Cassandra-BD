// lib/api/olap.ts
export interface OLAPQueryResult {
  dimension: string;
  genres: {
    genre: string;
    count: number;
  }[];
}

export async function getMonthlyGenres(year: string): Promise<OLAPQueryResult[]> {
  try {
    const res = await fetch(`http://localhost:8080/api/olap/monthly?year=${year}`);
    return await res.json();
  } catch (error) {
    console.error('Error fetching OLAP data:', error);
    return [];
  }
}

export async function getQuarterlyGenres(year: string): Promise<OLAPQueryResult[]> {
  try {
    const res = await fetch(`http://localhost:8080/api/olap/quarterly?year=${year}`);
    return await res.json();
  } catch (error) {
    console.error('Error fetching OLAP data:', error);
    return [];
  }
}

export async function getUserGenres(): Promise<OLAPQueryResult[]> {
  try {
    const res = await fetch('http://localhost:8080/api/olap/by-user');
    return await res.json();
  } catch (error) {
    console.error('Error fetching OLAP data:', error);
    return [];
  }
}
