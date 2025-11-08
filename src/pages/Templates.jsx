import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Save, X, FileText } from 'lucide-react'
import { AiOutlineFileAdd } from "react-icons/ai"
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import CustomAlert from '../components/CustomAlert'

const templateTypes = [
  { value: 'received', label: 'Paquetes Recibidos', color: 'blue' },
  { value: 'reminder', label: 'Recordatorios', color: 'yellow' },
  { value: 'return', label: 'Devoluciones', color: 'red' }
]

export default function Templates() {
  const { profile } = useAuth()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    template_type: 'received',
    template_name: '',
    template_content: ''
  })
  const [alert, setAlert] = useState({ isOpen: false, title: '', message: '', type: 'info' })
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, templateId: null })

  const showAlert = (title, message, type = 'info') => {
    setAlert({ isOpen: true, title, message, type })
  }

  const closeAlert = () => {
    setAlert({ isOpen: false, title: '', message: '', type: 'info' })
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (editingTemplate) {
        // Update existing template
        const { error } = await supabase
          .from('message_templates')
          .update({
            template_name: formData.template_name,
            template_content: formData.template_content,
            template_type: formData.template_type
          })
          .eq('id', editingTemplate.id)

        if (error) throw error
        showAlert('Plantilla actualizada', 'La plantilla se actualizó exitosamente', 'success')
      } else {
        // Create new template
        const { error } = await supabase
          .from('message_templates')
          .insert([{
            user_id: profile.id,
            template_type: formData.template_type,
            template_name: formData.template_name,
            template_content: formData.template_content
          }])

        if (error) throw error
        showAlert('Plantilla creada', 'La plantilla se creó exitosamente', 'success')
      }

      fetchTemplates()
      handleCloseModal()
    } catch (error) {
      console.error('Error saving template:', error)
      showAlert('Error', 'Error al guardar la plantilla', 'error')
    }
  }

  const handleDelete = async (id) => {
    setConfirmDelete({ isOpen: true, templateId: id })
  }

  const confirmDeleteTemplate = async () => {
    try {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', confirmDelete.templateId)

      if (error) throw error
      showAlert('Plantilla eliminada', 'La plantilla se eliminó exitosamente', 'success')
      fetchTemplates()
    } catch (error) {
      console.error('Error deleting template:', error)
      showAlert('Error', 'Error al eliminar la plantilla', 'error')
    } finally {
      setConfirmDelete({ isOpen: false, templateId: null })
    }
  }

  const handleEdit = (template) => {
    setEditingTemplate(template)
    setFormData({
      template_type: template.template_type,
      template_name: template.template_name,
      template_content: template.template_content
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTemplate(null)
    setFormData({
      template_type: 'received',
      template_name: '',
      template_content: ''
    })
  }

  const getTypeColor = (type) => {
    const colors = {
      received: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      reminder: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      return: 'bg-red-500/20 text-red-400 border-red-500/30'
    }
    return colors[type] || colors.received
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-luxury-white mb-0.5 tracking-tight">
              Plantillas
            </h1>
            <p className="text-xs text-gray-400">
              Gestiona tus plantillas de mensajes
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
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
              <AiOutlineFileAdd className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white tracking-wide uppercase" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                Nueva Plantilla
              </span>
            </div>
          </motion.button>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Cargando...</p>
          </div>
        ) : templates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-luxury text-center py-8 p-4"
          >
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-400 mb-1">
              No hay plantillas
            </h3>
            <p className="text-gray-500 mb-4 text-sm">
              Crea tu primera plantilla
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary text-sm py-2"
            >
              Crear Plantilla
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card-luxury p-3 hover:shadow-glow-raspberry transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(51, 65, 85, 0.5) 100%)',
                  borderColor: 'rgba(228, 0, 59, 0.3)'
                }}
              >
                {/* Fila 1: Tipo de plantilla | Nombre */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${getTypeColor(template.template_type)} whitespace-nowrap`}>
                    {templateTypes.find(t => t.value === template.template_type)?.label}
                  </span>
                  <h3 className="text-xs font-bold text-white truncate flex-1 text-right">
                    {template.template_name}
                  </h3>
                </div>

                {/* Contenido */}
                <p className="text-[10px] text-gray-400 mb-2 line-clamp-2 leading-relaxed">
                  {template.template_content}
                </p>

                {/* Botones de acción */}
                <div className="flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(template)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg transition-all duration-200"
                    style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#3b82f6'
                    }}
                  >
                    <Edit2 className="w-3 h-3" />
                    <span className="text-[10px] font-semibold">Editar</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(template.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-all duration-200"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span className="text-[10px] font-semibold">Eliminar</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Alert */}
      <CustomAlert
        isOpen={alert.isOpen}
        onClose={closeAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />

      {/* Delete Confirmation */}
      <AnimatePresence>
        {confirmDelete.isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDelete({ isOpen: false, templateId: null })}
              className="fixed inset-0 bg-black/70 z-[100]"
            />
            <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-luxury-darkGray rounded-xl border border-red-500/30 max-w-md w-full p-5"
              >
                <div className="flex items-start space-x-3 mb-4">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-luxury-white mb-1">
                      Eliminar plantilla
                    </h3>
                    <p className="text-sm text-gray-400">
                      ¿Estás seguro de eliminar esta plantilla? Esta acción no se puede deshacer.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => setConfirmDelete({ isOpen: false, templateId: null })}
                    className="px-4 py-2 bg-luxury-gray text-gray-300 rounded-lg hover:bg-luxury-lightGray transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDeleteTemplate}
                    className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

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
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-luxury-darkGray rounded-xl border border-luxury-gray max-w-lg w-full p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-heading font-bold text-luxury-white">
                    {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-luxury-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Tipo de Mensaje
                    </label>
                    <select
                      value={formData.template_type}
                      onChange={(e) => setFormData({ ...formData, template_type: e.target.value })}
                      className="w-full px-3 py-2 bg-luxury-gray border border-luxury-lightGray rounded-lg text-luxury-white focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 text-sm"
                    >
                      {templateTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={formData.template_name}
                      onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                      className="w-full px-3 py-2 bg-luxury-gray border border-luxury-lightGray rounded-lg text-luxury-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 text-sm"
                      placeholder="Ej: Notificación Estándar"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Contenido
                    </label>
                    <textarea
                      value={formData.template_content}
                      onChange={(e) => setFormData({ ...formData, template_content: e.target.value })}
                      className="w-full px-3 py-2 bg-luxury-gray border border-luxury-lightGray rounded-lg text-luxury-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 text-sm min-h-32"
                      placeholder="Escribe el contenido..."
                      rows={5}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Variables: &#123;nombre&#125;, &#123;numero_seguimiento&#125;
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 mt-4">
                  <button
                    onClick={handleCloseModal}
                    className="px-3 py-2 bg-luxury-gray text-gray-300 rounded-lg hover:bg-luxury-lightGray transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!formData.template_name || !formData.template_content}
                    className="btn-primary flex items-center space-x-1 px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingTemplate ? 'Actualizar' : 'Guardar'}</span>
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
