'use client';

import { UserSelector } from '@/components/ui/user-selector';
import { Music } from 'lucide-react';
import Link from 'next/link';

interface ClientHeaderProps {
  onCityChange: (city: string) => void;
  users: any[];
  initialCity: string;
}

export function ClientHeader({ onCityChange, users, initialCity }: ClientHeaderProps) {
  const handleUserChange = (user: { city: string }) => {
    onCityChange(user.city);
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <Music className="h-5 w-5 md:h-6 md:w-6" />
        <span className="sr-only md:not-sr-only">AuraBeat</span>
      </Link>
      <nav className="ml-auto flex gap-2">
        <UserSelector 
          onUserChange={handleUserChange} 
          users={users}
          initialCity={initialCity}
        />
      </nav>
    </header>
  );
}
