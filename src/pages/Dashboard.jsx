import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Send, Clock, TrendingUp, ArrowUpRight } from 'lucide-react'
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
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      iconBg: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
      change: '+12%'
    },
    {
      title: 'Enviados Hoy',
      value: stats.sentToday,
      icon: Send,
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      iconBg: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
      change: '+5%'
    },
    {
      title: 'Esta Semana',
      value: stats.sentThisWeek,
      icon: Clock,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      iconBg: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
      change: '+8%'
    },
    {
      title: 'Este Mes',
      value: stats.sentThisMonth,
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      iconBg: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
      change: '+15%'
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
      <div className="space-y-8">
        {/* Header with Premium Styling */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-display font-bold text-luxury-white mb-2">
            Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            Resumen de actividad de mensajería
          </p>
        </motion.div>

        {/* Stats Grid with Premium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: index * 0.1,
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
              whileHover={{
                y: -8,
                transition: { duration: 0.3 }
              }}
              className="relative group"
            >
              {/* Glow effect on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                style={{ background: stat.gradient }}
              />

              {/* Card content */}
              <div
                className="relative rounded-2xl p-6 border transition-all duration-500"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.6) 100%)',
                  backdropFilter: 'blur(20px)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    className="w-14 h-14 rounded-xl flex items-center justify-center relative"
                    style={{
                      background: stat.iconBg,
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.2)'
                    }}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <stat.icon className="w-7 h-7 text-white drop-shadow-lg" />
                  </motion.div>
                  <motion.div
                    className="flex items-center space-x-1 text-emerald-400 text-sm font-semibold px-3 py-1 rounded-full"
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>{stat.change}</span>
                  </motion.div>
                </div>
                <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">
                  {stat.title}
                </h3>
                <motion.p
                  className="text-4xl font-bold text-luxury-white"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  {loading ? (
                    <span className="inline-block w-20 h-10 bg-luxury-slateBlue/30 rounded animate-pulse" />
                  ) : (
                    stat.value
                  )}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Messages by Type */}
        {stats.byType && Object.keys(stats.byType).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 150 }}
            className="relative"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-luxury-brightBlue/10 via-transparent to-luxury-cyan/10 rounded-3xl blur-2xl" />

            <div
              className="relative rounded-3xl p-8 border"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.5) 100%)',
                backdropFilter: 'blur(20px)',
                borderColor: 'rgba(59, 130, 246, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
              }}
            >
              <h2 className="text-2xl font-display font-bold text-luxury-white mb-6 flex items-center">
                <span className="gradient-text">Mensajes por Tipo</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(stats.byType).map(([type, count], index) => {
                  const colors = messageTypeColors[type]
                  return (
                    <motion.div
                      key={type}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -4 }}
                      className="rounded-xl p-5 border transition-all duration-300"
                      style={{
                        background: colors.bg,
                        borderColor: colors.border,
                        boxShadow: `0 4px 16px ${colors.bg}`
                      }}
                    >
                      <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: colors.text }}>
                        {messageTypeLabels[type] || type}
                      </p>
                      <p className="text-3xl font-bold" style={{ color: colors.text }}>
                        {count}
                      </p>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Recent Messages */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 150 }}
          className="relative"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-luxury-cyan/10 via-transparent to-luxury-brightBlue/10 rounded-3xl blur-2xl" />

          <div
            className="relative rounded-3xl p-8 border"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.5) 100%)',
              backdropFilter: 'blur(20px)',
              borderColor: 'rgba(59, 130, 246, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
            }}
          >
            <h2 className="text-2xl font-display font-bold text-luxury-white mb-6">
              <span className="gradient-text">Mensajes Recientes</span>
            </h2>
            <div className="space-y-3">
              {recentMessages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
                      border: '2px solid rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    <Package className="w-10 h-10 text-luxury-brightBlue" />
                  </div>
                  <p className="text-gray-400 text-lg">
                    No hay mensajes enviados todavía
                  </p>
                </motion.div>
              ) : (
                recentMessages.map((message, index) => {
                  const colors = messageTypeColors[message.message_type]
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 8 }}
                      className="rounded-xl p-5 flex items-center justify-between border transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(51, 65, 85, 0.4) 100%)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-semibold border"
                            style={{
                              background: colors.bg,
                              borderColor: colors.border,
                              color: colors.text
                            }}
                          >
                            {messageTypeLabels[message.message_type]}
                          </span>
                          <span className="text-luxury-white font-semibold">
                            {message.phone_number}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                          {message.message_content}
                        </p>
                      </div>
                      <div className="text-right ml-6 flex flex-col items-end space-y-1">
                        <div
                          className="px-3 py-1 rounded-lg text-xs font-medium"
                          style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#93c5fd'
                          }}
                        >
                          {new Date(message.sent_at).toLocaleDateString('es-ES')}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(message.sent_at).toLocaleTimeString('es-ES')}
                        </span>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}
