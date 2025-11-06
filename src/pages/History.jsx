import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Calendar, Download, Phone, FileText } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

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

export default function History() {
  const { profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [filteredMessages, setFilteredMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [dateRange, setDateRange] = useState('all')

  useEffect(() => {
    fetchMessages()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [messages, searchTerm, filterType, dateRange])

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('sent_log')
        .select('*')
        .eq('user_id', profile.id)
        .order('sent_at', { ascending: false })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...messages]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(msg =>
        msg.phone_number.includes(searchTerm) ||
        msg.message_content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(msg => msg.message_type === filterType)
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date()
      const filterDate = new Date()

      switch (dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
      }

      filtered = filtered.filter(msg => new Date(msg.sent_at) >= filterDate)
    }

    setFilteredMessages(filtered)
  }

  const exportToCSV = () => {
    const headers = ['Fecha', 'Hora', 'Teléfono', 'Tipo', 'Mensaje', 'Estado']
    const rows = filteredMessages.map(msg => [
      new Date(msg.sent_at).toLocaleDateString('es-ES'),
      new Date(msg.sent_at).toLocaleTimeString('es-ES'),
      msg.phone_number,
      messageTypeLabels[msg.message_type],
      msg.message_content,
      msg.status
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `historial-mensajes-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-luxury-white mb-2">
              Historial de Mensajes
            </h1>
            <p className="text-gray-400">
              Revisa todos los mensajes enviados
            </p>
          </div>
          <button
            onClick={exportToCSV}
            disabled={filteredMessages.length === 0}
            className="btn-primary flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Exportar CSV</span>
          </button>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-luxury"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-luxury pl-12"
                  placeholder="Teléfono o mensaje..."
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Mensaje
              </label>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="input-luxury pl-12"
                >
                  <option value="all">Todos</option>
                  <option value="received">Recibidos</option>
                  <option value="reminder">Recordatorios</option>
                  <option value="return">Devoluciones</option>
                </select>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rango de Fecha
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="input-luxury pl-12"
                >
                  <option value="all">Todo el tiempo</option>
                  <option value="today">Hoy</option>
                  <option value="week">Última semana</option>
                  <option value="month">Último mes</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Messages List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-luxury"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold text-luxury-white">
              Mensajes ({filteredMessages.length})
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">
              Cargando historial...
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                {messages.length === 0
                  ? 'No hay mensajes en el historial'
                  : 'No se encontraron mensajes con los filtros aplicados'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-luxury-gray rounded-lg p-4 border border-luxury-lightGray hover:border-luxury-gold/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-luxury-white font-medium">
                        {message.phone_number}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${messageTypeColors[message.message_type]}`}>
                        {messageTypeLabels[message.message_type]}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        {new Date(message.sent_at).toLocaleDateString('es-ES')}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(message.sent_at).toLocaleTimeString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {message.message_content}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  )
}
