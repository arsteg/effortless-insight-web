'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface MentionUser {
  id: string
  name: string
  username?: string
  email?: string
  avatarUrl?: string
}

interface MentionAutocompleteProps {
  users: MentionUser[]
  searchTerm: string
  position: { top: number; left: number }
  onSelect: (user: MentionUser) => void
  onClose: () => void
  isVisible: boolean
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function MentionAutocomplete({
  users,
  searchTerm,
  position,
  onSelect,
  onClose,
  isVisible,
}: MentionAutocompleteProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase()
    return (
      user.name.toLowerCase().includes(search) ||
      user.username?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search)
    )
  }).slice(0, 5) // Limit to 5 results

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [searchTerm])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isVisible || filteredUsers.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % filteredUsers.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length)
          break
        case 'Enter':
        case 'Tab':
          e.preventDefault()
          if (filteredUsers[selectedIndex]) {
            onSelect(filteredUsers[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    },
    [isVisible, filteredUsers, selectedIndex, onSelect, onClose]
  )

  useEffect(() => {
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isVisible, handleKeyDown])

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible, onClose])

  if (!isVisible || filteredUsers.length === 0) return null

  return (
    <div
      ref={containerRef}
      className="absolute z-50 min-w-[200px] max-w-[300px] rounded-md border bg-popover shadow-md"
      style={{ top: position.top, left: position.left }}
    >
      <div className="py-1">
        {filteredUsers.map((user, index) => (
          <button
            key={user.id}
            className={cn(
              'flex w-full items-center gap-2 px-3 py-2 text-left text-sm',
              'hover:bg-accent hover:text-accent-foreground',
              index === selectedIndex && 'bg-accent text-accent-foreground'
            )}
            onClick={() => onSelect(user)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.name}</p>
              {user.username && (
                <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// Hook to manage mention autocomplete state
export function useMentionAutocomplete(users: MentionUser[]) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null)

  const openAutocomplete = (startIndex: number, pos: { top: number; left: number }) => {
    setMentionStartIndex(startIndex)
    setPosition(pos)
    setSearchTerm('')
    setIsOpen(true)
  }

  const closeAutocomplete = () => {
    setIsOpen(false)
    setSearchTerm('')
    setMentionStartIndex(null)
  }

  const updateSearchTerm = (term: string) => {
    setSearchTerm(term)
  }

  return {
    isOpen,
    searchTerm,
    position,
    mentionStartIndex,
    openAutocomplete,
    closeAutocomplete,
    updateSearchTerm,
  }
}

// Utility to parse mentions from text
export function parseMentions(text: string): { userId: string; username: string; name: string }[] {
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g
  const mentions: { userId: string; username: string; name: string }[] = []
  let match

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push({
      name: match[1],
      userId: match[2],
      username: match[1].toLowerCase().replace(/\s+/g, ''),
    })
  }

  return mentions
}

// Utility to render text with clickable mentions
export function renderTextWithMentions(text: string): string {
  // Convert @[Name](userId) format to styled spans
  return text.replace(
    /@\[([^\]]+)\]\(([^)]+)\)/g,
    '<span class="text-primary font-medium cursor-pointer hover:underline">@$1</span>'
  )
}

// Utility to insert mention into text
export function insertMention(
  text: string,
  mentionStartIndex: number,
  cursorPosition: number,
  user: MentionUser
): { newText: string; newCursorPosition: number } {
  // Replace @searchTerm with @[Name](userId)
  const beforeMention = text.slice(0, mentionStartIndex)
  const afterMention = text.slice(cursorPosition)
  const mentionText = `@[${user.name}](${user.id}) `

  return {
    newText: beforeMention + mentionText + afterMention,
    newCursorPosition: mentionStartIndex + mentionText.length,
  }
}
