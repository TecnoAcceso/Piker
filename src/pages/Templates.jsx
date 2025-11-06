import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Save, X, FileText } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

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
      }

      fetchTemplates()
      handleCloseModal()
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Error al guardar la plantilla')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta plantilla?')) return

    try {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchTemplates()
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Error al eliminar la plantilla')
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-luxury-white mb-2">
              Plantillas de Mensajes
            </h1>
            <p className="text-gray-400">
              Gestiona tus plantillas para los diferentes tipos de mensajes
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Plantilla</span>
          </motion.button>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Cargando plantillas...</p>
          </div>
        ) : templates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-luxury text-center py-12"
          >
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No hay plantillas
            </h3>
            <p className="text-gray-500 mb-6">
              Crea tu primera plantilla para comenzar
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              Crear Plantilla
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-luxury"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(template.template_type)} mb-2`}>
                      {templateTypes.find(t => t.value === template.template_type)?.label}
                    </span>
                    <h3 className="text-lg font-semibold text-luxury-white">
                      {template.template_name}
                    </h3>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {template.template_content}
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(template)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-luxury-gold/10 text-luxury-gold rounded-lg hover:bg-luxury-gold/20 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="text-sm">Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Eliminar</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
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
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-luxury-darkGray rounded-xl border border-luxury-gray max-w-2xl w-full p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-bold text-luxury-white">
                    {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-luxury-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo de Mensaje
                    </label>
                    <select
                      value={formData.template_type}
                      onChange={(e) => setFormData({ ...formData, template_type: e.target.value })}
                      className="input-luxury"
                    >
                      {templateTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre de la Plantilla
                    </label>
                    <input
                      type="text"
                      value={formData.template_name}
                      onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                      className="input-luxury"
                      placeholder="Ej: Notificación Estándar"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Contenido del Mensaje
                    </label>
                    <textarea
                      value={formData.template_content}
                      onChange={(e) => setFormData({ ...formData, template_content: e.target.value })}
                      className="input-luxury min-h-32"
                      placeholder="Escribe el contenido del mensaje aquí..."
                      rows={6}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Puedes usar variables como &#123;nombre&#125;, &#123;numero_seguimiento&#125;, etc.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    onClick={handleCloseModal}
                    className="btn-ghost"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!formData.template_name || !formData.template_content}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-5 h-5" />
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
