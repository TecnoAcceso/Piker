import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Lock, Loader2, Shield, MessageCircle, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import CustomAlert from '../components/CustomAlert'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showLicenseAlert, setShowLicenseAlert] = useState(false)
  const [showPendingApiAlert, setShowPendingApiAlert] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  // Contactos de soporte WhatsApp
  const supportContacts = [
    { name: 'Ing. Dorante', phone: '584120557690' },
    { name: 'Ing. Morandin', phone: '584120552926' }
  ]

  // Mensajes predefinidos según el tipo de alert
  const getWhatsAppMessage = (alertType) => {
    const messages = {
      license_required: 'Hola, necesito ayuda con mi licencia en la aplicación Piker. Mi cuenta no tiene una licencia activa y necesito que me asignen una.',
      pending_api: 'Hola, necesito ayuda con la configuración de WhatsApp Business API en la aplicación Piker. Mi licencia está creada pero está pendiente de configuración.'
    }
    return encodeURIComponent(messages[alertType] || 'Hola, necesito ayuda con mi cuenta en la aplicación Piker.')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setShowLicenseAlert(false)
    setShowPendingApiAlert(false)

    try {
      const { data, error } = await signIn(username, password)

      if (error) {
        // Verificar si es error de licencia
        if (error.code === 'LICENSE_REQUIRED' || error.message === 'LICENSE_REQUIRED') {
          setShowLicenseAlert(true)
          setLoading(false)
          return
        }
        // Verificar si es error de licencia pendiente de API
        if (error.code === 'LICENSE_PENDING_API' || error.message === 'LICENSE_PENDING_API') {
          setShowPendingApiAlert(true)
          setLoading(false)
          return
        }
        setError(error.message)
        setLoading(false)
        return
      }

      if (data) {
        navigate('/dashboard')
      }
    } catch (err) {
      console.error('Error en login:', err)
      if (err.code === 'LICENSE_REQUIRED' || err.message === 'LICENSE_REQUIRED') {
        setShowLicenseAlert(true)
      } else if (err.code === 'LICENSE_PENDING_API' || err.message === 'LICENSE_PENDING_API') {
        setShowPendingApiAlert(true)
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
          <div className="relative inline-block mb-0">
            {/* Logo Container - Simple with glow effect */}
            <div className="relative inline-flex items-center justify-center">
              {/* Intenta cargar el logo, si no existe muestra el icono */}
              <img
                src="/logo.png"
                alt="Logo"
                className="w-64 h-auto object-contain"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.2))',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div
                className="hidden items-center justify-center w-20 h-20 rounded-xl bg-gradient-to-br from-luxury-raspberry to-luxury-raspberryDark"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.4))',
                }}
              >
                <Shield
                  className="w-12 h-12 text-white"
                  strokeWidth={2}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-0">
            <img
              src="/palabra.png"
              alt="Piker"
              className="h-12 object-contain"
              style={{
                filter: 'drop-shadow(0 0 10px rgba(228, 0, 59, 0.3))',
              }}
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-gray-500/40 font-light tracking-wider">
                BETA
              </span>
              <span className="text-[9px] text-gray-500/30 font-light">
                v1.0
              </span>
            </div>
          </div>

          <p className="text-gray-400 text-sm font-light mt-0">
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
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500 w-4 h-4 z-10 group-hover:text-red-600 transition-colors" />
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
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500 w-4 h-4 z-10 group-hover:text-red-600 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="relative w-full pl-10 pr-10 py-2.5 bg-white border border-luxury-raspberry/20 rounded-lg text-gray-900 placeholder-gray-400 hover:border-luxury-raspberry/40 focus:border-luxury-raspberry focus:outline-none transition-all text-sm"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-600 transition-colors z-10"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
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
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs font-semibold text-gray-400 mb-3">Contacta al administrador:</p>
              <div className="flex items-center gap-4">
                {supportContacts.map((contact, index) => (
                  <a
                    key={index}
                    href={`https://wa.me/${contact.phone}?text=${getWhatsAppMessage('license_required')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-sm text-gray-300 hover:text-luxury-gold transition-colors group"
                  >
                    <MessageCircle className="w-4 h-4 text-green-500 group-hover:text-green-400 transition-colors" />
                    <span className="font-medium">{contact.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        }
        type="error"
      />

      {/* Pending API Alert */}
      <CustomAlert
        isOpen={showPendingApiAlert}
        onClose={() => setShowPendingApiAlert(false)}
        title="Licencia Pendiente de Configuración"
        message={
          <div className="space-y-3">
            <p className="text-sm text-gray-300">
              Tu licencia está creada pero está pendiente de configuración de WhatsApp Business API. El administrador debe completar la configuración antes de que puedas usar la aplicación.
            </p>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs font-semibold text-gray-400 mb-3">Contacta al administrador:</p>
              <div className="flex items-center gap-4">
                {supportContacts.map((contact, index) => (
                  <a
                    key={index}
                    href={`https://wa.me/${contact.phone}?text=${getWhatsAppMessage('pending_api')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-sm text-gray-300 hover:text-luxury-gold transition-colors group"
                  >
                    <MessageCircle className="w-4 h-4 text-green-500 group-hover:text-green-400 transition-colors" />
                    <span className="font-medium">{contact.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        }
        type="warning"
      />
    </div>
  )
}
