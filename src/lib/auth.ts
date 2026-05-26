import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
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

const superAdminEmails = () =>
  (process.env.SUPER_ADMIN_EMAIL || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(e => e.length > 0)

/**
 * Get the current authenticated user from Supabase session + our DB.
 * For use in API routes (server-side only).
 * Auto-creates User row if missing (handles email signup without confirmation).
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const admins = superAdminEmails()
    const shouldBeAdmin = user.email ? admins.includes(user.email.toLowerCase()) : false
    const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || null
    const userAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null

    // Try Prisma first (works if DATABASE_URL uses direct connection / port 5432)
    try {
      let dbUser = await db.user.findUnique({
        where: { authId: user.id }
      })

      // Fallback: find by email
      if (!dbUser && user.email) {
        dbUser = await db.user.findUnique({
          where: { email: user.email }
        })
        if (dbUser) {
          dbUser = await db.user.update({
            where: { id: dbUser.id },
            data: {
              authId: user.id,
              name: userName || dbUser.name,
              avatar: userAvatar || dbUser.avatar,
              ...(shouldBeAdmin && dbUser.role !== 'SUPER_ADMIN' ? { role: 'SUPER_ADMIN' as Role } : {})
            }
          })
        }
      }

      // Auto-create User row if completely missing (email signup without confirmation)
      if (!dbUser && user.email) {
        dbUser = await db.user.create({
          data: {
            authId: user.id,
            email: user.email,
            name: userName,
            avatar: userAvatar,
            role: shouldBeAdmin ? 'SUPER_ADMIN' : 'USER',
          }
        })
      }

      if (!dbUser) return null

      // Auto-promote to SUPER_ADMIN if email matches
      if (shouldBeAdmin && dbUser.role !== 'SUPER_ADMIN') {
        dbUser = await db.user.update({
          where: { id: dbUser.id },
          data: { role: 'SUPER_ADMIN' }
        })
      }

      return {
        id: dbUser.id,
        authId: user.id,
        email: dbUser.email,
        name: dbUser.name,
        avatar: dbUser.avatar,
        role: dbUser.role,
        isBanned: dbUser.isBanned,
      }
    } catch {
      // Prisma failed (likely RLS blocking via connection pooler).
      // Fallback: use SECURITY DEFINER function via service_role (bypasses RLS)
      const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // Call RPC to upsert user (creates if missing, updates if exists)
      await supabaseAdmin.rpc('upsert_user_from_auth', {
        p_auth_id: user.id,
        p_email: user.email!,
        p_name: userName,
        p_avatar: userAvatar,
        p_is_super_admin: shouldBeAdmin
      })

      // Now fetch the user we just created/updated
      const { data: dbUser } = await supabaseAdmin
        .from('User')
        .select('*')
        .eq('authId', user.id)
        .single()

      if (!dbUser) return null

      return {
        id: dbUser.id,
        authId: user.id,
        email: dbUser.email,
        name: dbUser.name,
        avatar: dbUser.avatar,
        role: dbUser.role as Role,
        isBanned: dbUser.isBanned,
      }
    }
  } catch (error) {
    console.error('[Auth] getCurrentUser error:', error)
    return null
  }
}
