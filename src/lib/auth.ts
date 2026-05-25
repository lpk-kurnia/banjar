import { NextAuthOptions, User } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'mock-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock-client-secret',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false

      try {
        // Ambil list super admin email dari environment variable
        const superAdminEmails = (process.env.SUPER_ADMIN_EMAIL || '')
          .split(',')
          .map(email => email.trim().toLowerCase())
          .filter(email => email.length > 0)

        // Cek apakah user adalah super admin
        const isSuperAdmin = superAdminEmails.includes(user.email.toLowerCase())

        // Cek apakah user sudah ada di database
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
        })

        if (!existingUser) {
          // Buat user baru dengan role sesuai
          await db.user.create({
            data: {
              email: user.email,
              name: user.name || 'User',
              avatar: user.image || null,
              role: isSuperAdmin ? 'SUPER_ADMIN' : 'USER',
            },
          })
        } else {
          // Update role jika user adalah super admin tapi role di database belum SUPER_ADMIN
          if (isSuperAdmin && existingUser.role !== 'SUPER_ADMIN') {
            await db.user.update({
              where: { email: user.email },
              data: { role: 'SUPER_ADMIN' }
            })
          }
        }

        return true
      } catch (error) {
        console.error('Error in signIn callback:', error)
        return false
      }
    },

    async session({ session, token }) {
      if (session.user?.email) {
        try {
          const dbUser = await db.user.findUnique({
            where: { email: session.user.email },
          })

          if (dbUser) {
            session.user.id = dbUser.id
            session.user.role = dbUser.role
            session.user.isBanned = dbUser.isBanned
          }
        } catch (error) {
          console.error('Error in session callback:', error)
        }
      }
      return session
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  pages: {
    signIn: '/forum',
    error: '/forum',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
}
