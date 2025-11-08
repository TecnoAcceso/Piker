import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Send, Clock, TrendingUp, FileText, Users, CheckCircle, XCircle, X, List, Calendar, RotateCcw, Inbox, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'

export default function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalSent: 0,
    sentToday: 0,
    sentThisWeek: 0,
    sentThisMonth: 0,
    byType: {}
  })
  const [loading, setLoading] = useState(true)
  const [lastBatch, setLastBatch] = useState(null)
  const [showNumbersModal, setShowNumbersModal] = useState(false)

  useEffect(() => {
    if (profile?.id) {
      fetchStats()
      fetchLastBatch()
    }
  }, [profile?.id])

  const fetchStats = async () => {
    try {
      // Intentar usar la función RPC primero
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_user_stats', { p_user_id: profile.id })

      if (!rpcError && rpcData && rpcData.length > 0) {
        // La función RPC retorna una tabla con una fila
        const statsData = rpcData[0]
        setStats({
          totalSent: statsData.total_sent || 0,
          sentToday: statsData.sent_today || 0,
          sentThisWeek: statsData.sent_this_week || 0,
          sentThisMonth: statsData.sent_this_month || 0,
          byType: statsData.by_type || {}
        })
        setLoading(false)
        return
      }

      // Si la función RPC no existe o falla, calcular las estadísticas manualmente
      if (rpcError) {
        console.warn('Función RPC get_user_stats no disponible o error:', rpcError.message)
      }
      
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekStart = new Date(todayStart)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Lunes de esta semana
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      // Obtener todos los mensajes enviados del usuario
      const { data: allMessages, error: messagesError } = await supabase
        .from('sent_log')
        .select('sent_at, message_type, status')
        .eq('user_id', profile.id)
        .eq('status', 'sent')

      if (messagesError) {
        console.error('Error fetching messages:', messagesError)
        setLoading(false)
        return
      }

      // Calcular estadísticas
      const totalSent = allMessages?.length || 0
      
      const sentToday = allMessages?.filter(msg => {
        const msgDate = new Date(msg.sent_at)
        return msgDate >= todayStart
      }).length || 0

      const sentThisWeek = allMessages?.filter(msg => {
        const msgDate = new Date(msg.sent_at)
        return msgDate >= weekStart
      }).length || 0

      const sentThisMonth = allMessages?.filter(msg => {
        const msgDate = new Date(msg.sent_at)
        return msgDate >= monthStart
      }).length || 0

      // Agrupar por tipo
      const byType = {}
      allMessages?.forEach(msg => {
        if (msg.message_type) {
          byType[msg.message_type] = (byType[msg.message_type] || 0) + 1
        }
      })

      setStats({
        totalSent,
        sentToday,
        sentThisWeek,
        sentThisMonth,
        byType
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLastBatch = async () => {
    try {
      const { data, error } = await supabase
        .from('message_batches')
        .select('*')
        .eq('user_id', profile.id)
        .order('sent_at', { ascending: false })
        .limit(1)

      if (error) {
        // Si el error es que la tabla no existe o no hay permisos, simplemente retornar null
        if (error.code === 'PGRST116' || error.code === '42P01' || error.message?.includes('permission') || error.message?.includes('does not exist')) {
          console.warn('Tabla message_batches no disponible aún:', error.message)
          setLastBatch(null)
          return
        }
        throw error
      }

      // Si hay datos, tomar el primero; si no, null
      setLastBatch(data && data.length > 0 ? data[0] : null)
    } catch (error) {
      console.error('Error fetching last batch:', error)
      setLastBatch(null)
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

  // Formatear fecha y hora en formato venezolano
  const formatVenezuelanDate = (dateString) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const formatVenezuelanTime = (dateString) => {
    const date = new Date(dateString)
    let hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12 // La hora 0 debe ser 12
    return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`
  }

  // Quick Actions Data
  const quickActions = [
    {
      id: 'received',
      title: 'Paquetes Recibidos',
      description: 'Notificar entrega de paquetes',
      icon: Inbox,
      path: '/send/received',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      glowColor: 'rgba(59, 130, 246, 0.4)',
      particleColor: '#60a5fa',
      count: stats.byType?.received || 0
    },
    {
      id: 'reminder',
      title: 'Recordatorios',
      description: 'Enviar recordatorios de recogida',
      icon: Clock,
      path: '/send/reminder',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      glowColor: 'rgba(245, 158, 11, 0.4)',
      particleColor: '#fbbf24',
      count: stats.byType?.reminder || 0
    },
    {
      id: 'return',
      title: 'Devoluciones',
      description: 'Notificar devoluciones',
      icon: RotateCcw,
      path: '/send/return',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      glowColor: 'rgba(239, 68, 68, 0.4)',
      particleColor: '#f87171',
      count: stats.byType?.return || 0
    }
  ]

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-luxury-white mb-0.5 tracking-tight">
            Inicio
          </h1>
          <p className="text-xs text-gray-400">
            Resumen de mensajería
          </p>
        </div>

        {/* Quick Actions - Compact Premium Buttons */}
        <div className="flex items-center gap-2">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.path)}
                className="relative flex-1 px-2.5 py-2 rounded-lg overflow-hidden group"
                style={{
                  background: action.gradient,
                  boxShadow: `0 2px 12px ${action.glowColor}`,
                }}
              >
                {/* Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut"
                  }}
                />

                {/* Content */}
                <div className="relative z-10 flex items-center justify-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-white flex-shrink-0" strokeWidth={2.5} />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wide truncate">
                    {action.id === 'received' ? 'Recibidos' : action.id === 'reminder' ? 'Recordar' : 'Devolver'}
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Stats Grid - 2 Rows, 2 Columns (always) - Ultra Compact */}
        <div className="grid grid-cols-2 gap-2">
          {statCards.map((stat, index) => {
            const Icon = stat.icon

            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -1 }}
                className="relative group"
              >
                <div
                  className="relative p-2 rounded-lg border transition-all duration-300"
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    borderColor: 'rgba(71, 85, 105, 0.5)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"
                    style={{ background: stat.color + '40' }}
                  />

                  <div className="flex flex-col items-center justify-center text-center">
                    {/* Icono + Título en la misma fila - Centrados */}
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <div
                        className="p-1 rounded-md flex-shrink-0"
                        style={{
                          background: stat.color + '20',
                          color: stat.color
                        }}
                      >
                        <Icon className="w-3 h-3" />
                      </div>
                      <p className="text-[10px] font-medium text-gray-400">
                        {stat.title}
                      </p>
                    </div>
                    {/* Valor centrado */}
                    <p className="text-lg font-bold text-luxury-white">
                      {loading ? '...' : (stat.value || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Messages by Type - Ultra Compact - Always show all 3 types */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-2.5 rounded-lg border"
          style={{
            background: 'rgba(30, 41, 59, 0.5)',
            borderColor: 'rgba(71, 85, 105, 0.5)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <h2 className="text-sm font-heading font-semibold text-luxury-white mb-2">
            Mensajes por Tipo
          </h2>
          <div className="flex items-stretch gap-2">
            {['received', 'reminder', 'return'].map((type, index) => {
              const count = stats.byType?.[type] || 0
              const colors = messageTypeColors[type]
              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -1 }}
                  className="flex-1 rounded-md p-2 border transition-all duration-300 text-center"
                  style={{
                    background: colors.bg,
                    borderColor: colors.border
                  }}
                >
                  <p className="text-[10px] font-medium mb-0.5" style={{ color: colors.text }}>
                    {messageTypeLabels[type] || type}
                  </p>
                  <p className="text-lg font-bold" style={{ color: colors.text }}>
                    {count}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Última Lista Enviada - Premium Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="card-luxury p-6"
        >
          <h2 className="text-xl font-heading font-semibold text-luxury-white mb-4">
            Última Lista Enviada
          </h2>
          {!lastBatch ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '2px solid rgba(59, 130, 246, 0.3)'
                }}
              >
                <Package className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-gray-400 text-sm">
                No hay listas enviadas todavía
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              {/* Header Card */}
              <div
                className="rounded-xl p-3 border"
                style={{
                  background: messageTypeColors[lastBatch.message_type].bg,
                  borderColor: messageTypeColors[lastBatch.message_type].border
                }}
              >
                {/* Badges - Centered */}
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <span
                    className="px-3 py-1 rounded-lg text-sm font-semibold"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      color: messageTypeColors[lastBatch.message_type].text
                    }}
                  >
                    {messageTypeLabels[lastBatch.message_type]}
                  </span>
                  {lastBatch.template_name && (
                    <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-luxury-gray/50 border border-luxury-lightGray/30">
                      <FileText className="w-3.5 h-3.5 text-luxury-brightBlue" />
                      <span className="text-xs text-gray-300">{lastBatch.template_name}</span>
                    </div>
                  )}
                </div>

                {/* Stats Row - Centered */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Users className="w-4 h-4 text-gray-400 mb-1" />
                    <p className="text-xs text-gray-400 mb-0.5">Total</p>
                    <p className="text-lg font-bold text-luxury-white">
                      {Array.isArray(lastBatch.phone_numbers) ? lastBatch.phone_numbers.length : 0}
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mb-1" />
                    <p className="text-xs text-gray-400 mb-0.5">Enviados</p>
                    <p className="text-lg font-bold text-green-400">
                      {lastBatch.total_sent || 0}
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center">
                    <XCircle className="w-4 h-4 text-red-400 mb-1" />
                    <p className="text-xs text-gray-400 mb-0.5">Fallidos</p>
                    <p className="text-lg font-bold text-red-400">
                      {lastBatch.total_failed || 0}
                    </p>
                  </div>
                </div>

                {/* Date & Time - Centered */}
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatVenezuelanDate(lastBatch.sent_at)}</span>
                    <span className="text-gray-500">•</span>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatVenezuelanTime(lastBatch.sent_at)}</span>
                  </div>
                </div>
              </div>

              {/* Button to view numbers list */}
              {Array.isArray(lastBatch.phone_numbers) && lastBatch.phone_numbers.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowNumbersModal(true)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg border border-luxury-lightGray/30 bg-luxury-gray/30 hover:bg-luxury-gray/50 transition-all duration-200 text-sm font-medium text-luxury-white"
                  >
                    <List className="w-4 h-4" />
                    <span>Ver Lista de Números</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Modal de Lista de Números */}
        <AnimatePresence>
          {showNumbersModal && lastBatch && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowNumbersModal(false)}
                className="fixed inset-0 bg-black/70 z-[100]"
              />
              <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="bg-luxury-darkGray rounded-xl border border-luxury-lightGray max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
                >
                  {/* Header */}
                  <div className="p-5 border-b border-luxury-lightGray/30 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-heading font-semibold text-luxury-white">
                        Lista de Números Enviados
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        {lastBatch.phone_numbers.length} números • <Calendar className="w-3 h-3" />{formatVenezuelanDate(lastBatch.sent_at)} <Clock className="w-3 h-3" />{formatVenezuelanTime(lastBatch.sent_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowNumbersModal(false)}
                      className="text-gray-400 hover:text-luxury-white transition-colors p-1 rounded-lg hover:bg-luxury-gray/50"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-5">
                    <div className="space-y-2">
                      {Array.isArray(lastBatch.phone_numbers) && lastBatch.phone_numbers.map((phone, index) => {
                        // Determinar si el número fue enviado exitosamente o falló
                        // Como no tenemos información individual de cada número en el batch,
                        // asumimos que los primeros total_sent fueron exitosos y los siguientes fallaron
                        const isSuccess = index < lastBatch.total_sent
                        const isFailed = index >= lastBatch.total_sent && index < (lastBatch.total_sent + lastBatch.total_failed)
                        
                        return (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              isSuccess
                                ? 'bg-green-500/10 border-green-500/30'
                                : isFailed
                                ? 'bg-red-500/10 border-red-500/30'
                                : 'bg-luxury-gray/30 border-luxury-lightGray/30'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              {isSuccess ? (
                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                              ) : isFailed ? (
                                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                              ) : (
                                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              )}
                              <span className="text-sm font-mono text-luxury-white">{phone}</span>
                            </div>
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded ${
                                isSuccess
                                  ? 'bg-green-500/20 text-green-400'
                                  : isFailed
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}
                            >
                              {isSuccess ? 'Enviado' : isFailed ? 'Fallido' : 'Pendiente'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Footer Stats */}
                  <div className="p-5 border-t border-luxury-lightGray/30 bg-luxury-gray/20">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Total</p>
                        <p className="text-lg font-bold text-luxury-white">
                          {lastBatch.phone_numbers.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Enviados</p>
                        <p className="text-lg font-bold text-green-400">
                          {lastBatch.total_sent || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Fallidos</p>
                        <p className="text-lg font-bold text-red-400">
                          {lastBatch.total_failed || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  )
}
