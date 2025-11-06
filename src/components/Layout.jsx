import { useState } from 'react'
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
  ChevronRight
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { profile, signOut, isAdmin, isSystemAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const navigation = [
    {
      name: 'Dashboard',
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
      show: isAdmin
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
            className="fixed lg:static inset-y-0 left-0 z-50 w-64 bg-luxury-darkGray border-r border-luxury-gray flex flex-col"
          >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-luxury-gray">
              <Link to="/dashboard" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-luxury-gold to-luxury-darkGold rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-luxury-black" />
                </div>
                <span className="text-xl font-display font-bold gradient-text">
                  Piker
                </span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-400 hover:text-luxury-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
              {navigation.map((item) => {
                if (!item.show) return null

                return (
                  <div key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30'
                          : 'text-gray-400 hover:bg-luxury-lightGray hover:text-luxury-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      {item.submenu && (
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            isActive(item.href) ? 'rotate-90' : ''
                          }`}
                        />
                      )}
                    </Link>

                    {/* Submenu */}
                    {item.submenu && isActive(item.href) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-4 mt-2 space-y-1"
                      >
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.name}
                            to={subitem.href}
                            className={`block px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                              location.pathname === subitem.href
                                ? 'text-luxury-gold bg-luxury-gold/5'
                                : 'text-gray-500 hover:text-luxury-white hover:bg-luxury-lightGray'
                            }`}
                          >
                            {subitem.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </div>
                )
              })}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-luxury-gray">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-luxury-gold rounded-full flex items-center justify-center">
                    <span className="text-luxury-black font-semibold text-sm">
                      {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-luxury-white truncate">
                      {profile?.full_name || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {profile?.role === 'system_admin' ? 'System Admin' : profile?.role}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-luxury-lightGray hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-lg transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-luxury-darkGray border-b border-luxury-gray flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-luxury-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-luxury-white">
                {profile?.full_name || 'Usuario'}
              </p>
              <p className="text-xs text-gray-400">
                {profile?.email}
              </p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
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
