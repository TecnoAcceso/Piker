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

  // Función para verificar si un usuario tiene licencia activa
  const checkUserLicense = async (userId, userRole) => {
    // Los system_admin no necesitan licencia
    if (userRole === 'system_admin') {
      console.log('✅ Usuario system_admin, no requiere licencia')
      return { hasLicense: true, license: null }
    }

    try {
      // Obtener todas las licencias del usuario (activas e inactivas para debugging)
      const { data: allLicenses, error: allError } = await supabase
        .from('licenses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (allError) {
        console.error('Error obteniendo todas las licencias:', allError)
      } else {
        console.log('📋 Todas las licencias del usuario:', allLicenses)
      }

      // Buscar licencia activa
      const now = new Date().toISOString()
      console.log('🔍 Buscando licencia activa. Fecha actual:', now)
      
      const { data: licenses, error } = await supabase
        .from('licenses')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('valid_until', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Error verificando licencia:', error)
        return { hasLicense: false, license: null, error: error.message }
      }

      console.log('📋 Licencias encontradas (is_active=true):', licenses)

      if (!licenses || licenses.length === 0) {
        console.warn('⚠️ Usuario no tiene licencia activa')
        return { hasLicense: false, license: null }
      }

      // Verificar que la fecha de validez sea válida
      const license = licenses[0]
      console.log('📅 Licencia encontrada - valid_until:', license.valid_until, 'tipo:', typeof license.valid_until)
      
      if (license.valid_until) {
        // Convertir a Date object
        let validUntil
        try {
          // Intentar parsear la fecha (puede venir en diferentes formatos)
          validUntil = new Date(license.valid_until)
          
          // Verificar que sea una fecha válida
          if (isNaN(validUntil.getTime())) {
            console.warn('⚠️ Fecha de validez inválida:', license.valid_until)
            return { hasLicense: false, license: null }
          }
        } catch (e) {
          console.error('Error parseando fecha:', e)
          return { hasLicense: false, license: null }
        }
        
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Resetear horas para comparar solo fechas
        validUntil.setHours(0, 0, 0, 0) // Resetear horas para comparar solo fechas
        
        console.log('📅 Comparando fechas - valid_until:', validUntil.toISOString(), 'hoy:', today.toISOString())
        
        if (validUntil < today) {
          console.warn('⚠️ Licencia expirada. Fecha de validez:', license.valid_until, 'Fecha actual:', today.toISOString())
          return { hasLicense: false, license: null }
        }
      } else {
        // Si no tiene fecha de validez, considerar como válida (sin expiración)
        console.log('✅ Licencia sin fecha de expiración, considerada válida')
      }

      console.log('✅ Usuario tiene licencia activa:', license.license_key)
      return { hasLicense: true, license: license }
    } catch (error) {
      console.error('Error en checkUserLicense:', error)
      return { hasLicense: false, license: null, error: error.message }
    }
  }

  const signIn = async (username, password) => {
    try {
      // Normalizar el username (trim y lowercase para búsqueda)
      const normalizedUsername = username.trim().toLowerCase()
      console.log('🔍 Login con username:', username, '(normalizado:', normalizedUsername + ')')

      // Buscar usuario por username (case-insensitive usando ilike)
      // Primero intentamos búsqueda exacta case-insensitive
      const { data: users, error: searchError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', normalizedUsername)
        .limit(1)

      console.log('📊 Búsqueda:', { users, searchError, normalizedUsername })

      if (searchError) {
        console.error('Error en búsqueda:', searchError)
        throw new Error('Error al buscar usuario: ' + searchError.message)
      }

      if (!users || users.length === 0) {
        // Si no se encuentra con ilike normalizado, intentar múltiples estrategias
        console.log('⚠️ No se encontró con búsqueda normalizada, intentando otras estrategias...')
        
        // Estrategia 1: Búsqueda exacta con el username original (trimmed)
        const { data: usersExact, error: exactError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username.trim())
          .limit(1)

        if (exactError) {
          console.error('Error en búsqueda exacta:', exactError)
        }

        if (usersExact && usersExact.length > 0) {
          const userProfile = usersExact[0]
          console.log('✅ Usuario encontrado (búsqueda exacta):', userProfile.username)
          
          // Verificar contraseña con bcrypt
          console.log('🔐 Verificando contraseña...')
          const passwordValid = await bcrypt.compare(password, userProfile.password_hash)

          console.log('📊 Password válido:', passwordValid)

          if (!passwordValid) {
            throw new Error('Usuario o contraseña incorrectos')
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
        }

        // Estrategia 2: Búsqueda con ilike usando el username original (sin lowercase)
        const { data: usersOriginal, error: originalError } = await supabase
          .from('profiles')
          .select('*')
          .ilike('username', username.trim())
          .limit(1)

        if (originalError) {
          console.error('Error en búsqueda con username original:', originalError)
        }

        if (usersOriginal && usersOriginal.length > 0) {
          const userProfile = usersOriginal[0]
          console.log('✅ Usuario encontrado (búsqueda con username original):', userProfile.username)
          
          // Verificar contraseña con bcrypt
          console.log('🔐 Verificando contraseña...')
          const passwordValid = await bcrypt.compare(password, userProfile.password_hash)

          console.log('📊 Password válido:', passwordValid)

          if (!passwordValid) {
            throw new Error('Usuario o contraseña incorrectos')
          }

          // Verificar licencia activa (antes de establecer sesión)
          console.log('🔐 Verificando licencia...')
          const licenseCheckExact = await checkUserLicense(userProfile.id, userProfile.role)
          
          if (!licenseCheckExact.hasLicense) {
            console.warn('❌ Usuario no tiene licencia activa')
            const licenseError = new Error('LICENSE_REQUIRED')
            licenseError.code = 'LICENSE_REQUIRED'
            licenseError.userProfile = userProfile
            throw licenseError
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
        }

        // Estrategia 3: Búsqueda parcial (para detectar errores de tipeo comunes)
        // Solo si el username tiene al menos 5 caracteres para evitar búsquedas muy amplias
        if (normalizedUsername.length >= 5) {
          const { data: usersPartial, error: partialError } = await supabase
            .from('profiles')
            .select('username')
            .ilike('username', `%${normalizedUsername}%`)
            .limit(3)

          if (!partialError && usersPartial && usersPartial.length > 0) {
            const suggestions = usersPartial.map(u => u.username).join(', ')
            console.warn('⚠️ Usuario no encontrado exactamente, pero se encontraron usuarios similares:', suggestions)
            console.warn('💡 Username buscado:', username, '| Usuarios similares encontrados:', suggestions)
          }
        }

        // Si llegamos aquí, el usuario no existe
        console.warn('❌ Usuario no encontrado después de todas las búsquedas. Username buscado:', username, '(normalizado:', normalizedUsername + ')')
        console.warn('💡 Verifica que el username sea correcto. Revisa la consola para ver si hay sugerencias de usernames similares.')
        throw new Error('Usuario o contraseña incorrectos')
      }

      const userProfile = users[0]
      console.log('✅ Usuario encontrado:', userProfile.username)

      // Verificar contraseña con bcrypt
      console.log('🔐 Verificando contraseña...')
      const passwordValid = await bcrypt.compare(password, userProfile.password_hash)

      console.log('📊 Password válido:', passwordValid)

      if (!passwordValid) {
        throw new Error('Usuario o contraseña incorrectos')
      }

      // Verificar licencia activa (antes de establecer sesión)
      console.log('🔐 Verificando licencia...')
      const licenseCheck = await checkUserLicense(userProfile.id, userProfile.role)
      
      if (!licenseCheck.hasLicense) {
        console.warn('❌ Usuario no tiene licencia activa')
        // Crear error especial para manejar en el componente de login
        const licenseError = new Error('LICENSE_REQUIRED')
        licenseError.code = 'LICENSE_REQUIRED'
        licenseError.userProfile = userProfile
        throw licenseError
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
