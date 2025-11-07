import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Save, X, FileText } from 'lucide-react'
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
            <h1 className="text-xl font-display font-bold text-luxury-white mb-1">
              Plantillas
            </h1>
            <p className="text-sm text-gray-400">
              Gestiona tus plantillas de mensajes
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center space-x-1 px-3 py-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva</span>
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
                className="card-luxury p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(template.template_type)} mb-1.5`}>
                      {templateTypes.find(t => t.value === template.template_type)?.label}
                    </span>
                    <h3 className="text-base font-semibold text-luxury-white">
                      {template.template_name}
                    </h3>
                  </div>
                </div>
                <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                  {template.template_content}
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(template)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 bg-luxury-gold/10 text-luxury-gold rounded-lg hover:bg-luxury-gold/20 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span className="text-xs">Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="text-xs">Eliminar</span>
                  </button>
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
                  <h2 className="text-lg font-display font-bold text-luxury-white">
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
