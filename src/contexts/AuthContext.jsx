import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return

      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    }).catch((error) => {
      console.error('Error getting session:', error)
      if (mounted) setLoading(false)
    })

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return

      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId) => {
    console.log('Fetching profile for user:', userId)

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching profile:', error)
        setProfile(null)
      } else if (data) {
        console.log('Profile loaded:', data)
        setProfile(data)
      } else {
        console.warn('No profile found for user')
        setProfile(null)
      }
    } catch (error) {
      console.error('Exception fetching profile:', error)
      setProfile(null)
    } finally {
      console.log('Setting loading to false')
      setLoading(false)
    }
  }

  const signIn = async (username, password) => {
    try {
      console.log('Attempting to sign in with username:', username)

      // First, get the email from username
      const { data: emailData, error: emailError } = await supabase
        .rpc('get_email_by_username', { p_username: username })

      if (emailError) {
        console.error('Error getting email:', emailError)
        throw new Error('Usuario no encontrado')
      }

      if (!emailData) {
        throw new Error('Usuario no encontrado')
      }

      console.log('Found email for username:', emailData)

      // Then sign in with the email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailData,
        password,
      })

      if (error) {
        console.error('Sign in error:', error)
        throw error
      }

      console.log('Sign in successful')
      return { data, error: null }
    } catch (error) {
      console.error('Sign in exception:', error)
      return { data: null, error }
    }
  }

  const signUp = async (email, password, fullName, username) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username,
          }
        }
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const hasRole = (requiredRole) => {
    if (!profile) return false

    const roles = {
      user: ['user', 'admin', 'system_admin'],
      admin: ['admin', 'system_admin'],
      system_admin: ['system_admin']
    }

    return roles[requiredRole]?.includes(profile.role) ?? false
  }

  // Log current state
  console.log('Auth state:', { user: !!user, profile: !!profile, loading })

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
    isUser: hasRole('user'),
    isAdmin: hasRole('admin'),
    isSystemAdmin: hasRole('system_admin'),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
