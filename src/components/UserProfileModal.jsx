import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  User,
  Mail,
  Calendar,
  Clock,
  Shield,
  Key,
  Award,
  Zap,
  CheckCircle,
  XCircle,
  LogOut,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function UserProfileModal({ isOpen, onClose }) {
  const { profile, signOut, changePassword } = useAuth()
  const [licenseStatus, setLicenseStatus] = useState({
    hasLicense: false,
    license: null,
    loading: true
  })
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  // Fetch license status
  useEffect(() => {
    const fetchLicenseStatus = async () => {
      if (!profile?.id) {
        setLicenseStatus({ hasLicense: false, license: null, loading: false })
        return
      }

      if (profile.role === 'system_admin') {
        setLicenseStatus({ 
          hasLicense: true, 
          license: { plan_type: 'system_admin', message_limit: '∞' }, 
          loading: false 
        })
        return
      }

      try {
        setLicenseStatus(prev => ({ ...prev, loading: true }))
        
        const { data: licenses, error } = await supabase
          .from('licenses')
          .select('*')
          .eq('user_id', profile.id)
          .eq('is_active', true)
          .order('valid_until', { ascending: false })
          .limit(1)

        if (error) {
          console.error('Error verificando licencia:', error)
          setLicenseStatus({ hasLicense: false, license: null, loading: false })
          return
        }

        if (!licenses || licenses.length === 0) {
          setLicenseStatus({ hasLicense: false, license: null, loading: false })
          return
        }

        const license = licenses[0]
        
        let isValid = true
        if (license.valid_until) {
          const validUntil = new Date(license.valid_until)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          validUntil.setHours(0, 0, 0, 0)
          
          if (validUntil < today) {
            isValid = false
          }
        }

        setLicenseStatus({ 
          hasLicense: isValid, 
          license: isValid ? license : null, 
          loading: false 
        })
      } catch (error) {
        console.error('Error en fetchLicenseStatus:', error)
        setLicenseStatus({ hasLicense: false, license: null, loading: false })
      }
    }

    if (isOpen) {
      fetchLicenseStatus()
    }
  }, [profile, isOpen])

  const getDaysRemaining = (validUntil) => {
    if (!validUntil) return null
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiryDate = new Date(validUntil)
    expiryDate.setHours(0, 0, 0, 0)
    
    const diffTime = expiryDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/login'
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setPasswordLoading(true)

    try {
      const result = await changePassword(currentPassword, newPassword)
      
      if (result.success) {
        setPasswordSuccess('Contraseña actualizada exitosamente')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => {
          setShowChangePassword(false)
          setPasswordSuccess('')
        }, 2000)
      } else {
        setPasswordError(result.message || 'Error al cambiar la contraseña')
      }
    } catch (error) {
      setPasswordError('Error al cambiar la contraseña. Por favor, intente nuevamente.')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-luxury-darkGray rounded-2xl border border-luxury-lightGray max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(51, 65, 85, 0.98) 100%)',
                backdropFilter: 'blur(20px)',
                borderColor: 'rgba(59, 130, 246, 0.3)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.2) inset'
              }}
            >
              {/* Header */}
              <div className="p-6 border-b border-luxury-lightGray/30 relative overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-luxury-raspberry/10 via-luxury-raspberryDark/5 to-transparent" />
                <div className="flex items-center justify-between relative z-10 gap-4">
                  <div className="flex items-center space-x-4 min-w-0 flex-1">
                    <motion.div
                      className="w-16 h-16 rounded-xl flex items-center justify-center relative flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #E4003B 0%, #C7003A 100%)',
                        boxShadow: '0 8px 24px rgba(228, 0, 59, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.2)'
                      }}
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <span className="text-white font-bold text-2xl drop-shadow-lg">
                        {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </motion.div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl md:text-2xl font-heading font-bold text-luxury-white mb-1 truncate">
                        {profile?.full_name || 'Usuario'}
                      </h2>
                      <p className="text-xs md:text-sm text-gray-400 capitalize truncate">
                        {profile?.role === 'system_admin' ? 'System Administrator' : profile?.role || 'Usuario'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-luxury-gray/50 text-gray-400 hover:text-luxury-white flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Información del Usuario */}
                <div className="space-y-4">
                  <h3 className="text-lg font-heading font-semibold text-luxury-white flex items-center justify-center space-x-2">
                    <User className="w-5 h-5 text-luxury-raspberry" />
                    <span>Información del Usuario</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-luxury-lightGray/30 bg-luxury-gray/30 text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Nombre de Usuario</p>
                      </div>
                      <p className="text-sm font-semibold text-luxury-white truncate">{profile?.username || 'N/A'}</p>
                    </div>
                    <div className="p-3 rounded-xl border border-luxury-lightGray/30 bg-luxury-gray/30 text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
                      </div>
                      <p className="text-sm font-semibold text-luxury-white truncate">{profile?.email || 'N/A'}</p>
                    </div>
                    <div className="p-3 rounded-xl border border-luxury-lightGray/30 bg-luxury-gray/30 text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Fecha de Registro</p>
                      </div>
                      <p className="text-sm font-semibold text-luxury-white truncate">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('es-VE') : 'N/A'}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl border border-luxury-lightGray/30 bg-luxury-gray/30 text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Rol</p>
                      </div>
                      <p className="text-sm font-semibold text-luxury-white capitalize truncate">
                        {profile?.role === 'system_admin' ? 'System Administrator' : profile?.role || 'Usuario'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información de Licencia */}
                <div className="space-y-4">
                  <h3 className="text-lg font-heading font-semibold text-luxury-white flex items-center justify-center space-x-2">
                    <Key className="w-5 h-5 text-luxury-raspberry" />
                    <span>Información de Licencia</span>
                  </h3>
                  {licenseStatus.loading ? (
                    <div className="p-6 rounded-xl border border-luxury-lightGray/30 bg-luxury-gray/30 text-center">
                      <motion.div
                        className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full mx-auto mb-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <p className="text-sm text-gray-400">Cargando información de licencia...</p>
                    </div>
                  ) : licenseStatus.hasLicense ? (
                    <div className="space-y-4">
                      {profile?.role === 'system_admin' ? (
                        <div className="p-5 rounded-xl border border-luxury-gold/30 bg-gradient-to-br from-luxury-gold/10 to-yellow-500/5 text-center">
                          <div className="flex items-center justify-center space-x-3 mb-3">
                            <Shield className="w-6 h-6 text-luxury-gold" />
                            <h4 className="text-base font-semibold text-luxury-gold">System Administrator</h4>
                          </div>
                          <p className="text-sm text-gray-300">Acceso completo al sistema sin restricciones de licencia.</p>
                        </div>
                      ) : (
                        <>
                          <div className="p-5 rounded-xl border border-luxury-lightGray/30 bg-luxury-gray/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="text-center">
                                <div className="flex items-center justify-center space-x-2 mb-2">
                                  <Award className="w-4 h-4 text-gray-400" />
                                  <p className="text-xs text-gray-400 uppercase tracking-wide">Tipo de Plan</p>
                                </div>
                                <p className="text-sm font-semibold text-luxury-white capitalize">
                                  {(() => {
                                    const planType = licenseStatus.license?.plan_type
                                    const planLabels = {
                                      'basic': 'Básico',
                                      'pro': 'Pro',
                                      'enterprise': 'Enterprise',
                                      'system_admin': 'System Admin'
                                    }
                                    return planLabels[planType] || planType || 'N/A'
                                  })()}
                                </p>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center space-x-2 mb-2">
                                  <Zap className="w-4 h-4 text-gray-400" />
                                  <p className="text-xs text-gray-400 uppercase tracking-wide">Límite de Mensajes</p>
                                </div>
                                <p className="text-sm font-semibold text-luxury-white">
                                  {licenseStatus.license?.message_limit?.toLocaleString() || '∞'}
                                </p>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center space-x-2 mb-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <p className="text-xs text-gray-400 uppercase tracking-wide">Válida Hasta</p>
                                </div>
                                <p className="text-sm font-semibold text-luxury-white">
                                  {licenseStatus.license?.valid_until 
                                    ? new Date(licenseStatus.license.valid_until).toLocaleDateString('es-VE')
                                    : 'Sin expiración'}
                                </p>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center space-x-2 mb-2">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <p className="text-xs text-gray-400 uppercase tracking-wide">Estado</p>
                                </div>
                                <div className="flex items-center justify-center space-x-2">
                                  {(() => {
                                    const daysRemaining = licenseStatus.license?.valid_until 
                                      ? getDaysRemaining(licenseStatus.license.valid_until) 
                                      : null
                                    const isExpired = daysRemaining !== null && daysRemaining < 0
                                    const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0
                                    
                                    return (
                                      <>
                                        {isExpired ? (
                                          <XCircle className="w-4 h-4 text-red-400" />
                                        ) : isExpiringSoon ? (
                                          <Clock className="w-4 h-4 text-yellow-400" />
                                        ) : (
                                          <CheckCircle className="w-4 h-4 text-green-400" />
                                        )}
                                        <p className={`text-sm font-semibold ${
                                          isExpired ? 'text-red-400' : 
                                          isExpiringSoon ? 'text-yellow-400' : 
                                          'text-green-400'
                                        }`}>
                                          {daysRemaining === null ? 'Activa' :
                                           daysRemaining < 0 ? 'Expirada' :
                                           daysRemaining === 0 ? 'Expira hoy' :
                                           daysRemaining === 1 ? '1 día restante' :
                                           `${daysRemaining} días restantes`}
                                        </p>
                                      </>
                                    )
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                          {licenseStatus.license?.license_key && (
                            <div className="p-4 rounded-xl border border-luxury-lightGray/30 bg-luxury-gray/30 text-center">
                              <div className="flex items-center justify-center space-x-2 mb-2">
                                <Key className="w-4 h-4 text-gray-400" />
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Clave de Licencia</p>
                              </div>
                              <p className="text-xs font-mono text-luxury-white break-all">{licenseStatus.license.license_key}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="p-5 rounded-xl border border-red-500/30 bg-red-500/10 text-center">
                      <div className="flex items-center justify-center space-x-3 mb-2">
                        <XCircle className="w-5 h-5 text-red-400" />
                        <h4 className="text-base font-semibold text-red-400">Sin Licencia Activa</h4>
                      </div>
                      <p className="text-sm text-gray-300">No tienes una licencia activa asignada. Contacta al administrador para obtener una.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sección de Cambiar Contraseña */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-heading font-semibold text-luxury-white flex items-center space-x-2">
                    <Key className="w-5 h-5 text-luxury-raspberry" />
                    <span>Seguridad</span>
                  </h3>
                  {!showChangePassword && (
                    <motion.button
                      onClick={() => {
                        setShowChangePassword(true)
                        setPasswordError('')
                        setPasswordSuccess('')
                      }}
                      className="px-4 py-2 rounded-lg border border-luxury-raspberry/50 bg-luxury-raspberry/10 text-luxury-raspberry hover:bg-luxury-raspberry/20 transition-all text-sm font-semibold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cambiar Contraseña
                    </motion.button>
                  )}
                </div>

                {showChangePassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-5 rounded-xl border border-luxury-lightGray/30 bg-luxury-gray/30"
                  >
                    {passwordError && (
                      <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                        <p className="text-red-400 text-sm">{passwordError}</p>
                      </div>
                    )}

                    {passwordSuccess && (
                      <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                        <p className="text-green-400 text-sm">{passwordSuccess}</p>
                      </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-2">
                          Contraseña Actual
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full pl-4 pr-10 py-2.5 bg-luxury-darkGray border border-luxury-lightGray/30 rounded-lg text-luxury-white placeholder-gray-500 focus:border-luxury-raspberry focus:outline-none transition-all text-sm"
                            placeholder="Ingresa tu contraseña actual"
                            required
                            disabled={passwordLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-luxury-white transition-colors"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-2">
                          Nueva Contraseña
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full pl-4 pr-10 py-2.5 bg-luxury-darkGray border border-luxury-lightGray/30 rounded-lg text-luxury-white placeholder-gray-500 focus:border-luxury-raspberry focus:outline-none transition-all text-sm"
                            placeholder="Nueva contraseña (mín. 6 caracteres)"
                            required
                            disabled={passwordLoading}
                            minLength={6}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-luxury-white transition-colors"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-2">
                          Confirmar Nueva Contraseña
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-4 pr-10 py-2.5 bg-luxury-darkGray border border-luxury-lightGray/30 rounded-lg text-luxury-white placeholder-gray-500 focus:border-luxury-raspberry focus:outline-none transition-all text-sm"
                            placeholder="Confirma tu nueva contraseña"
                            required
                            disabled={passwordLoading}
                            minLength={6}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-luxury-white transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <motion.button
                          type="submit"
                          disabled={passwordLoading}
                          className="flex-1 px-4 py-2.5 rounded-lg bg-luxury-raspberry text-white font-semibold hover:bg-luxury-raspberryDark transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={{ scale: passwordLoading ? 1 : 1.02 }}
                          whileTap={{ scale: passwordLoading ? 1 : 0.98 }}
                        >
                          {passwordLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Actualizando...</span>
                            </>
                          ) : (
                            <span>Actualizar Contraseña</span>
                          )}
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => {
                            setShowChangePassword(false)
                            setCurrentPassword('')
                            setNewPassword('')
                            setConfirmPassword('')
                            setPasswordError('')
                            setPasswordSuccess('')
                          }}
                          className="px-4 py-2.5 rounded-lg border border-luxury-lightGray/30 text-gray-300 hover:bg-luxury-gray/50 transition-all text-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Cancelar
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-luxury-lightGray/30 bg-luxury-gray/20">
                <motion.button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <LogOut className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Cerrar Sesión</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

