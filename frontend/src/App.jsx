import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import LoginPage from './pages/LoginPage'
import RegisterUserPage from './pages/RegisterUserPage'
import PensumPage from './pages/PensumPage'
import ListadoPage from './pages/ListadoPage'
import FakerPage from './pages/FakerPage'
import ProfilePage from './pages/ProfilePage'
import AdminLayout from './layouts/AdminLayout'
import { ThemeProvider } from './context/ThemeContext'

// Componente de Ruta Privada: Verifica si existe un token
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('apiToken')
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
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
            path="/faker-demo"
            element={
              <PrivateRoute>
                <AdminLayout>
                  <FakerPage />
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

          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}
