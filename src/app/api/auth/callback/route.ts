import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/forum'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get the authenticated user from Supabase
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Check if this is a super admin email
        const superAdminEmails = (process.env.SUPER_ADMIN_EMAIL || '')
          .split(',')
          .map(email => email.trim().toLowerCase())
          .filter(email => email.length > 0)

        const isSuperAdmin = superAdminEmails.includes(user.email!.toLowerCase())

        // Upsert user to our database
        const existingUser = await db.user.findUnique({
          where: { authId: user.id }
        })

        if (!existingUser) {
          // Check if user exists by email (migration from old system)
          const userByEmail = await db.user.findUnique({
            where: { email: user.email! }
          })

          if (userByEmail) {
            // Update existing user with authId
            await db.user.update({
              where: { email: user.email! },
              data: {
                authId: user.id,
                name: user.user_metadata?.full_name || userByEmail.name || user.email!.split('@')[0],
                avatar: user.user_metadata?.avatar_url || userByEmail.avatar,
                role: isSuperAdmin ? 'SUPER_ADMIN' : userByEmail.role,
              }
            })
          } else {
            // Create new user
            await db.user.create({
              data: {
                authId: user.id,
                email: user.email!,
                name: user.user_metadata?.full_name || user.email!.split('@')[0],
                avatar: user.user_metadata?.avatar_url || null,
                role: isSuperAdmin ? 'SUPER_ADMIN' : 'USER',
              }
            })
          }
        } else {
          // Update role if super admin status changed
          if (isSuperAdmin && existingUser.role !== 'SUPER_ADMIN') {
            await db.user.update({
              where: { authId: user.id },
              data: { role: 'SUPER_ADMIN' }
            })
          }
          // Update name/avatar if changed in OAuth provider
          await db.user.update({
            where: { authId: user.id },
            data: {
              name: user.user_metadata?.full_name || existingUser.name,
              avatar: user.user_metadata?.avatar_url || existingUser.avatar,
            }
          })
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/forum?auth=error`)
}
