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
      color: 'from-blue-500 to-blue-600',
      change: '+12%'
    },
    {
      title: 'Enviados Hoy',
      value: stats.sentToday,
      icon: Send,
      color: 'from-luxury-gold to-luxury-darkGold',
      change: '+5%'
    },
    {
      title: 'Esta Semana',
      value: stats.sentThisWeek,
      icon: Clock,
      color: 'from-green-500 to-green-600',
      change: '+8%'
    },
    {
      title: 'Este Mes',
      value: stats.sentThisMonth,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      change: '+15%'
    }
  ]

  const messageTypeLabels = {
    received: 'Recibidos',
    reminder: 'Recordatorios',
    return: 'Devoluciones'
  }

  const messageTypeColors = {
    received: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    reminder: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    return: 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-luxury-white mb-2">
            Bienvenido, {profile?.full_name || 'Usuario'}
          </h1>
          <p className="text-gray-400">
            Aquí está el resumen de tu actividad
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-luxury relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center space-x-1 text-green-400 text-sm">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{stat.change}</span>
                </div>
              </div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold text-luxury-white">
                {loading ? '...' : stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Messages by Type */}
        {stats.byType && Object.keys(stats.byType).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-luxury"
          >
            <h2 className="text-xl font-display font-semibold text-luxury-white mb-4">
              Mensajes por Tipo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(stats.byType).map(([type, count]) => (
                <div
                  key={type}
                  className="bg-luxury-gray rounded-lg p-4 border border-luxury-lightGray"
                >
                  <p className="text-gray-400 text-sm mb-2">
                    {messageTypeLabels[type] || type}
                  </p>
                  <p className="text-2xl font-bold text-luxury-white">
                    {count}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-luxury"
        >
          <h2 className="text-xl font-display font-semibold text-luxury-white mb-4">
            Mensajes Recientes
          </h2>
          <div className="space-y-3">
            {recentMessages.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No hay mensajes enviados todavía
              </p>
            ) : (
              recentMessages.map((message) => (
                <div
                  key={message.id}
                  className="bg-luxury-gray rounded-lg p-4 flex items-center justify-between border border-luxury-lightGray hover:border-luxury-gold/30 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${messageTypeColors[message.message_type]}`}>
                        {messageTypeLabels[message.message_type]}
                      </span>
                      <span className="text-luxury-white font-medium">
                        {message.phone_number}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-1">
                      {message.message_content}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs text-gray-500">
                      {new Date(message.sent_at).toLocaleDateString('es-ES')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(message.sent_at).toLocaleTimeString('es-ES')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}
