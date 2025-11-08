import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Lock, Loader2, Shield, Mail } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import CustomAlert from '../components/CustomAlert'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showLicenseAlert, setShowLicenseAlert] = useState(false)
  const [adminContact, setAdminContact] = useState(null)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const fetchAdminContact = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('role', 'system_admin')
        .limit(1)
        .single()

      if (!error && data) {
        setAdminContact(data)
      }
    } catch (err) {
      console.error('Error fetching admin contact:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setShowLicenseAlert(false)

    try {
      const { data, error } = await signIn(username, password)

      if (error) {
        // Verificar si es error de licencia
        if (error.code === 'LICENSE_REQUIRED' || error.message === 'LICENSE_REQUIRED') {
          await fetchAdminContact()
          setShowLicenseAlert(true)
          return
        }
        setError(error.message)
        return
      }

      if (data) {
        navigate('/dashboard')
      }
    } catch (err) {
      if (err.code === 'LICENSE_REQUIRED' || err.message === 'LICENSE_REQUIRED') {
        await fetchAdminContact()
        setShowLicenseAlert(true)
      } else {
        setError('Error al iniciar sesión. Por favor, intente nuevamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Static Background Gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-[800px] h-[800px] rounded-full opacity-50"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.03) 50%, transparent 100%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[700px] h-[700px] rounded-full opacity-50"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0.05) 50%, transparent 100%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            {/* Logo Container - Simple with glow effect */}
            <div className="relative inline-flex items-center justify-center">
              {/* Intenta cargar el logo, si no existe muestra el icono */}
              <img
                src="/logo.png"
                alt="Logo"
                className="w-80 h-auto object-contain"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(228, 0, 59, 0.4)) drop-shadow(0 0 40px rgba(228, 0, 59, 0.2))',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div
                className="hidden items-center justify-center w-20 h-20 rounded-xl bg-gradient-to-br from-luxury-raspberry to-luxury-raspberryDark"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(228, 0, 59, 0.4))',
                }}
              >
                <Shield
                  className="w-12 h-12 text-white"
                  strokeWidth={2}
                />
              </div>
            </div>
          </div>

          <h1 className="text-5xl font-display font-bold gradient-text mb-2 tracking-tight">
            Piker
          </h1>

          <p className="text-gray-400 text-sm font-light">
            Sistema de Mensajería
          </p>
        </div>

        {/* Login Card */}
        <div className="relative">
          {/* Card subtle glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-luxury-raspberry/10 via-transparent to-luxury-raspberryDark/10 rounded-2xl blur-xl" />

          <div className="relative card-luxury border-luxury-brightBlue/20 backdrop-blur-xl bg-luxury-navyBlue/40 p-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 mb-4 backdrop-blur-sm"
              >
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Usuario
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-luxury-raspberry/70 w-4 h-4 z-10 group-hover:text-luxury-raspberry transition-colors" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="relative w-full pl-10 pr-4 py-2.5 bg-white border border-luxury-raspberry/20 rounded-lg text-gray-900 placeholder-gray-400 hover:border-luxury-raspberry/40 focus:border-luxury-raspberry focus:outline-none transition-all text-sm"
                    placeholder="Usuario"
                    required
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Contraseña
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-luxury-raspberry/70 w-4 h-4 z-10 group-hover:text-luxury-raspberry transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="relative w-full pl-10 pr-4 py-2.5 bg-white border border-luxury-raspberry/20 rounded-lg text-gray-900 placeholder-gray-400 hover:border-luxury-raspberry/40 focus:border-luxury-raspberry focus:outline-none transition-all text-sm"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2 mt-6 text-sm font-semibold py-3 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-luxury-cyan via-luxury-brightBlue to-luxury-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                    <span className="relative z-10">Verificando...</span>
                  </>
                ) : (
                  <span className="relative z-10">Iniciar Sesión</span>
                )}
              </motion.button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-4">
          <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
            <Shield className="w-4 h-4" />
            <span>Protegido con encriptación</span>
          </div>

          <p className="text-gray-600 text-sm font-light">
            © 2025 Piker. Todos los derechos reservados.
          </p>
        </div>
      </motion.div>

      {/* License Alert */}
      <CustomAlert
        isOpen={showLicenseAlert}
        onClose={() => setShowLicenseAlert(false)}
        title="Licencia Requerida"
        message={
          <div className="space-y-3">
            <p className="text-sm text-gray-300">
              Tu cuenta no tiene una licencia activa. Para acceder al sistema, necesitas una licencia válida asignada por el administrador.
            </p>
            {adminContact && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-xs font-semibold text-gray-400 mb-2">Contacta al administrador:</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-300">
                    <Mail className="w-4 h-4 text-luxury-gold" />
                    <a 
                      href={`mailto:${adminContact.email}`}
                      className="text-luxury-gold hover:text-luxury-brightBlue transition-colors"
                    >
                      {adminContact.email}
                    </a>
                  </div>
                  {adminContact.full_name && (
                    <p className="text-xs text-gray-400 ml-6">
                      {adminContact.full_name}
                    </p>
                  )}
                </div>
              </div>
            )}
            {!adminContact && (
              <p className="text-xs text-gray-500 mt-2">
                Por favor, contacta al administrador del sistema para obtener una licencia.
              </p>
            )}
          </div>
        }
        type="error"
      />
    </div>
  )
}
