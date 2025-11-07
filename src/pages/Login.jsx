import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Lock, Loader2, Shield, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await signIn(username, password)

      if (error) {
        setError(error.message)
        return
      }

      if (data) {
        navigate('/dashboard')
      }
    } catch (err) {
      setError('Error al iniciar sesión. Por favor, intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 100%)',
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-[700px] h-[700px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, rgba(6, 182, 212, 0.08) 50%, transparent 100%)',
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(147, 197, 253, 0.15) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-luxury-brightBlue rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)',
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Premium Logo and Title */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
            className="relative inline-block mb-8"
          >
            {/* Outer Glow Ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, #3b82f6, #06b6d4, #60a5fa, #3b82f6)',
                filter: 'blur(30px)',
              }}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            {/* Middle Glow */}
            <div className="absolute inset-2 bg-gradient-to-br from-luxury-brightBlue via-luxury-cyan to-luxury-skyBlue rounded-full blur-2xl opacity-60 animate-pulse" />

            {/* Icon Container */}
            <motion.div
              className="relative inline-flex items-center justify-center w-28 h-28 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                boxShadow: '0 0 60px rgba(59, 130, 246, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)',
              }}
              animate={{
                boxShadow: [
                  '0 0 60px rgba(59, 130, 246, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)',
                  '0 0 80px rgba(6, 182, 212, 0.8), inset 0 0 30px rgba(255, 255, 255, 0.3)',
                  '0 0 60px rgba(59, 130, 246, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Shield className="w-14 h-14 text-white drop-shadow-lg" strokeWidth={2} />
              <motion.div
                className="absolute"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <Sparkles className="w-7 h-7 text-white absolute -top-1 -right-1" />
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-display font-bold gradient-text mb-3 tracking-tight"
          >
            Piker
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-lg font-light tracking-wide"
          >
            Sistema de Mensajería Premium
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-luxury-brightBlue to-transparent"
          />
        </div>

        {/* Premium Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          {/* Card glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-luxury-brightBlue/20 via-transparent to-luxury-cyan/20 rounded-2xl blur-2xl" />

          <div className="relative card-luxury border-luxury-brightBlue/20 backdrop-blur-xl bg-luxury-navyBlue/40">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-display font-semibold text-luxury-white">
                Acceso Exclusivo
              </h2>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-luxury-brightBlue" />
              </motion.div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6 backdrop-blur-sm"
              >
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3 tracking-wide">
                  Usuario
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-luxury-brightBlue/20 to-luxury-cyan/20 rounded-xl blur group-hover:blur-md transition-all opacity-0 group-hover:opacity-100" />
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-luxury-brightBlue/70 w-5 h-5 z-10 group-hover:text-luxury-brightBlue transition-colors" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="relative input-luxury pl-12 bg-luxury-navyBlue/50 border-luxury-brightBlue/20 hover:border-luxury-brightBlue/40 focus:border-luxury-brightBlue transition-all"
                    placeholder="Usuario"
                    required
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3 tracking-wide">
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-luxury-brightBlue/20 to-luxury-cyan/20 rounded-xl blur group-hover:blur-md transition-all opacity-0 group-hover:opacity-100" />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-luxury-brightBlue/70 w-5 h-5 z-10 group-hover:text-luxury-brightBlue transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="relative input-luxury pl-12 bg-luxury-navyBlue/50 border-luxury-brightBlue/20 hover:border-luxury-brightBlue/40 focus:border-luxury-brightBlue transition-all"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 20px 60px rgba(59, 130, 246, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-3 mt-8 text-lg font-semibold py-4 shadow-glow-blue-lg relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-luxury-cyan via-luxury-brightBlue to-luxury-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                    <span className="relative z-10">Verificando acceso...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Iniciar Sesión</span>
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Premium Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8 space-y-4"
        >
          <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
            <Shield className="w-4 h-4" />
            <span>Protegido con encriptación de grado empresarial</span>
          </div>

          <p className="text-gray-600 text-sm font-light">
            © 2025 Piker. Todos los derechos reservados.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
