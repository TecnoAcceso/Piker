import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Package, Bell, RotateCcw } from 'lucide-react'
import Layout from '../components/Layout'

export default function SelectMessageType() {
  const navigate = useNavigate()

  const messageTypes = [
    {
      type: 'received',
      title: 'Paquetes Recibidos',
      description: 'Notificar al destinatario sobre paquetes recibidos',
      icon: Package,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      type: 'reminder',
      title: 'Recordatorios',
      description: 'Enviar recordatorios sobre paquetes recibidos',
      icon: Bell,
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      type: 'return',
      title: 'Devoluciones',
      description: 'Notificar devoluciones al remitente',
      icon: RotateCcw,
      color: 'red',
      gradient: 'from-red-500 to-pink-500'
    }
  ]

  const getColorStyles = (type) => {
    const styles = {
      received: { main: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)' },
      reminder: { main: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)' },
      return: { main: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)' }
    }
    return styles[type]
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-luxury-white mb-0.5 tracking-tight">
            Enviar Mensajes
          </h1>
          <p className="text-xs text-gray-400">
            Selecciona el tipo de mensaje
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {messageTypes.map((item, index) => {
            const Icon = item.icon
            const colors = getColorStyles(item.type)

            return (
              <motion.div
                key={item.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/send/${item.type}`)}
                className="relative group cursor-pointer"
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className="relative p-5 rounded-xl border transition-all duration-300"
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    borderColor: 'rgba(71, 85, 105, 0.5)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"
                    style={{ background: colors.main + '40' }}
                  />

                  <div className="flex items-start space-x-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{
                        background: colors.bg,
                        border: `1px solid ${colors.border}`
                      }}
                    >
                      <Icon className="w-6 h-6" style={{ color: colors.main }} />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-luxury-white mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-400 mb-3">
                        {item.description}
                      </p>
                      <div
                        className="text-xs font-medium flex items-center space-x-1 group-hover:translate-x-1 transition-transform"
                        style={{ color: colors.main }}
                      >
                        <span>Seleccionar</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
