'use client';

import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface UserSelectorProps {
  onUserChange: (user: { city: string }) => void;
  users: any[];
  initialCity: string;
}

export function UserSelector({ onUserChange, users, initialCity }: UserSelectorProps) {
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    // Establecer usuario inicial
    if (users.length > 0) {
      const user = users.find(u => u.city === initialCity) || users[0];
      setSelectedUser(user);
    }
  }, [users, initialCity]);

  if (users.length === 0) {
    return <Button variant="outline" disabled>No hay usuarios</Button>;
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
            onClick={() => {
              setSelectedUser(user);
              onUserChange({ city: user.city });
            }}
            className="cursor-pointer"
          >
            {user.name} ({user.city})
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
