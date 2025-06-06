export interface User {
  user_id: number;
  name: string;
  city: string;
}

export async function getUsers(): Promise<User[]> {
  try {
    const res = await fetch('http://localhost:8080/usuario', {
      mode: 'cors', // Asegura que es una petición CORS
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      throw new Error(`Error HTTP! estado: ${res.status}`);
    }
    
    const data = await res.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Formato de respuesta inesperado');
    }
    
    console.log('Usuarios recibidos:', data);
    return data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    
    // Datos de prueba para desarrollo
    return [
      { user_id: 1, name: 'Juan Pérez (Demo)', city: 'Bogotá' },
      { user_id: 2, name: 'María Gómez (Demo)', city: 'Medellín' },
      { user_id: 3, name: 'Carlos Ruiz (Demo)', city: 'Cali' }
    ];
  }
}
