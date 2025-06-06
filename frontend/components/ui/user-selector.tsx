'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { User } from '@/lib/users';
import { getUsers } from '@/lib/users';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function UserSelector() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getUsers();
        console.log('Loaded users:', data); // Depuración
        
        if (data.length === 0) {
          setError('No se encontraron usuarios en la base de datos');
        } else {
          setUsers(data);
          setSelectedUser(data[0]);
        }
      } catch (err) {
        console.error('Error loading users:', err);
        setError('Error al cargar usuarios. Verifica la conexión al backend.');
      } finally {
        setLoading(false);
      }
    }
    
    loadUsers();
  }, []);

  if (loading) {
    return <Button variant="outline" disabled>Cargando usuarios...</Button>;
  }

  if (error) {
    return <Button variant="outline" disabled>{error}</Button>;
  }

  if (users.length === 0) {
    return <Button variant="outline" disabled>No hay usuarios disponibles</Button>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {selectedUser ? `${selectedUser.name} (${selectedUser.city})` : 'Seleccionar usuario'}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-60 overflow-y-auto">
        {users.map((user) => (
          <DropdownMenuItem
            key={user.user_id}
            onClick={() => setSelectedUser(user)}
          >
            {user.name} ({user.city})
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
