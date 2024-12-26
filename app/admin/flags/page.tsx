'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Role } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function FeatureFlags() {
  const { data: session } = useSession()
  const [flags, setFlags] = useState<{ name: string; value: boolean }[]>([])
  const [newFlagName, setNewFlagName] = useState('')

  useEffect(() => {
    async function fetchFlags() {
      const res = await fetch('/api/flags')
      const data = await res.json()
      setFlags(data)
    }
    fetchFlags()
  }, [])

  const toggleFlag = async (name: string) => {
    const flag = flags.find((f) => f.name === name)
    if (flag) {
      const res = await fetch('/api/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, value: !flag.value }),
      })
      const updatedFlag = await res.json()
      setFlags((prevFlags) =>
        prevFlags.map((f) => (f.name === name ? updatedFlag : f))
      )
    }
  }

  const addFlag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFlagName.trim()) return

    try {
      const res = await fetch('/api/flags', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFlagName, value: false }),
      })
      const newFlag = await res.json()
      setFlags((prevFlags) => [...prevFlags, newFlag])
      setNewFlagName('')
    } catch (error) {
      console.error('Failed to add flag:', error)
    }
  }

  if (session?.user?.role !== Role.ADMIN) {
    return <p>You are not authorized to view this page!</p>
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Feature Flags</h1>

      <form onSubmit={addFlag} className="mb-6 flex gap-2">
        <Input
          type="text"
          value={newFlagName}
          onChange={(e) => setNewFlagName(e.target.value)}
          placeholder="Enter new flag name"
          className="flex-1"
        />
        <Button type="submit">Add Flag</Button>
      </form>

      <ul className="space-y-4">
        {flags.map((flag) => (
          <li
            key={flag.name}
            className="flex items-center justify-between p-3 border rounded"
          >
            <span className="font-medium">{flag.name}</span>
            <Button
              variant={flag.value ? 'default' : 'outline'}
              onClick={() => toggleFlag(flag.name)}
            >
              {flag.value ? 'Disable' : 'Enable'}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
