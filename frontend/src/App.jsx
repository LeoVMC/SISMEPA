import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import LoginPage from './pages/LoginPage'
import RegisterUserPage from './pages/RegisterUserPage'
import PensumPage from './pages/PensumPage'
import ListadoPage from './pages/ListadoPage'
import ActiveUsersPage from './pages/ActiveUsersPage'
import ProfilePage from './pages/ProfilePage'
import CalificacionesPage from './pages/CalificacionesPage'
import AdminLayout from './layouts/AdminLayout'
import { ThemeProvider } from './context/ThemeContext'

// Componente de Ruta Privada: Verifica si existe un token
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('apiToken')
  return token ? children : <Navigate to="/login" />
}

class SimpleErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
          <h1 style={{ color: 'red' }}>Algo salió mal (Frontend Crash)</h1>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button
            onClick={() => window.location.href = '/dashboard'}
            style={{ marginTop: '20px', padding: '10px 20px', background: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Intentar ir al Dashboard
          </button>
          <button
            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
            style={{ marginTop: '20px', marginLeft: '10px', padding: '10px 20px', background: 'gray', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Limpiar Sesión y Login
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <SimpleErrorBoundary>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Rutas de Administrador envueltas en el Layout */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <Dashboard />
                  </AdminLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/listado"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <ListadoPage />
                  </AdminLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/register"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <RegisterUserPage />
                  </AdminLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/pensum"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <PensumPage />
                  </AdminLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/active-users"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <ActiveUsersPage />
                  </AdminLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <ProfilePage />
                  </AdminLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/calificaciones"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <CalificacionesPage />
                  </AdminLayout>
                </PrivateRoute>
              }
            />

            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </SimpleErrorBoundary>
  )
}
