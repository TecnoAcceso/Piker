import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users as UsersIcon, Edit2, Trash2, Save, X, Search, Shield } from 'lucide-react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const roles = [
  { value: 'user', label: 'Usuario', description: 'Acceso básico' },
  { value: 'admin', label: 'Administrador', description: 'Gestión de usuarios' },
  { value: 'system_admin', label: 'Admin Sistema', description: 'Acceso completo' }
]

export default function Users() {
  const { profile: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'user'
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [users, searchTerm])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...users]

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredUsers(filtered)
  }

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          role: formData.role
        })
        .eq('id', editingUser.id)

      if (error) throw error

      fetchUsers()
      handleCloseModal()
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error al actualizar el usuario')
    }
  }

  const handleDelete = async (id) => {
    if (id === currentUser.id) {
      alert('No puedes eliminar tu propia cuenta')
      return
    }

    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      // Note: This requires admin privileges in Supabase
      // You might need to create a server function to delete auth users
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error al eliminar el usuario. Contacta al administrador del sistema.')
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      full_name: user.full_name || '',
      email: user.email || '',
      role: user.role
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setFormData({
      full_name: '',
      email: '',
      role: 'user'
    })
  }

  const getRoleColor = (role) => {
    const colors = {
      user: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      system_admin: 'bg-luxury-gold/20 text-luxury-gold border-luxury-gold/30'
    }
    return colors[role] || colors.user
  }

  const getRoleLabel = (role) => {
    return roles.find(r => r.value === role)?.label || role
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-luxury-white mb-2 flex items-center space-x-3">
              <UsersIcon className="w-8 h-8 text-luxury-gold" />
              <span>Gestión de Usuarios</span>
            </h1>
            <p className="text-gray-400">
              Administra los usuarios y sus permisos
            </p>
          </div>
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-luxury"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-luxury pl-12"
              placeholder="Buscar por nombre o email..."
            />
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-luxury overflow-x-auto"
        >
          {loading ? (
            <div className="text-center py-12 text-gray-400">
              Cargando usuarios...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                {users.length === 0
                  ? 'No hay usuarios registrados'
                  : 'No se encontraron usuarios'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-luxury-gray">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Usuario
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Rol
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Fecha de Registro
                  </th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-luxury-gray hover:bg-luxury-gray/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-luxury-gold rounded-full flex items-center justify-center">
                          <span className="text-luxury-black font-semibold text-sm">
                            {user.full_name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-luxury-white font-medium">
                            {user.full_name || 'Sin nombre'}
                          </p>
                          {user.id === currentUser.id && (
                            <span className="text-xs text-luxury-gold">(Tú)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-400">
                      {user.email}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-400 text-sm">
                      {new Date(user.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-luxury-gold hover:bg-luxury-gold/10 rounded-lg transition-colors"
                          title="Editar usuario"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {user.id !== currentUser.id && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showModal && editingUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black/70 z-50"
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-luxury-darkGray rounded-xl border border-luxury-gray max-w-md w-full p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-bold text-luxury-white">
                    Editar Usuario
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-luxury-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="input-luxury"
                    />
                  </div>

                  {/* Email (readonly) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      className="input-luxury opacity-50 cursor-not-allowed"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      El email no puede ser modificado
                    </p>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Rol
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="input-luxury"
                      disabled={editingUser.id === currentUser.id}
                    >
                      {roles.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label} - {role.description}
                        </option>
                      ))}
                    </select>
                    {editingUser.id === currentUser.id && (
                      <p className="text-xs text-gray-500 mt-1">
                        No puedes cambiar tu propio rol
                      </p>
                    )}
                  </div>

                  {/* System Admin Warning */}
                  {formData.role === 'system_admin' && editingUser.role !== 'system_admin' && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start space-x-2">
                      <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-yellow-400 text-sm font-medium">
                          Advertencia
                        </p>
                        <p className="text-yellow-400/80 text-xs mt-1">
                          Estás otorgando permisos de administrador del sistema. Este rol tiene acceso completo.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button onClick={handleCloseModal} className="btn-ghost">
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-5 h-5" />
                    <span>Guardar Cambios</span>
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
