import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import * as bcrypt from 'bcryptjs'

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
    // Cargar usuario desde localStorage
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem('piker_user')
        const savedProfile = localStorage.getItem('piker_profile')

        if (savedUser && savedProfile) {
          setUser(JSON.parse(savedUser))
          setProfile(JSON.parse(savedProfile))
        }
      } catch (error) {
        console.error('Error loading user:', error)
        localStorage.removeItem('piker_user')
        localStorage.removeItem('piker_profile')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (username, password) => {
    try {
      console.log('🔍 Login con username:', username)

      // Buscar usuario por username
      const { data: users, error: searchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .limit(1)

      console.log('📊 Búsqueda:', { users, searchError })

      if (searchError) {
        throw new Error('Error al buscar usuario')
      }

      if (!users || users.length === 0) {
        throw new Error('Usuario no encontrado')
      }

      const userProfile = users[0]
      console.log('✅ Usuario encontrado:', userProfile.username)

      // Verificar contraseña con bcrypt
      console.log('🔐 Verificando contraseña...')
      const passwordValid = await bcrypt.compare(password, userProfile.password_hash)

      console.log('📊 Password válido:', passwordValid)

      if (!passwordValid) {
        throw new Error('Contraseña incorrecta')
      }

      // Establecer usuario y perfil directamente
      console.log('✅ Autenticación exitosa!')
      const userData = { id: userProfile.id, email: userProfile.email }

      setUser(userData)
      setProfile(userProfile)
      setLoading(false)

      // Guardar en localStorage
      localStorage.setItem('piker_user', JSON.stringify(userData))
      localStorage.setItem('piker_profile', JSON.stringify(userProfile))

      return { data: { user: userProfile }, error: null }
    } catch (error) {
      console.error('❌ Error:', error)
      return { data: null, error }
    }
  }

  const signUp = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
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
      setUser(null)
      setProfile(null)
      localStorage.removeItem('piker_user')
      localStorage.removeItem('piker_profile')
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
