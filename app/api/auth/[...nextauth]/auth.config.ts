import { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GithubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from '@/prisma/db'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'

const ADMIN_EMAILS = ['hajzerbela@gmail.com'] // Add all admin emails here

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        console.log('Profile Google: ', profile)
        return {
          ...profile,
          id: profile.sub,
          role: ADMIN_EMAILS.includes(profile.email) ? Role.ADMIN : Role.USER,
        }
      },
    }),

    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      profile(profile) {
        console.log('Profile Github: ', profile)
        return {
          ...profile,
          role: ADMIN_EMAILS.includes(profile.email) ? Role.ADMIN : Role.USER,
        }
      },
    }),

    CredentialsProvider({
      name: 'Credentials',

      credentials: {
        email: { label: 'Email', type: 'text' },

        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,

          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,

          email: user.email,

          name: user.name,
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt' as const,
  },

  pages: {
    signIn: '/auth/signin',
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'github' || account?.provider === 'google') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })

        if (!existingUser) {
          // Create new user with appropriate role
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
              role: ADMIN_EMAILS.includes(user.email!) ? 'ADMIN' : 'USER',
            },
          })
        } else if (
          ADMIN_EMAILS.includes(user.email!) &&
          existingUser.role !== 'ADMIN'
        ) {
          // Update existing user to admin if they should be admin
          await prisma.user.update({
            where: { email: user.email! },
            data: { role: 'ADMIN' },
          })
        }
      }
      return true
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      // Default to redirecting to the dashboard
      return `${baseUrl}/dashboard`
    },

    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })
        token.role = dbUser?.role || 'USER'
      } else if (token.email && !token.role) {
        // Check role on subsequent requests
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        })
        token.role = dbUser?.role || 'USER'
      }
      return token
    },

    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as Role
      }
      console.log('Session: ', session)
      return session
    },
  },
}
