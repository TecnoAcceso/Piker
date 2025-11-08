import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users as UsersIcon, Edit2, Trash2, Save, X, Search, Shield, Plus } from 'lucide-react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import * as bcrypt from 'bcryptjs'
import CustomAlert from '../components/CustomAlert'

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
    username: '',
    full_name: '',
    email: '',
    password: '',
    role: 'user'
  })
  const [alert, setAlert] = useState({ isOpen: false, title: '', message: '', type: 'info' })

  const showAlert = (title, message, type = 'info') => {
    setAlert({ isOpen: true, title, message, type })
  }

  const closeAlert = () => {
    setAlert({ isOpen: false, title: '', message: '', type: 'info' })
  }

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
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredUsers(filtered)
  }

  const handleSave = async () => {
    try {
      if (editingUser) {
        // Actualizar usuario existente
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            role: formData.role
          })
          .eq('id', editingUser.id)

        if (error) throw error
        showAlert('Usuario actualizado', 'El usuario se actualizó exitosamente', 'success')
      } else {
        // Crear nuevo usuario
        if (!formData.username || !formData.password || !formData.email || !formData.full_name) {
          showAlert('Campos incompletos', 'Todos los campos son obligatorios', 'warning')
          return
        }

        // Validar formato de email antes de continuar
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
          showAlert('Email inválido', 'Por favor ingresa un email válido', 'error')
          return
        }

        // Validar longitud mínima de contraseña
        if (formData.password.length < 6) {
          showAlert('Contraseña muy corta', 'La contraseña debe tener al menos 6 caracteres', 'error')
          return
        }

        // Hash de la contraseña de forma asíncrona
        const password_hash = await bcrypt.hash(formData.password, 10)

        // Usar la función SQL optimizada create_user_with_profile
        const { data: userId, error } = await supabase.rpc('create_user_with_profile', {
          p_username: formData.username.trim(),
          p_email: formData.email.trim().toLowerCase(),
          p_password_hash: password_hash,
          p_full_name: formData.full_name.trim(),
          p_role: formData.role || 'user'
        })

        if (error) {
          console.error('Error creating user:', error)
          
          // Manejo de errores específicos y user-friendly
          const errorMessage = error.message || ''
          
          if (error.code === '23505' || errorMessage.includes('ya existe') || errorMessage.includes('ya está registrado')) {
            if (errorMessage.includes('username') || errorMessage.includes('nombre de usuario')) {
              showAlert('Usuario duplicado', 'El nombre de usuario ya está en uso', 'error')
            } else if (errorMessage.includes('email')) {
              showAlert('Email duplicado', 'Este email ya está registrado', 'error')
            } else {
              showAlert('Datos duplicados', 'El nombre de usuario o email ya existe', 'error')
            }
          } else if (error.code === '23503' || errorMessage.includes('foreign key')) {
            showAlert(
              'Error de configuración', 
              'Por favor ejecuta el script SQL en Supabase para configurar correctamente la base de datos. Ver archivo supabase_function.sql', 
              'error'
            )
          } else if (errorMessage.includes('requerido') || errorMessage.includes('requerida')) {
            showAlert('Datos incompletos', errorMessage, 'error')
          } else {
            showAlert('Error al crear usuario', errorMessage || 'Error desconocido. Por favor intenta nuevamente.', 'error')
          }
          return
        }
        
        if (userId) {
          showAlert('Usuario creado', `Usuario "${formData.username}" creado exitosamente`, 'success')
        } else {
          showAlert('Advertencia', 'El usuario puede haberse creado pero no se recibió confirmación', 'warning')
        }
      }

      fetchUsers()
      handleCloseModal()
    } catch (error) {
      console.error('Error saving user:', error)
      showAlert('Error', 'Error al guardar el usuario: ' + error.message, 'error')
    }
  }

  const handleDelete = async (id) => {
    if (id === currentUser.id) {
      showAlert('Acción no permitida', 'No puedes eliminar tu propia cuenta', 'warning')
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
      username: user.username || '',
      full_name: user.full_name || '',
      email: user.email || '',
      password: '',
      role: user.role
    })
    setShowModal(true)
  }

  const handleCreate = () => {
    setEditingUser(null)
    setFormData({
      username: '',
      full_name: '',
      email: '',
      password: '',
      role: 'user'
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setFormData({
      username: '',
      full_name: '',
      email: '',
      password: '',
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

  const getRoleTextColor = (role) => {
    const colors = {
      user: 'text-blue-400',
      admin: 'text-purple-400',
      system_admin: 'text-luxury-gold'
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
            <h1 className="text-2xl font-display font-bold text-luxury-white mb-0.5 tracking-tight">
              Gestión de Usuarios
            </h1>
            <p className="text-xs text-gray-400">
              Administra los usuarios y sus permisos
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreate}
            className="relative px-3.5 py-2 rounded-lg flex items-center gap-1.5 overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, #E4003B 0%, #C7003A 50%, #E4003B 100%)',
              backgroundSize: '200% 100%',
              boxShadow: '0 4px 20px rgba(228, 0, 59, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 1px 0 0 rgba(255, 255, 255, 0.2) inset',
            }}
          >
            {/* Efecto de brillo superior */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent opacity-50"></div>

            {/* Efecto shimmer animado */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{
                x: ['-100%', '200%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
              }}
            />

            {/* Resplandor hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-luxury-raspberryLight/0 via-luxury-raspberryLight/20 to-luxury-raspberryLight/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Contenido */}
            <div className="relative z-10 flex items-center gap-1.5">
              <div className="relative">
                <UsersIcon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                <Plus className="w-2.5 h-2.5 text-white absolute -top-1 -right-1" strokeWidth={3} />
              </div>
              <span className="text-xs font-bold text-white tracking-wide uppercase" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                Crear Usuario
              </span>
            </div>
          </motion.button>
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 z-10" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-luxury pl-11 text-sm h-10"
            placeholder="Buscar por nombre o email..."
          />
        </motion.div>

        {/* Users Grid - Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-12 text-gray-400">
              Cargando usuarios...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <UsersIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">
                {users.length === 0
                  ? 'No hay usuarios registrados'
                  : 'No se encontraron usuarios'}
              </p>
            </div>
          ) : (
            filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="relative group"
              >
                <div
                  className="relative p-2.5 rounded-xl border transition-all duration-300"
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    borderColor: 'rgba(71, 85, 105, 0.5)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {/* Fila 1: Nombre | Rol | Fecha */}
                  <div className="mb-1.5">
                    <p className="text-xs font-semibold text-luxury-white truncate">
                      {user.full_name || 'Sin nombre'}
                      {user.id === currentUser.id && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-yellow-500/20 text-yellow-400 ml-1">
                          Tú
                        </span>
                      )}
                      <span className="text-gray-500 mx-1">|</span>
                      <span className={`text-[10px] font-medium ${getRoleTextColor(user.role)}`}>
                        {getRoleLabel(user.role).toLowerCase()}
                      </span>
                      <span className="text-gray-500 mx-1">|</span>
                      <span className="text-[10px] text-gray-500">
                        {new Date(user.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </p>
                  </div>

                  {/* Fila 2: @username | email */}
                  <div className="mb-2">
                    <p className="text-[10px] text-gray-400 truncate">
                      @{user.username || 'sin usuario'} <span className="text-gray-600 mx-1">|</span> {user.email}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleEdit(user)}
                      className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 text-[10px] font-medium text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors border border-blue-500/30"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                    {user.id !== currentUser.id && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 text-[10px] font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/30"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Eliminar</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Edit/Create Modal */}
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
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-luxury-darkGray rounded-xl border border-luxury-gray max-w-md w-full p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-heading font-semibold text-luxury-white">
                    {editingUser ? 'Editar Usuario' : 'Crear Usuario'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-luxury-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Username - solo en creación */}
                  {!editingUser && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nombre de Usuario
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="input-luxury"
                        placeholder="usuario123"
                      />
                    </div>
                  )}

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
                      placeholder="Juan Pérez"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`input-luxury ${editingUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                      readOnly={!!editingUser}
                      placeholder="usuario@email.com"
                    />
                    {editingUser && (
                      <p className="text-xs text-gray-500 mt-1">
                        El email no puede ser modificado
                      </p>
                    )}
                  </div>

                  {/* Password - solo en creación */}
                  {!editingUser && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Contraseña
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="input-luxury"
                        placeholder="••••••••"
                      />
                    </div>
                  )}

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Rol
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="input-luxury"
                      disabled={editingUser && editingUser.id === currentUser.id}
                    >
                      {roles.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label} - {role.description}
                        </option>
                      ))}
                    </select>
                    {editingUser && editingUser.id === currentUser.id && (
                      <p className="text-xs text-gray-500 mt-1">
                        No puedes cambiar tu propio rol
                      </p>
                    )}
                  </div>

                  {/* System Admin Warning */}
                  {formData.role === 'system_admin' && (!editingUser || editingUser.role !== 'system_admin') && (
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

      {/* Custom Alert */}
      <CustomAlert
        isOpen={alert.isOpen}
        onClose={closeAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
    </Layout>
  )
}
