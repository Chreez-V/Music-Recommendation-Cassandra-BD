export interface Track {
  id: number;
  title: string;
  artist: string;
  genre: string;
  listens: number;
  score: number;
}

export async function getLocalRecommendations(city: string): Promise<Track[]> {
  try {
    const res = await fetch(`http://localhost:8080/api/recommendations/local?city=${encodeURIComponent(city)}`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    return data.tracks || [];
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    // Datos de prueba por si falla la conexión
    return [
      {
        id: 1,
        title: "Golden Hour",
        artist: "JVKE",
        genre: "Pop",
        listens: 12453,
        score: 13698
      },
      {
        id: 2,
        title: "Blinding Lights",
        artist: "The Weeknd",
        genre: "Pop",
        listens: 10982,
        score: 12080
      },
      {
        id: 3,
        title: "As It Was",
        artist: "Harry Styles",
        genre: "Pop",
        listens: 9876,
        score: 10863
      }
    ];
  }
}
