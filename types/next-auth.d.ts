import { DefaultSession } from 'next-auth'
import { Role } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      role: Role
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: Role
  }
}
