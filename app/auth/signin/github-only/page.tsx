'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { signIn } from 'next-auth/react'
import { BookOpen } from 'lucide-react'

export default function GitHubSignIn() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4" />
          <CardTitle>Welcome to NextStarter</CardTitle>
          <CardDescription>Continue with GitHub to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
          >
            Sign in with GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
