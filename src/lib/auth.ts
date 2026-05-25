import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { Role } from '@prisma/client'

export interface AuthUser {
  id: string        // Our DB user id (cuid)
  authId: string    // Supabase auth uid
  email: string
  name: string | null
  avatar: string | null
  role: Role
  isBanned: boolean
}

/**
 * Get the current authenticated user from Supabase session + our DB.
 * For use in API routes (server-side only).
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Find user in our DB by Supabase auth ID
    let dbUser = await db.user.findUnique({
      where: { authId: user.id }
    })

    // Fallback: find by email (for migration)
    if (!dbUser && user.email) {
      dbUser = await db.user.findUnique({
        where: { email: user.email }
      })
      if (dbUser) {
        // Link the authId to existing user
        await db.user.update({
          where: { id: dbUser.id },
          data: { authId: user.id }
        })
      }
    }

    if (!dbUser) return null

    return {
      id: dbUser.id,
      authId: user.id,
      email: dbUser.email,
      name: dbUser.name,
      avatar: dbUser.avatar,
      role: dbUser.role,
      isBanned: dbUser.isBanned,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}
