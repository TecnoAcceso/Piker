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
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function Layout({ children }) {
  // Sidebar closed by default on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [license, setLicense] = useState(null)

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

  // Fetch license status
  useEffect(() => {
    const fetchLicense = async () => {
      if (!profile?.id) return

      try {
        const { data, error } = await supabase
          .from('licenses')
          .select('*')
          .eq('user_id', profile.id)
          .eq('is_active', true)
          .gte('valid_until', new Date().toISOString())
          .order('valid_until', { ascending: false })
          .limit(1)

        if (error) throw error
        setLicense(data && data.length > 0 ? data[0] : null)
      } catch (error) {
        console.error('Error fetching license:', error)
      }
    }

    fetchLicense()
  }, [profile])
  const location = useLocation()
  const navigate = useNavigate()

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
      name: 'Historial',
      href: '/history',
      icon: Package,
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
    <div className="min-h-screen bg-luxury-black flex">
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
              background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              borderRight: '1px solid rgba(59, 130, 246, 0.2)',
              boxShadow: '0 0 40px rgba(59, 130, 246, 0.1)',
            }}
          >
            {/* Logo */}
            <div className="h-20 flex items-center justify-between px-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-luxury-brightBlue/5 to-transparent" />
              <Link to="/dashboard" className="flex items-center space-x-3 relative z-10">
                <motion.div
                  className="relative w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1)',
                  }}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Package className="w-7 h-7 text-white drop-shadow-lg" />
                </motion.div>
                <span className="text-2xl font-display font-bold gradient-text">
                  Piker
                </span>
              </Link>
              <motion.button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 relative z-20"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171'
                }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
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
                            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%)'
                            : 'transparent',
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: active ? 'rgba(59, 130, 246, 0.4)' : 'transparent',
                          boxShadow: active ? '0 4px 16px rgba(59, 130, 246, 0.2)' : 'none'
                        }}
                        whileHover={{ x: 4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Hover glow effect */}
                        {!active && (
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-luxury-brightBlue/5 to-luxury-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                                color: active ? '#3b82f6' : '#94a3b8',
                                filter: active ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' : 'none'
                              }}
                            />
                          </motion.div>
                          <span
                            className="font-semibold transition-colors duration-300"
                            style={{
                              color: active ? '#3b82f6' : '#94a3b8'
                            }}
                          >
                            {item.name}
                          </span>
                        </div>
                        {item.submenu && (
                          <ChevronRight
                            className="w-4 h-4 transition-all duration-300 relative z-10"
                            style={{
                              color: active ? '#3b82f6' : '#94a3b8',
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
                                  background: subActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                                  color: subActive ? '#60a5fa' : '#64748b'
                                }}
                                whileHover={{ x: 4, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
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
            <div className="p-4 border-t" style={{ borderColor: 'rgba(59, 130, 246, 0.2)' }}>
              <motion.div
                className="flex items-center space-x-3 mb-4 p-3 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.div
                  className="w-12 h-12 rounded-xl flex items-center justify-center relative flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.2)'
                  }}
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-white font-bold text-lg drop-shadow-lg">
                    {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-luxury-white truncate">
                    {profile?.full_name || 'Usuario'}
                  </p>
                  <p className="text-xs text-luxury-brightBlue font-medium capitalize">
                    {profile?.role === 'system_admin' ? 'System Admin' : profile?.role}
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
            borderColor: 'rgba(59, 130, 246, 0.2)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
          }}
        >
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu
                className="w-5 h-5 transition-colors"
                style={{ color: '#3b82f6' }}
              />
            </motion.button>
            <h1 className="text-2xl font-display font-bold gradient-text">
              Piker
            </h1>
          </div>

          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xs font-medium text-gray-400">
              Hola, <span className="text-luxury-white font-semibold">{profile?.full_name || 'Usuario'}</span>
            </p>
            <motion.div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.2)'
              }}
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-white font-bold drop-shadow-lg">
                {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </motion.div>
          </motion.div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8 pb-16">
          {children}
        </main>

        {/* Footer - Estilo Tiki */}
        <footer
          className="border-t py-2 px-8 fixed bottom-0 left-0 right-0 z-30"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            borderTop: '2px solid rgba(251, 191, 36, 0.3)',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="flex items-center justify-between">
            {/* License Status */}
            <div className="flex items-center space-x-2">
              {license ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-xs text-gray-300">
                    Licencia activa hasta{' '}
                    <span className="text-green-400 font-semibold">
                      {new Date(license.valid_until).toLocaleDateString('es-ES')}
                    </span>
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs text-red-400 font-semibold">
                    Sin licencia activa
                  </span>
                </>
              )}
            </div>

            {/* Branding - Estilo Tiki */}
            <div className="flex items-center space-x-3">
              <span className="text-lg font-bold text-yellow-400" style={{ fontFamily: 'monospace' }}>&lt;/&gt;</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-yellow-400">ElectroShop</span>
                <span className="text-xs text-gray-400">/</span>
                <span className="text-xs font-semibold text-orange-400">TecnoAcceso</span>
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
    </div>
  )
}
