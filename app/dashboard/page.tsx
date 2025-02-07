import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config'
import CalendarEvents from '@/components/CalendarEvents'

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">
        Welcome, {session.user?.name}!
      </h1>
      <div className="grid gap-6">
        <CalendarEvents />
      </div>
    </div>
  )
}
