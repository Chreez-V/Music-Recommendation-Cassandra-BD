// components/client-header.tsx
'use client';

import { UserSelector } from '@/components/ui/user-selector';
import { Music } from 'lucide-react';
import Link from 'next/link';

export function ClientHeader() {
  const handleUserChange = (userId: number) => {
    console.log("User changed to:", userId);
    // Aquí puedes actualizar el estado del usuario
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <Music className="h-5 w-5 md:h-6 md:w-6" />
        <span className="sr-only md:not-sr-only">AuraBeat</span>
      </Link>
      <nav className="ml-auto flex gap-2">
        <UserSelector onUserChange={handleUserChange} />
      </nav>
    </header>
  );
}
