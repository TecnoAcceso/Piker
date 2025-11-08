import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  Send,
  FileText,
  BarChart3,
  Key,
  Users,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  XCircle,
  Shield,
  Zap,
  Settings,
  Info
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import UserProfileModal from './UserProfileModal'

export default function Layout({ children }) {
  // Sidebar closed by default on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)

  // Open sidebar on desktop by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }

    // Set initial state
    handleResize()

    // Listen for window resize
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const { profile, signOut, isSystemAdmin } = useAuth()
  const [licenseStatus, setLicenseStatus] = useState({
    hasLicense: false,
    license: null,
    loading: true
  })

  // Fetch license status con la misma lógica que AuthContext
  useEffect(() => {
    const fetchLicenseStatus = async () => {
      if (!profile?.id) {
        setLicenseStatus({ hasLicense: false, license: null, loading: false })
        return
      }

      // Los system_admin no necesitan licencia
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
        
        // Obtener todas las licencias del usuario para debugging
        const { data: allLicenses } = await supabase
          .from('licenses')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })

        // Buscar licencia activa
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
        
        // Verificar fecha de validez
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

    fetchLicenseStatus()
  }, [profile])
  const location = useLocation()
  const navigate = useNavigate()

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }, [location.pathname])

  // Función para calcular días restantes de la licencia
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
    navigate('/login')
  }

  const navigation = [
    {
      name: 'Inicio',
      href: '/dashboard',
      icon: BarChart3,
      show: true
    },
    {
      name: 'Enviar Mensajes',
      href: '/send',
      icon: Send,
      show: true,
      submenu: [
        { name: 'Paquetes Recibidos', href: '/send/received' },
        { name: 'Recordatorios', href: '/send/reminder' },
        { name: 'Devoluciones', href: '/send/return' }
      ]
    },
    {
      name: 'Plantillas',
      href: '/templates',
      icon: FileText,
      show: true
    },
    {
      name: 'Usuarios',
      href: '/users',
      icon: Users,
      show: isSystemAdmin
    },
    {
      name: 'Licencias',
      href: '/licenses',
      icon: Key,
      show: isSystemAdmin
    }
  ]

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(180deg, #1a1f3d 0%, #252b4d 100%)' }}>
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col"
            style={{
              background: 'linear-gradient(180deg, #1a1f3d 0%, #252b4d 100%)',
              backdropFilter: 'blur(20px)',
              borderRight: '1px solid rgba(228, 0, 59, 0.3)',
              boxShadow: '0 0 40px rgba(228, 0, 59, 0.2)',
            }}
          >
            {/* Logo */}
            <div className="h-20 flex items-center justify-between px-6 relative">
              <Link to="/dashboard" className="flex items-center justify-center flex-1 relative z-10">
                <motion.img
                  src="/logo.png"
                  alt="Piker Logo"
                  className="h-16 w-auto object-contain"
                  style={{
                    filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.6))',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div
                  className="hidden items-center justify-center relative z-10"
                  style={{
                    filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.6))',
                  }}
                >
                  <Package
                    className="w-10 h-10"
                    style={{ color: '#E4003B' }}
                    strokeWidth={2}
                  />
                </div>
              </Link>
              <motion.button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 relative z-20"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171'
                }}
                whileHover={{ scale: 1.1, x: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
              {navigation.map((item, index) => {
                if (!item.show) return null
                const active = isActive(item.href)

                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link to={item.href}>
                      <motion.div
                        className="relative flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group"
                        style={{
                          background: active
                            ? 'linear-gradient(135deg, rgba(228, 0, 59, 0.15) 0%, rgba(199, 0, 58, 0.1) 100%)'
                            : 'transparent',
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: active ? 'rgba(228, 0, 59, 0.4)' : 'transparent',
                          boxShadow: active ? '0 4px 16px rgba(228, 0, 59, 0.3)' : 'none'
                        }}
                        whileHover={{ x: 4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Hover glow effect */}
                        {!active && (
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-luxury-raspberry/5 to-luxury-raspberryDark/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        )}

                        <div className="flex items-center space-x-3 relative z-10">
                          <motion.div
                            className="flex-shrink-0"
                            animate={active ? { rotate: [0, 5, -5, 0] } : {}}
                            transition={{ duration: 0.5 }}
                          >
                            <item.icon
                              className="w-5 h-5"
                              style={{
                                color: active ? '#E4003B' : '#ffffff',
                                filter: active ? 'drop-shadow(0 0 8px rgba(228, 0, 59, 0.6))' : 'none'
                              }}
                            />
                          </motion.div>
                          <span
                            className="font-semibold transition-colors duration-300"
                            style={{
                              color: active ? '#E4003B' : '#ffffff'
                            }}
                          >
                            {item.name}
                          </span>
                        </div>
                        {item.submenu && (
                          <ChevronRight
                            className="w-4 h-4 transition-all duration-300 relative z-10"
                            style={{
                              color: active ? '#E4003B' : '#ffffff',
                              transform: active ? 'rotate(90deg)' : 'rotate(0deg)'
                            }}
                          />
                        )}
                      </motion.div>
                    </Link>

                    {/* Submenu */}
                    {item.submenu && active && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-4 mt-2 space-y-1"
                      >
                        {item.submenu.map((subitem) => {
                          const subActive = location.pathname === subitem.href
                          return (
                            <Link key={subitem.name} to={subitem.href}>
                              <motion.div
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                                style={{
                                  background: subActive ? 'rgba(228, 0, 59, 0.15)' : 'transparent',
                                  color: subActive ? '#E4003B' : '#ffffff'
                                }}
                                whileHover={{ x: 4, backgroundColor: 'rgba(228, 0, 59, 0.1)' }}
                              >
                                {subitem.name}
                              </motion.div>
                            </Link>
                          )
                        })}
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t" style={{ borderColor: 'rgba(228, 0, 59, 0.2)' }}>
              <motion.div
                onClick={() => setProfileModalOpen(true)}
                className="flex items-center space-x-3 mb-4 p-3 rounded-xl cursor-pointer relative"
                style={{
                  background: 'linear-gradient(135deg, rgba(228, 0, 59, 0.1) 0%, rgba(199, 0, 58, 0.1) 100%)',
                  border: '1px solid rgba(228, 0, 59, 0.2)'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="w-12 h-12 rounded-xl flex items-center justify-center relative flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #E4003B 0%, #C7003A 100%)',
                    boxShadow: '0 4px 16px rgba(228, 0, 59, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.2)'
                  }}
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-white font-bold text-lg drop-shadow-lg">
                    {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                  {/* Burbuja de notificación */}
                  <motion.div
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center z-10"
                    style={{
                      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                      boxShadow: '0 2px 8px rgba(251, 191, 36, 0.5), 0 0 0 2px rgba(15, 23, 42, 0.8)'
                    }}
                    animate={{ 
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        '0 2px 8px rgba(251, 191, 36, 0.5), 0 0 0 2px rgba(15, 23, 42, 0.8)',
                        '0 4px 12px rgba(251, 191, 36, 0.7), 0 0 0 2px rgba(15, 23, 42, 0.8)',
                        '0 2px 8px rgba(251, 191, 36, 0.5), 0 0 0 2px rgba(15, 23, 42, 0.8)'
                      ]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Settings className="w-2.5 h-2.5 text-white" />
                  </motion.div>
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-bold text-luxury-white truncate">
                      {profile?.full_name || 'Usuario'}
                    </p>
                    {/* Indicador de click */}
                    <motion.div
                      className="flex items-center space-x-1"
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Info className="w-3 h-3 text-luxury-raspberry" />
                    </motion.div>
                  </div>
                  <p className="text-xs text-luxury-raspberry font-medium capitalize">
                    {profile?.role === 'system_admin' ? 'System Admin' : profile?.role}
                  </p>
                  <p className="text-[10px] text-gray-300 mt-0.5 italic">
                    Click para ver perfil
                  </p>
                </div>
              </motion.div>
              <motion.button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group relative overflow-hidden"
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
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header
          className="h-20 border-b flex items-center justify-between px-8"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            borderColor: 'rgba(228, 0, 59, 0.2)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
          }}
        >
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group"
              style={{
                background: 'linear-gradient(135deg, rgba(228, 0, 59, 0.1) 0%, rgba(199, 0, 58, 0.1) 100%)',
                border: '1px solid rgba(228, 0, 59, 0.2)'
              }}
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu
                className="w-5 h-5 transition-colors"
                style={{ color: '#ffffff' }}
              />
            </motion.button>
            <motion.img
              src="/palabra.png"
              alt="Piker"
              className="h-6 w-auto object-contain"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))',
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            />
          </div>

          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm font-medium text-gray-300">
              Hola, <span className="text-luxury-white font-semibold">{profile?.full_name || 'Usuario'}</span>
            </p>
          </motion.div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 pb-16 md:pb-14">
          {children}
        </main>

        {/* Footer - Compacto y Premium */}
        <footer
          className="border-t py-1.5 px-3 md:px-6 fixed bottom-0 left-0 right-0 z-30"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.99) 0%, rgba(30, 41, 59, 0.99) 100%)',
            backdropFilter: 'blur(24px)',
            borderTop: '1px solid rgba(228, 0, 59, 0.3)',
            boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(228, 0, 59, 0.1)'
          }}
        >
          <div className="flex items-center justify-between gap-2 md:gap-4 overflow-hidden">
            {/* License Status - Compacto con días restantes */}
            <div className="flex items-center space-x-1.5 min-w-0 flex-shrink">
              {licenseStatus.loading ? (
                <div className="flex items-center space-x-1.5">
                  <motion.div
                    className="w-3 h-3 border-2 border-luxury-raspberry border-t-transparent rounded-full flex-shrink-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="text-[10px] md:text-xs text-gray-300 font-medium whitespace-nowrap">Verificando...</span>
                </div>
              ) : licenseStatus.hasLicense ? (
                <>
                  {profile?.role === 'system_admin' ? (
                    <div className="flex items-center space-x-1.5 px-2 py-1 rounded-md"
                      style={{
                        background: 'linear-gradient(135deg, rgba(228, 0, 59, 0.15) 0%, rgba(199, 0, 58, 0.1) 100%)',
                        border: '1px solid rgba(228, 0, 59, 0.3)'
                      }}
                    >
                      <Shield className="w-3 h-3 text-luxury-raspberry flex-shrink-0" />
                      <span className="text-[10px] md:text-xs font-semibold text-luxury-raspberry whitespace-nowrap">System Admin</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5 px-2 py-1 rounded-md"
                      style={{
                        background: (() => {
                          const daysRemaining = licenseStatus.license?.valid_until ? getDaysRemaining(licenseStatus.license.valid_until) : null
                          if (daysRemaining === null) return 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.1) 100%)'
                          if (daysRemaining > 7) return 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.1) 100%)'
                          if (daysRemaining >= 1) return 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)'
                          return 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)'
                        })(),
                        border: (() => {
                          const daysRemaining = licenseStatus.license?.valid_until ? getDaysRemaining(licenseStatus.license.valid_until) : null
                          if (daysRemaining === null) return '1px solid rgba(34, 197, 94, 0.3)'
                          if (daysRemaining > 7) return '1px solid rgba(34, 197, 94, 0.3)'
                          if (daysRemaining >= 1) return '1px solid rgba(251, 191, 36, 0.3)'
                          return '1px solid rgba(239, 68, 68, 0.3)'
                        })()
                      }}
                    >
                      <CheckCircle 
                        className="w-3 h-3 flex-shrink-0"
                        style={{
                          color: (() => {
                            const daysRemaining = licenseStatus.license?.valid_until ? getDaysRemaining(licenseStatus.license.valid_until) : null
                            if (daysRemaining === null) return '#4ade80'
                            if (daysRemaining > 7) return '#4ade80'
                            if (daysRemaining >= 1) return '#fbbf24'
                            return '#f87171'
                          })()
                        }}
                      />
                      <span 
                        className="text-[10px] md:text-xs font-semibold whitespace-nowrap"
                        style={{
                          color: (() => {
                            const daysRemaining = licenseStatus.license?.valid_until ? getDaysRemaining(licenseStatus.license.valid_until) : null
                            if (daysRemaining === null) return '#4ade80'
                            if (daysRemaining > 7) return '#4ade80'
                            if (daysRemaining >= 1) return '#fbbf24'
                            return '#f87171'
                          })()
                        }}
                      >
                        {licenseStatus.license?.valid_until && (() => {
                          const daysRemaining = getDaysRemaining(licenseStatus.license.valid_until)
                          if (daysRemaining !== null) {
                            return daysRemaining === 0 ? 'Expira hoy' :
                                   daysRemaining === 1 ? '1 día' :
                                   daysRemaining < 0 ? 'Expirada' :
                                   `${daysRemaining}d`
                          }
                          return 'Activa'
                        })() || 'Activa'}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center space-x-1.5 px-2 py-1 rounded-md"
                  style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}
                >
                  <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                  <span className="text-[10px] md:text-xs font-semibold text-red-400 whitespace-nowrap">Sin licencia</span>
                </div>
              )}
            </div>

            {/* Branding Premium - Empresas Desarrolladoras */}
            <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
              <div className="flex items-center space-x-1.5 px-2 py-1 rounded-md"
                style={{
                  background: 'linear-gradient(135deg, rgba(228, 0, 59, 0.1) 0%, rgba(199, 0, 58, 0.05) 100%)',
                  border: '1px solid rgba(228, 0, 59, 0.2)'
                }}
              >
                <span className="text-sm md:text-base font-bold text-luxury-raspberry" style={{ fontFamily: 'monospace' }}>&lt;/&gt;</span>
                <div className="flex items-center space-x-1 md:space-x-1.5">
                  <span className="text-[10px] md:text-xs font-bold text-luxury-raspberry whitespace-nowrap">ElectroShop</span>
                  <span className="text-[10px] md:text-xs text-gray-400">/</span>
                  <span className="text-[10px] md:text-xs font-bold text-luxury-raspberryLight whitespace-nowrap">TecnoAcceso</span>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-1.5 text-[10px] text-gray-400">
                <span>© 2025</span>
                <span className="text-luxury-raspberry font-semibold">Piker</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* Profile Modal */}
      <UserProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </div>
  )
}
