import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import LoginPage from './pages/LoginPage'
import RegisterUserPage from './pages/RegisterUserPage'
import PensumPage from './pages/PensumPage'
import AdminLayout from './layouts/AdminLayout'
import { ThemeProvider } from './context/ThemeContext'

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

          {/* Admin Routes wrapped in Layout */}
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

          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}
