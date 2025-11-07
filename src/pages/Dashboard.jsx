import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Send, Clock, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'

export default function Dashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({
    totalSent: 0,
    sentToday: 0,
    sentThisWeek: 0,
    sentThisMonth: 0,
    byType: {}
  })
  const [loading, setLoading] = useState(true)
  const [recentMessages, setRecentMessages] = useState([])

  useEffect(() => {
    fetchStats()
    fetchRecentMessages()
  }, [])

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_stats', { p_user_id: profile.id })

      if (error) throw error

      if (data && data.length > 0) {
        setStats(data[0])
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('sent_log')
        .select('*')
        .eq('user_id', profile.id)
        .order('sent_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setRecentMessages(data || [])
    } catch (error) {
      console.error('Error fetching recent messages:', error)
    }
  }

  const statCards = [
    {
      title: 'Total Enviados',
      value: stats.totalSent,
      icon: Package,
      color: '#3b82f6'
    },
    {
      title: 'Hoy',
      value: stats.sentToday,
      icon: Send,
      color: '#06b6d4'
    },
    {
      title: 'Esta Semana',
      value: stats.sentThisWeek,
      icon: Clock,
      color: '#10b981'
    },
    {
      title: 'Este Mes',
      value: stats.sentThisMonth,
      icon: TrendingUp,
      color: '#8b5cf6'
    }
  ]

  const messageTypeLabels = {
    received: 'Recibidos',
    reminder: 'Recordatorios',
    return: 'Devoluciones'
  }

  const messageTypeColors = {
    received: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', text: '#60a5fa' },
    reminder: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', text: '#fbbf24' },
    return: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#f87171' }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-luxury-white mb-1">
            Inicio
          </h1>
          <p className="text-sm text-gray-400">
            Resumen de mensajería
          </p>
        </div>

        {/* Stats Grid - Compact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon

            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="relative group"
              >
                <div
                  className="relative p-4 rounded-xl border transition-all duration-300"
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    borderColor: 'rgba(71, 85, 105, 0.5)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"
                    style={{ background: stat.color + '40' }}
                  />

                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-400 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-luxury-white">
                        {loading ? '...' : (stat.value || 0).toLocaleString()}
                      </p>
                    </div>

                    <div
                      className="p-2 rounded-lg"
                      style={{
                        background: stat.color + '20',
                        color: stat.color
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Messages by Type - Compact */}
        {stats.byType && Object.keys(stats.byType).length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-5 rounded-xl border"
            style={{
              background: 'rgba(30, 41, 59, 0.5)',
              borderColor: 'rgba(71, 85, 105, 0.5)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <h2 className="text-base font-semibold text-luxury-white mb-4">
              Mensajes por Tipo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(stats.byType).map(([type, count], index) => {
                const colors = messageTypeColors[type]
                return (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ y: -2 }}
                    className="rounded-lg p-3 border transition-all duration-300"
                    style={{
                      background: colors.bg,
                      borderColor: colors.border
                    }}
                  >
                    <p className="text-xs font-medium mb-1" style={{ color: colors.text }}>
                      {messageTypeLabels[type] || type}
                    </p>
                    <p className="text-xl font-bold" style={{ color: colors.text }}>
                      {count}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Recent Messages - Compact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-5 rounded-xl border"
          style={{
            background: 'rgba(30, 41, 59, 0.5)',
            borderColor: 'rgba(71, 85, 105, 0.5)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <h2 className="text-base font-semibold text-luxury-white mb-4">
            Mensajes Recientes
          </h2>
          <div className="space-y-2">
            {recentMessages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <Package className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-gray-400 text-sm">
                  No hay mensajes enviados todavía
                </p>
              </div>
            ) : (
              recentMessages.map((message, index) => {
                const colors = messageTypeColors[message.message_type]
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    whileHover={{ x: 4 }}
                    className="rounded-lg p-3 flex items-center justify-between border transition-all duration-200"
                    style={{
                      background: 'rgba(30, 41, 59, 0.3)',
                      borderColor: 'rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            background: colors.bg,
                            color: colors.text
                          }}
                        >
                          {messageTypeLabels[message.message_type]}
                        </span>
                        <span className="text-luxury-white text-sm font-medium">
                          {message.phone_number}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs line-clamp-1">
                        {message.message_content}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-xs text-gray-500">
                        {new Date(message.sent_at).toLocaleDateString('es-ES')}
                      </div>
                      <span className="text-xs text-gray-600">
                        {new Date(message.sent_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}
