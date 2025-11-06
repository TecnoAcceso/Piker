import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxury-black">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-luxury-gold animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check role if required
  if (requiredRole && profile) {
    const roleHierarchy = {
      user: 1,
      admin: 2,
      system_admin: 3
    }

    const userLevel = roleHierarchy[profile.role] || 0
    const requiredLevel = roleHierarchy[requiredRole] || 0

    if (userLevel < requiredLevel) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return children
}
