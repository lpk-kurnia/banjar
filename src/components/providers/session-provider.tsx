'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { Role } from '@prisma/client'

export interface AuthUser {
  id: string
  authId: string
  email: string
  name: string | null
  image: string | null
  role: Role
  isBanned: boolean
}

interface Session {
  user: AuthUser | null
}

interface AuthContextType {
  session: Session | null
  user: AuthUser | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  signInWithGoogle: () => Promise<void>
  signInWithGitHub: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const refreshLock = useRef(false)

  const supabase = createClient()

  const mapUser = useCallback((supabaseUser: SupabaseUser): AuthUser => {
    return {
      id: supabaseUser.user_metadata?.db_user_id || supabaseUser.id,
      authId: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || null,
      image: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || null,
      role: supabaseUser.user_metadata?.db_role || 'USER',
      isBanned: supabaseUser.user_metadata?.db_is_banned || false,
    }
  }, [])

  const refreshSession = useCallback(async () => {
    // Prevent concurrent refreshes
    if (refreshLock.current) return
    refreshLock.current = true

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()

      if (currentSession?.user) {
        // Fetch user data from our API (with timeout to prevent hanging)
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 8000)

          const res = await fetch('/api/auth/me', { signal: controller.signal })
          clearTimeout(timeoutId)

          if (res.ok) {
            const data = await res.json()
            const user: AuthUser = {
              id: data.user.id,
              authId: currentSession.user.id,
              email: data.user.email,
              name: data.user.name,
              image: data.user.avatar,
              role: data.user.role,
              isBanned: data.user.isBanned,
            }
            setSession({ user })
            setStatus('authenticated')
            return
          }
        } catch {
          // API failed or timed out — fall back to Supabase session metadata
        }

        // Fallback: use metadata from Supabase session (instant, no DB call)
        const user = mapUser(currentSession.user)
        setSession({ user })
        setStatus('authenticated')
      } else {
        setSession(null)
        setStatus('unauthenticated')
      }
    } catch (error) {
      setSession(null)
      setStatus('unauthenticated')
    } finally {
      refreshLock.current = false
    }
  }, [supabase, mapUser])

  useEffect(() => {
    // Listen for auth changes (also fires with INITIAL_SESSION on mount)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await refreshSession()

        // For SIGNED_IN, do a second refresh after delay
        // This handles email signup where User row needs to be auto-created
        if (event === 'SIGNED_IN') {
          setTimeout(() => refreshSession(), 1500)
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null)
        setStatus('unauthenticated')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, refreshSession])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/forum`,
      },
    })
  }

  const signInWithGitHub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/forum`,
      },
    })
  }

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  }

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/forum`,
      },
    })
    if (error) return { error: error.message }
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setStatus('unauthenticated')
  }

  const value: AuthContextType = {
    session,
    user: session?.user || null,
    status,
    signInWithGoogle,
    signInWithGitHub,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within a SessionProvider')
  }
  return context
}
