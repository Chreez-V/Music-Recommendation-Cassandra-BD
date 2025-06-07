'use client'

import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface UserSelectorProps {
  onUserChange: (user: any) => void
  users: any[]
  initialCity: string
}

export function UserSelector({ onUserChange, users, initialCity }: UserSelectorProps) {
  const [selectedUser, setSelectedUser] = useState<any>(null)

  useEffect(() => {
    if (users.length > 0) {
      const user = users.find(u => u.city === initialCity) || users[0]
      setSelectedUser(user)
      onUserChange(user)
    }
  }, [users, initialCity])

  if (users.length === 0) {
    return <Skeleton className="h-10 w-[180px]" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {selectedUser ? `${selectedUser.name} (${selectedUser.city})` : 'Select User'}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-60 overflow-y-auto w-[200px]">
        {users.map((user) => (
          <DropdownMenuItem
            key={user.user_id}
            onClick={() => {
              setSelectedUser(user)
              onUserChange(user)
            }}
            className="cursor-pointer truncate"
          >
            {user.name} ({user.city})
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
