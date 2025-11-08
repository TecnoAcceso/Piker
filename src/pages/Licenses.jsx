import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Key, Save, X, Shield } from 'lucide-react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'

const planTypes = [
  { value: 'basic', label: 'Básico', limit: 1000 },
  { value: 'pro', label: 'Pro', limit: 5000 },
  { value: 'enterprise', label: 'Enterprise', limit: 20000 }
]

export default function Licenses() {
  const [licenses, setLicenses] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingLicense, setEditingLicense] = useState(null)
  const [formData, setFormData] = useState({
    license_key: '',
    user_id: '',
    plan_type: 'basic',
    message_limit: 1000,
    valid_until: ''
  })

  useEffect(() => {
    fetchLicenses()
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [editingLicense]) // Re-fetch usuarios cuando cambia editingLicense

  const fetchLicenses = async () => {
    try {
      const { data, error } = await supabase
        .from('licenses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Cargar perfiles manualmente
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(l => l.user_id))]
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds)

        const licensesWithProfiles = data.map(license => ({
          ...license,
          profiles: profiles?.find(p => p.id === license.user_id) || null
        }))

        setLicenses(licensesWithProfiles)
      } else {
        setLicenses([])
      }
    } catch (error) {
      console.error('Error fetching licenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      // Obtener todos los usuarios
      const { data: allUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('full_name')

      if (usersError) throw usersError

      // Si estamos editando una licencia, mostrar todos los usuarios
      // Si estamos creando una nueva, filtrar usuarios que ya tienen licencia activa
      if (!editingLicense) {
        // Obtener usuarios con licencias activas y válidas
        const { data: activeLicenses, error: licensesError } = await supabase
          .from('licenses')
          .select('user_id')
          .eq('is_active', true)
          .gte('valid_until', new Date().toISOString())

        if (licensesError) {
          console.error('Error obteniendo licencias activas:', licensesError)
          // En caso de error, mostrar todos los usuarios
          setUsers(allUsers || [])
          return
        }

        // Filtrar usuarios que NO tienen licencia activa
        const usersWithLicenseIds = new Set(activeLicenses?.map(l => l.user_id) || [])
        const usersWithoutLicense = allUsers?.filter(user => !usersWithLicenseIds.has(user.id)) || []

        console.log('👥 Usuarios sin licencia activa:', usersWithoutLicense.length, 'de', allUsers?.length)
        setUsers(usersWithoutLicense)
      } else {
        // Al editar, mostrar todos los usuarios
        setUsers(allUsers || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    }
  }

  const generateLicenseKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const segments = 4
    const segmentLength = 4
    let key = ''

    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < segmentLength; j++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      if (i < segments - 1) key += '-'
    }

    return key
  }

  const handleSave = async () => {
    try {
      // Validar campos requeridos
      if (!formData.license_key) {
        alert('Por favor ingresa una clave de licencia')
        return
      }
      if (!formData.user_id) {
        alert('Por favor selecciona un usuario')
        return
      }
      if (!formData.valid_until) {
        alert('Por favor selecciona una fecha de validez')
        return
      }

      if (editingLicense) {
        // Update existing license
        const { error } = await supabase
          .from('licenses')
          .update({
            user_id: formData.user_id,
            plan_type: formData.plan_type,
            message_limit: formData.message_limit,
            valid_until: formData.valid_until,
            is_active: true // Siempre activa al crear/editar
          })
          .eq('id', editingLicense.id)

        if (error) {
          console.error('Error updating license:', error)
          if (error.code === '23503') {
            alert('Error: El usuario seleccionado no existe. Por favor ejecuta el script SQL para corregir la base de datos.')
          } else {
            throw error
          }
          return
        }
      } else {
        // Create new license
        const { error } = await supabase
          .from('licenses')
          .insert([{
            license_key: formData.license_key,
            user_id: formData.user_id,
            plan_type: formData.plan_type,
            message_limit: formData.message_limit,
            valid_until: formData.valid_until,
            is_active: true // Siempre activa al crear
          }])

        if (error) {
          console.error('Error creating license:', error)
          if (error.code === '23503') {
            alert('Error: El usuario seleccionado no existe. Por favor ejecuta el script SQL para corregir la base de datos.')
          } else if (error.code === '23505') {
            alert('Error: La clave de licencia ya existe')
          } else {
            throw error
          }
          return
        }
      }

      fetchLicenses()
      await fetchUsers() // Refrescar usuarios después de guardar
      handleCloseModal()
    } catch (error) {
      console.error('Error saving license:', error)
      alert('Error al guardar la licencia: ' + (error.message || 'Error desconocido'))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta licencia?')) return

    try {
      const { error } = await supabase
        .from('licenses')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchLicenses()
      await fetchUsers() // Refrescar usuarios después de eliminar
    } catch (error) {
      console.error('Error deleting license:', error)
      alert('Error al eliminar la licencia')
    }
  }

  const handleEdit = (license) => {
    setEditingLicense(license)
    setFormData({
      license_key: license.license_key,
      user_id: license.user_id || '',
      plan_type: license.plan_type,
      message_limit: license.message_limit,
      valid_until: license.valid_until ? license.valid_until.split('T')[0] : ''
    })
    setShowModal(true)
  }

  const handleCloseModal = async () => {
    setShowModal(false)
    setEditingLicense(null)
    setFormData({
      license_key: '',
      user_id: '',
      plan_type: 'basic',
      message_limit: 1000,
      valid_until: ''
    })
    // Refrescar usuarios cuando se cierra el modal
    await fetchUsers()
  }

  // Función para agregar meses a la fecha actual
  const addMonthsToDate = (months) => {
    const date = new Date()
    date.setMonth(date.getMonth() + months)
    return date.toISOString().split('T')[0]
  }

  const setQuickDate = (months) => {
    const date = addMonthsToDate(months)
    setFormData({ ...formData, valid_until: date })
  }

  const handleNewLicense = async () => {
    setEditingLicense(null) // Asegurar que no estamos editando
    setFormData({
      license_key: generateLicenseKey(),
      user_id: '',
      plan_type: 'basic',
      message_limit: 1000,
      valid_until: ''
    })
    // Refrescar usuarios para mostrar solo los que no tienen licencia
    await fetchUsers()
    setShowModal(true)
  }

  const getPlanColor = (plan) => {
    const colors = {
      basic: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      pro: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      enterprise: 'bg-luxury-gold/20 text-luxury-gold border-luxury-gold/30'
    }
    return colors[plan] || colors.basic
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-luxury-white mb-0.5 flex items-center space-x-3 tracking-tight">
              <Shield className="w-6 h-6 text-luxury-gold" />
              <span>Gestión de Licencias</span>
            </h1>
            <p className="text-xs text-gray-400 ml-11">
              Administra las licencias del sistema y API tokens
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNewLicense}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Licencia</span>
          </motion.button>
        </div>

        {/* Licenses Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-luxury overflow-x-auto"
        >
          {loading ? (
            <div className="text-center py-12 text-gray-400">
              Cargando licencias...
            </div>
          ) : licenses.length === 0 ? (
            <div className="text-center py-12">
              <Key className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No hay licencias
              </h3>
              <p className="text-gray-500 mb-6">
                Crea la primera licencia para comenzar
              </p>
              <button onClick={handleNewLicense} className="btn-primary">
                Crear Licencia
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-luxury-gray">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Clave de Licencia
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Usuario
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Plan
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Límite de Mensajes
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Usados
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Estado
                  </th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {licenses.map((license) => (
                  <tr
                    key={license.id}
                    className="border-b border-luxury-gray hover:bg-luxury-gray/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <code className="bg-luxury-gray px-2 py-1 rounded text-luxury-gold text-sm">
                        {license.license_key}
                      </code>
                    </td>
                    <td className="py-4 px-4 text-luxury-white">
                      {license.profiles ? (
                        <div>
                          <p className="font-medium">{license.profiles.full_name}</p>
                          <p className="text-xs text-gray-400">{license.profiles.email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-500">Sin asignar</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getPlanColor(license.plan_type)}`}>
                        {planTypes.find(p => p.value === license.plan_type)?.label}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-luxury-white">
                      {license.message_limit.toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-luxury-white">
                          {license.messages_used.toLocaleString()}
                        </span>
                        <div className="w-24 bg-luxury-gray rounded-full h-2">
                          <div
                            className="bg-luxury-gold h-2 rounded-full"
                            style={{
                              width: `${Math.min((license.messages_used / license.message_limit) * 100, 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        license.is_active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {license.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(license)}
                          className="p-2 text-luxury-gold hover:bg-luxury-gold/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(license.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black/70 z-50"
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-luxury-darkGray rounded-xl border border-luxury-gray max-w-2xl w-full p-6 my-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-heading font-bold text-luxury-white">
                    {editingLicense ? 'Editar Licencia' : 'Nueva Licencia'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-luxury-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* License Key */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Clave de Licencia
                    </label>
                    <input
                      type="text"
                      value={formData.license_key}
                      onChange={(e) => setFormData({ ...formData, license_key: e.target.value })}
                      className="input-luxury font-mono"
                      readOnly={!!editingLicense}
                    />
                  </div>

                  {/* User */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Asignar a Usuario <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.user_id}
                      onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                      className="input-luxury"
                      required
                    >
                      <option value="">Selecciona un usuario</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.full_name} - {user.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Plan Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo de Plan
                    </label>
                    <select
                      value={formData.plan_type}
                      onChange={(e) => {
                        const plan = planTypes.find(p => p.value === e.target.value)
                        setFormData({
                          ...formData,
                          plan_type: e.target.value,
                          message_limit: plan.limit
                        })
                      }}
                      className="input-luxury"
                    >
                      {planTypes.map(plan => (
                        <option key={plan.value} value={plan.value}>
                          {plan.label} - {plan.limit.toLocaleString()} mensajes
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message Limit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Límite de Mensajes
                    </label>
                    <input
                      type="number"
                      value={formData.message_limit}
                      onChange={(e) => setFormData({ ...formData, message_limit: parseInt(e.target.value) })}
                      className="input-luxury"
                    />
                  </div>

                  {/* Valid Until */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Válida Hasta <span className="text-red-400">*</span>
                    </label>
                    <div className="space-y-2">
                      {/* Botones rápidos */}
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setQuickDate(1)}
                          className="px-3 py-1.5 text-xs font-medium bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30 rounded-lg hover:bg-luxury-gold/20 transition-colors"
                        >
                          1 Mes
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickDate(3)}
                          className="px-3 py-1.5 text-xs font-medium bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30 rounded-lg hover:bg-luxury-gold/20 transition-colors"
                        >
                          3 Meses
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickDate(12)}
                          className="px-3 py-1.5 text-xs font-medium bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30 rounded-lg hover:bg-luxury-gold/20 transition-colors"
                        >
                          1 Año
                        </button>
                      </div>
                      <input
                        type="date"
                        value={formData.valid_until}
                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                        className="input-luxury"
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button onClick={handleCloseModal} className="btn-ghost">
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!formData.license_key || !formData.user_id || !formData.valid_until}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5" />
                    <span>{editingLicense ? 'Actualizar' : 'Crear'}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  )
}
