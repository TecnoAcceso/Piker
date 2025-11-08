import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react'

export default function CustomAlert({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info',
  showConfirm = false,
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
}) {
  const icons = {
    success: CheckCircle,
    error: AlertTriangle,
    warning: AlertTriangle,
    info: Info
  }

  const colors = {
    success: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      icon: 'text-green-400'
    },
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      icon: 'text-red-400'
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      icon: 'text-yellow-400'
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      icon: 'text-blue-400'
    }
  }

  const Icon = icons[type]
  const colorScheme = colors[type]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`bg-luxury-darkGray rounded-xl border ${colorScheme.border} max-w-md w-full p-5`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${colorScheme.bg}`}>
                  <Icon className={`w-5 h-5 ${colorScheme.icon}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-luxury-white mb-1">
                    {title}
                  </h3>
                  <div className="text-sm text-gray-400">
                    {typeof message === 'string' ? <p>{message}</p> : message}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-luxury-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className={`mt-4 flex ${showConfirm ? 'justify-end space-x-2' : 'justify-end'}`}>
                {showConfirm ? (
                  <>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-luxury-gray text-gray-300 rounded-lg hover:bg-luxury-lightGray transition-colors text-sm font-medium"
                    >
                      {cancelText}
                    </button>
                    <button
                      onClick={() => {
                        onConfirm?.()
                        onClose()
                      }}
                      className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                        type === 'warning' || type === 'error'
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-luxury-gold/10 text-luxury-gold hover:bg-luxury-gold/20'
                      }`}
                    >
                      {confirmText}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-luxury-gold/10 text-luxury-gold rounded-lg hover:bg-luxury-gold/20 transition-colors text-sm font-medium"
                  >
                    Entendido
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
