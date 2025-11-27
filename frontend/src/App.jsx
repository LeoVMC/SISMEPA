import React from 'react'
import Dashboard from './components/Dashboard'
import Login from './components/Login'

export default function App() {
  return (
    <div>
      <div className="max-w-5xl mx-auto">
        <Login />
        <Dashboard />
      </div>
    </div>
  )
}
