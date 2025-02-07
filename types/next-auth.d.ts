import { DefaultSession } from 'next-auth'
import { Role } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      role: Role
    } & DefaultSession['user']
    accessToken?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: Role
    accessToken?: string
    refreshToken?: string
    accessTokenExpires?: number
  }
}
