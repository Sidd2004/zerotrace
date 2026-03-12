import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const profileFetchRef = useRef(false)

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log('[Auth] Initializing session')

        const {
          data: { session: currentSession },
          error
        } = await supabase.auth.getSession()

        if (error) throw error
        if (!mounted) return

        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        console.log('[Auth] Session:', currentSession ? 'active' : 'none')

        // Do NOT block auth initialization on profile fetch
        if (currentSession?.user) {
          fetchProfile(currentSession.user.id)
        }
      } catch (err) {
        console.error('[Auth] Initialization error:', err)

        if (mounted) {
          setSession(null)
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return

      console.log('[Auth] Auth event:', event)

      setSession(newSession)
      setUser(newSession?.user ?? null)

      if (newSession?.user) {
        fetchProfile(newSession.user.id)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId) => {
    if (profileFetchRef.current) return
    profileFetchRef.current = true

    try {
      console.log('[Auth] Fetching profile:', userId)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('[Auth] Profile fetch error:', error)
        setProfile(null)
        return
      }

      setProfile(data || null)
      console.log('[Auth] Profile loaded:', data?.username)
    } catch (err) {
      console.error('[Auth] Profile exception:', err)
      setProfile(null)
    } finally {
      profileFetchRef.current = false
    }
  }

  const signUp = async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    })

    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    return { data, error }
  }

  const signInWithGoogle = async () => {
    return signInWithOAuth('google')
  }

  const signInWithOAuth = async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + '/dashboard',
        scopes: provider === 'discord' ? 'identify email' : undefined
      }
    })

    if (error) console.error('OAuth error:', error.message)
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (!error) {
      setSession(null)
      setUser(null)
      setProfile(null)
    }

    return { error }
  }

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password'
    })

    return { data, error }
  }

  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })

    return { data, error }
  }

  const updateProfile = async (updates) => {
    if (!user) return { error: { message: 'Not authenticated' } }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .maybeSingle()

    if (data) setProfile(data)

    return { data, error }
  }

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    fetchProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}