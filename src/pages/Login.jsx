import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Lock, Loader2, Shield, Eye, EyeOff, ArrowLeft, ShoppingCart, Key, Mail, Check, Sparkles, Zap, Crown } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
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
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [showAcquireApp, setShowAcquireApp] = useState(false)
  const [showRecovery, setShowRecovery] = useState(false)
  const [recoveryStep, setRecoveryStep] = useState('select') // 'select', 'username', 'password'
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoveryLoading, setRecoveryLoading] = useState(false)
  const [recoveryError, setRecoveryError] = useState('')
  const [recoverySuccess, setRecoverySuccess] = useState('')
  const { signIn, recoverUsername, recoverPassword } = useAuth()
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
      pending_api: 'Hola, necesito ayuda con la configuración de WhatsApp Business API en la aplicación Piker. Mi licencia está creada pero está pendiente de configuración.',
      request_access: 'Hola, me gustaría solicitar acceso a la aplicación Piker. ¿Podrían ayudarme a obtener una cuenta?',
      recovery: 'Hola, necesito ayuda para recuperar mi contraseña o usuario en la aplicación Piker. ¿Podrían ayudarme?'
    }
    return encodeURIComponent(messages[alertType] || 'Hola, necesito ayuda con mi cuenta en la aplicación Piker.')
  }

  const handleRecoverUsername = async (e) => {
    e.preventDefault()
    setRecoveryError('')
    setRecoverySuccess('')
    setRecoveryLoading(true)

    try {
      const result = await recoverUsername(recoveryEmail)
      
      if (result.success) {
        setRecoverySuccess(result.message)
        // Limpiar formulario inmediatamente después del éxito
        setRecoveryEmail('')
        setTimeout(() => {
          setShowRecovery(false)
          setShowLoginForm(true)
          setRecoveryStep('select')
          setRecoveryEmail('')
          setRecoverySuccess('')
        }, 3000)
      } else {
        setRecoveryError(result.message || 'Error al recuperar el usuario')
        // Limpiar formulario también en caso de error
        setRecoveryEmail('')
      }
    } catch (error) {
      setRecoveryError('Error al recuperar el usuario. Por favor, intente nuevamente.')
      setRecoveryEmail('')
    } finally {
      setRecoveryLoading(false)
    }
  }

  const handleRecoverPassword = async (e) => {
    e.preventDefault()
    setRecoveryError('')
    setRecoverySuccess('')
    setRecoveryLoading(true)

    try {
      const result = await recoverPassword(recoveryEmail)
      
      if (result.success) {
        setRecoverySuccess(result.message)
        // Limpiar formulario inmediatamente después del éxito
        setRecoveryEmail('')
        // NO mostrar contraseña temporal en el modal - solo se envía por correo
        setTimeout(() => {
          setShowRecovery(false)
          setShowLoginForm(true)
          setRecoveryStep('select')
          setRecoveryEmail('')
          setRecoverySuccess('')
        }, 3000)
      } else {
        setRecoveryError(result.message || 'Error al recuperar la contraseña')
        // Limpiar formulario también en caso de error para facilitar reintento
        setRecoveryEmail('')
      }
    } catch (error) {
      setRecoveryError('Error al recuperar la contraseña. Por favor, intente nuevamente.')
      setRecoveryEmail('')
    } finally {
      setRecoveryLoading(false)
    }
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

      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait" custom={showAcquireApp}>
          {!showLoginForm && !showAcquireApp && !showRecovery ? (
            // Pantalla inicial: Logo y botón
            <motion.div
              key="initial-screen"
              custom={showAcquireApp}
              variants={{
                initial: { x: -1000, opacity: 0 },
                animate: { x: 0, opacity: 1 },
                exit: (isAcquiring) => ({ 
                  x: isAcquiring ? 1000 : -1000, 
                  opacity: 0 
                })
              }}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ 
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="w-full"
            >
              {/* Logo animado */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 0.8,
                  ease: [0.34, 1.56, 0.64, 1]
                }}
                className="text-center mb-8"
              >
                <div className="relative inline-block mb-6">
                  <div className="relative inline-flex items-center justify-center">
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

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="flex items-center justify-center gap-2 mb-4"
                >
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
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-gray-400 text-sm font-light"
                >
                  Sistema de Mensajería
                </motion.p>
              </motion.div>

              {/* Botón de iniciar sesión */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex justify-center mb-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowLoginForm(true)
                    setShowAcquireApp(false)
                    setShowRecovery(false)
                  }}
                  className="btn-primary px-12 py-4 text-base font-semibold relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-luxury-cyan via-luxury-brightBlue to-luxury-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">Iniciar Sesión</span>
                </motion.button>
              </motion.div>

              {/* Botón de adquirir app */}
              <motion.div
                initial={{ opacity: 0, x: 1000 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="flex justify-center mt-6"
              >
                <motion.button
                  onClick={() => {
                    setShowAcquireApp(true)
                    setShowLoginForm(false)
                    setShowRecovery(false)
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 text-gray-400 hover:text-gray-300 text-sm font-light underline underline-offset-4 transition-colors group"
                >
                  <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Adquiere la app aquí</span>
                </motion.button>
              </motion.div>
            </motion.div>
          ) : showLoginForm ? (
            // Pantalla de formulario: Inputs de login
            <motion.div
              key="login-form"
              initial={{ x: 1000, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 1000, opacity: 0 }}
              transition={{ 
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="w-full"
            >
              {/* Botón Atrás */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowLoginForm(false)
                    setShowAcquireApp(false)
                    setShowRecovery(false)
                    setError('')
                    setUsername('')
                    setPassword('')
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors group"
                  aria-label="Volver"
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
              </motion.div>

              {/* Logo pequeño en la parte superior */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-6"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <img
                    src="/palabra.png"
                    alt="Piker"
                    className="h-10 object-contain"
                    style={{
                      filter: 'drop-shadow(0 0 10px rgba(228, 0, 59, 0.3))',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
                <p className="text-gray-400 text-sm font-light">
                  Inicia sesión en tu cuenta
                </p>
              </motion.div>

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
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
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
                          autoFocus
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
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
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
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
                    </motion.div>

                    {/* Enlace de recuperación */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="text-center mt-4"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setShowRecovery(true)
                          setShowLoginForm(false)
                        }}
                        className="text-gray-400 hover:text-gray-300 text-xs font-light underline underline-offset-4 transition-colors flex items-center gap-1 mx-auto"
                      >
                        <Key className="w-3 h-3" />
                        <span>¿Olvidaste tu contraseña o usuario?</span>
                      </button>
                    </motion.div>
                  </form>
                </div>
              </div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-center mt-6 space-y-2"
              >
                <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Protegido con encriptación</span>
                </div>
                <p className="text-gray-600 text-xs font-light">
                  © 2025 Piker. Todos los derechos reservados.
                </p>
              </motion.div>
            </motion.div>
          ) : showAcquireApp ? (
            // Pantalla de adquirir app - Planes Premium
            <motion.div
              key="acquire-app"
              initial={{ x: -1000, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -1000, opacity: 0 }}
              transition={{ 
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="w-full max-w-6xl mx-auto"
            >
              {/* Botón Atrás */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6 flex justify-end"
              >
                <motion.button
                  whileHover={{ scale: 1.05, x: 2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowAcquireApp(false)
                    setShowRecovery(false)
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors group"
                  aria-label="Volver"
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
              </motion.div>

              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-center mb-8"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="mb-6"
                >
                  <div className="relative inline-flex items-center justify-center mb-4">
                    <img
                      src="/logo.png"
                      alt="Logo"
                      className="w-32 h-auto object-contain"
                      style={{
                        filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.2))',
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div
                      className="hidden items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-luxury-raspberry to-luxury-raspberryDark"
                      style={{
                        filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.4))',
                      }}
                    >
                      <Shield
                        className="w-10 h-10 text-white"
                        strokeWidth={2}
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-3xl md:text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent"
                >
                  Elige tu Plan Premium
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-gray-400 text-sm md:text-base leading-relaxed mb-2"
                >
                  Renta mensual con mensajería ilimitada certificada
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="flex items-center justify-center gap-2 text-xs text-gray-500"
                >
                  <Sparkles className="w-4 h-4 text-luxury-gold" />
                  <span>Planes flexibles • Sin compromisos • Soporte 24/7</span>
                </motion.div>
              </motion.div>

              {/* Planes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Plan Básico */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative group"
                >
                  <div className="relative h-full bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-transparent border border-blue-500/30 rounded-xl p-5 backdrop-blur-xl overflow-hidden">
                    {/* Efecto de brillo */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Contenido */}
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                            <Zap className="w-4 h-4 text-blue-400" />
                          </div>
                          <h3 className="text-xl font-bold text-white">Plan Básico</h3>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30">
                          BÁSICO
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-3xl font-bold text-white">$17</span>
                        <span className="text-gray-400 text-xs ml-1">/mes</span>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span><strong className="text-white">1,000</strong> mensajes/mes • Envío masivo certificado • Soporte técnico</span>
                        </div>
                      </div>
                      
                      <motion.a
                        href={`https://wa.me/${supportContacts[0].phone}?text=${encodeURIComponent('Hola, me interesa el Plan Básico de Piker (1,000 mensajes - $17/mes)')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="block w-full py-2.5 px-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 hover:text-blue-200 text-center text-sm font-semibold transition-all duration-300 group"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <FaWhatsapp className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                          Solicitar Plan
                        </span>
                      </motion.a>
                    </div>
                  </div>
                </motion.div>

                {/* Plan Pro - Best Choice */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative group"
                >
                  {/* Badge Mejor Opción */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                      className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-black text-[10px] font-bold shadow-xl shadow-yellow-500/70 flex items-center gap-1.5 border-2 border-yellow-200"
                      style={{
                        background: 'linear-gradient(135deg, #FCD34D 0%, #FBBF24 50%, #F59E0B 100%)',
                        boxShadow: '0 4px 20px rgba(251, 191, 36, 0.6), 0 0 0 2px rgba(255, 255, 255, 0.3)',
                      }}
                    >
                      <Crown className="w-3 h-3 text-black" />
                      <span className="text-black font-extrabold">MEJOR OPCIÓN</span>
                    </motion.div>
                  </div>

                  <div className="relative h-full bg-gradient-to-br from-purple-500/20 via-purple-600/15 to-transparent border-2 border-purple-500/50 rounded-xl p-5 backdrop-blur-xl overflow-hidden shadow-2xl shadow-purple-500/20">
                    {/* Efecto de brillo animado */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-transparent"
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    {/* Partículas de brillo */}
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1.5 h-1.5 bg-purple-400 rounded-full"
                          style={{
                            left: `${25 + i * 20}%`,
                            top: `${35 + i * 15}%`,
                          }}
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Contenido */}
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-purple-500/30 border border-purple-500/50">
                            <Sparkles className="w-4 h-4 text-purple-300" />
                          </div>
                          <h3 className="text-xl font-bold text-white">Plan Pro</h3>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 text-[10px] font-bold border border-purple-500/50">
                          PRO
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-3xl font-bold text-white">$25</span>
                        <span className="text-gray-400 text-xs ml-1">/mes</span>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
                          <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          <span><strong className="text-white">3,000</strong> mensajes/mes • Envío masivo certificado</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          <span>Soporte prioritario • Análisis avanzado</span>
                        </div>
                      </div>
                      
                      <motion.a
                        href={`https://wa.me/${supportContacts[0].phone}?text=${encodeURIComponent('Hola, me interesa el Plan Pro de Piker (3,000 mensajes - $25/mes)')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="block w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-purple-500/40 to-purple-600/40 hover:from-purple-500/50 hover:to-purple-600/50 border border-purple-500/50 text-white text-center text-sm font-semibold transition-all duration-300 group shadow-lg shadow-purple-500/30"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <FaWhatsapp className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                          Solicitar Plan
                        </span>
                      </motion.a>
                    </div>
                  </div>
                </motion.div>

                {/* Plan Enterprise */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative group"
                >
                  <div className="relative h-full bg-gradient-to-br from-luxury-gold/20 via-yellow-500/10 to-transparent border border-luxury-gold/40 rounded-xl p-5 backdrop-blur-xl overflow-hidden">
                    {/* Efecto de brillo */}
                    <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold/0 via-luxury-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Contenido */}
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-luxury-gold/30 border border-luxury-gold/50">
                            <Crown className="w-4 h-4 text-luxury-gold" />
                          </div>
                          <h3 className="text-xl font-bold text-white">Plan Enterprise</h3>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-luxury-gold/20 text-luxury-gold text-[10px] font-bold border border-luxury-gold/40">
                          ENTERPRISE
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-3xl font-bold text-white">$47</span>
                        <span className="text-gray-400 text-xs ml-1">/mes</span>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
                          <Check className="w-4 h-4 text-luxury-gold flex-shrink-0" />
                          <span><strong className="text-white">6,000</strong> mensajes/mes • Envío masivo certificado</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <Check className="w-4 h-4 text-luxury-gold flex-shrink-0" />
                          <span>Soporte 24/7 • Análisis avanzado • Personalización</span>
                        </div>
                      </div>
                      
                      <motion.a
                        href={`https://wa.me/${supportContacts[0].phone}?text=${encodeURIComponent('Hola, me interesa el Plan Enterprise de Piker (6,000 mensajes - $47/mes)')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="block w-full py-2.5 px-3 rounded-lg bg-luxury-gold/20 hover:bg-luxury-gold/30 border border-luxury-gold/50 text-luxury-gold hover:text-yellow-300 text-center text-sm font-semibold transition-all duration-300 group"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <FaWhatsapp className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                          Solicitar Plan
                        </span>
                      </motion.a>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Información adicional */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="text-center"
              >
                <p className="text-gray-400 text-sm mb-2">
                  💬 Contáctanos por WhatsApp para más información
                </p>
                <p className="text-gray-500 text-xs">
                  Nuestro equipo responderá en breve • Todos los planes incluyen soporte técnico
                </p>
              </motion.div>
            </motion.div>
          ) : (
            // Pantalla de recuperación
            <motion.div
              key="recovery"
              initial={{ x: 1000, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 1000, opacity: 0 }}
              transition={{ 
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="w-full"
            >
              {/* Botón Atrás */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <motion.button
                  whileHover={{ scale: 1.05, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowRecovery(false)
                    setShowLoginForm(true)
                    setRecoveryStep('select')
                    setRecoveryEmail('')
                    setRecoveryError('')
                    setRecoverySuccess('')
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors group"
                  aria-label="Volver"
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
              </motion.div>

              {/* Contenido de recuperación */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-center mb-6"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="mb-4"
                >
                  <div className="relative inline-flex items-center justify-center mb-4">
                    <div className="p-4 rounded-full bg-red-500/10 border-2 border-red-500/30">
                      <Key className="w-8 h-8 text-red-500" />
                    </div>
                  </div>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  Recuperar Acceso
                </motion.h2>
              </motion.div>

              {/* Card de recuperación */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-luxury-raspberry/10 via-transparent to-luxury-raspberryDark/10 rounded-2xl blur-xl" />
                
                <div className="relative card-luxury border-luxury-brightBlue/20 backdrop-blur-xl bg-luxury-navyBlue/40 p-6">
                  {recoveryError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 mb-4 backdrop-blur-sm"
                    >
                      <p className="text-red-400 text-sm font-medium">{recoveryError}</p>
                    </motion.div>
                  )}

                  {recoverySuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="bg-green-500/10 border border-green-500/50 rounded-xl p-3 mb-4 backdrop-blur-sm"
                    >
                      <p className="text-green-400 text-sm font-medium">{recoverySuccess}</p>
                    </motion.div>
                  )}


                  {recoveryStep === 'select' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <p className="text-gray-400 text-sm text-center mb-4">
                        ¿Qué necesitas recuperar?
                      </p>
                      <div className="grid grid-cols-1 gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setRecoveryStep('username')
                            setRecoveryError('')
                            setRecoverySuccess('')
                            setTemporaryPassword('')
                            setPasswordCopied(false)
                          }}
                          className="p-4 rounded-xl border-2 border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all duration-300 flex items-center justify-center gap-3"
                        >
                          <User className="w-5 h-5" />
                          <span className="font-semibold">Olvidé mi Usuario</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setRecoveryStep('password')
                            setRecoveryError('')
                            setRecoverySuccess('')
                            setTemporaryPassword('')
                            setPasswordCopied(false)
                          }}
                          className="p-4 rounded-xl border-2 border-red-500/50 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-300 flex items-center justify-center gap-3"
                        >
                          <Key className="w-5 h-5" />
                          <span className="font-semibold">Olvidé mi Contraseña</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {recoveryStep === 'username' && (
                    <motion.form
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onSubmit={handleRecoverUsername}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-2">
                          Email
                        </label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500 w-4 h-4 z-10 group-hover:text-red-600 transition-colors" />
                          <input
                            type="email"
                            value={recoveryEmail}
                            onChange={(e) => setRecoveryEmail(e.target.value)}
                            className="relative w-full pl-10 pr-4 py-2.5 bg-white border border-luxury-raspberry/20 rounded-lg text-gray-900 placeholder-gray-400 hover:border-luxury-raspberry/40 focus:border-luxury-raspberry focus:outline-none transition-all text-sm"
                            placeholder="tu@email.com"
                            required
                            disabled={recoveryLoading}
                            autoFocus
                          />
                        </div>
                        <p className="text-gray-500 text-xs mt-2">
                          Te enviaremos un correo con tu nombre de usuario
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={recoveryLoading}
                          className="btn-primary flex-1 flex items-center justify-center space-x-2 text-sm font-semibold py-3 relative overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-luxury-cyan via-luxury-brightBlue to-luxury-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          {recoveryLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                              <span className="relative z-10">Enviando...</span>
                            </>
                          ) : (
                            <span className="relative z-10">Enviar Usuario</span>
                          )}
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setRecoveryStep('select')
                            setRecoveryEmail('')
                            setRecoveryError('')
                            setTemporaryPassword('')
                            setPasswordCopied(false)
                          }}
                          className="px-4 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700/50 transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.form>
                  )}

                  {recoveryStep === 'password' && (
                    <motion.form
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onSubmit={handleRecoverPassword}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-2">
                          Email o Usuario
                        </label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500 w-4 h-4 z-10 group-hover:text-red-600 transition-colors" />
                          <input
                            type="text"
                            value={recoveryEmail}
                            onChange={(e) => setRecoveryEmail(e.target.value)}
                            className="relative w-full pl-10 pr-4 py-2.5 bg-white border border-luxury-raspberry/20 rounded-lg text-gray-900 placeholder-gray-400 hover:border-luxury-raspberry/40 focus:border-luxury-raspberry focus:outline-none transition-all text-sm"
                            placeholder="tu@email.com o usuario"
                            required
                            disabled={recoveryLoading}
                            autoFocus
                          />
                        </div>
                        <p className="text-gray-500 text-xs mt-2">
                          Te enviaremos una contraseña temporal a tu correo electrónico
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={recoveryLoading}
                          className="btn-primary flex-1 flex items-center justify-center space-x-2 text-sm font-semibold py-3 relative overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-luxury-cyan via-luxury-brightBlue to-luxury-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          {recoveryLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                              <span className="relative z-10">Enviando...</span>
                            </>
                          ) : (
                            <span className="relative z-10">Enviar Contraseña Temporal</span>
                          )}
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setRecoveryStep('select')
                            setRecoveryEmail('')
                            setRecoveryError('')
                            setTemporaryPassword('')
                            setPasswordCopied(false)
                          }}
                          className="px-4 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700/50 transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.form>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
                    <FaWhatsapp className="w-4 h-4 text-green-500 group-hover:text-green-400 transition-colors" />
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
                    <FaWhatsapp className="w-4 h-4 text-green-500 group-hover:text-green-400 transition-colors" />
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
