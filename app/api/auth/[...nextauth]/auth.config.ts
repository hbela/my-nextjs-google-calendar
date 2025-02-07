import { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from '@/prisma/db'
import { Role } from '@prisma/client'

const ADMIN_EMAILS = ['hajzerbela@gmail.com'] // Add all admin emails here

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            'openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
      profile(profile) {
        console.log('Profile Google: ', profile)
        return {
          ...profile,
          id: profile.sub,
          role: ADMIN_EMAILS.includes(profile.email) ? Role.ADMIN : Role.USER,
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
      // Only allow Google authentication
      if (account?.provider !== 'google') {
        return false
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
      })

      if (!existingUser) {
        // Create new user with appropriate role
        const newUser = await prisma.user.create({
          data: {
            email: user.email!,
            name: user.name,
            image: user.image,
            role: ADMIN_EMAILS.includes(user.email!) ? 'ADMIN' : 'USER',
          },
        })

        // Create the Google account link for the new user
        await prisma.account.create({
          data: {
            userId: newUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
          },
        })
      } else {
        // Update existing user's information
        await prisma.user.update({
          where: { email: user.email! },
          data: {
            name: user.name,
            image: user.image,
            role: ADMIN_EMAILS.includes(user.email!) ? 'ADMIN' : 'USER',
          },
        })

        // Check if Google account is already linked
        const existingAccount = await prisma.account.findFirst({
          where: {
            userId: existingUser.id,
            provider: 'google',
          },
        })

        // If no Google account is linked or we need to update tokens, create/update it
        if (!existingAccount) {
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
            },
          })
        } else {
          // Update the tokens
          await prisma.account.update({
            where: { id: existingAccount.id },
            data: {
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              scope: account.scope,
              token_type: account.token_type,
              id_token: account.id_token,
            },
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

    async jwt({ token, user, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.accessTokenExpires = account.expires_at
      }

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
        session.accessToken = token.accessToken as string
      }
      return session
    },
  },
}
