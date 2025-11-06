import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Auth Pages
import Login from './pages/Login'
import Register from './pages/Register'

// App Pages
import Dashboard from './pages/Dashboard'
import Templates from './pages/Templates'
import SendMessage from './pages/SendMessage'
import History from './pages/History'
import Licenses from './pages/Licenses'
import Users from './pages/Users'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/templates"
            element={
              <ProtectedRoute>
                <Templates />
              </ProtectedRoute>
            }
          />

          <Route
            path="/send/:type"
            element={
              <ProtectedRoute>
                <SendMessage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <Users />
              </ProtectedRoute>
            }
          />

          {/* System Admin Routes */}
          <Route
            path="/licenses"
            element={
              <ProtectedRoute requiredRole="system_admin">
                <Licenses />
              </ProtectedRoute>
            }
          />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
