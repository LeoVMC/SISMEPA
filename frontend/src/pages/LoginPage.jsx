import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

export default function LoginPage() {
    const [cedulaPrefix, setCedulaPrefix] = useState('V')
    const [cedulaNumber, setCedulaNumber] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleNumericInput = (e) => {
        const val = e.target.value
        if (/^\d*$/.test(val)) {
            setCedulaNumber(val)
        }
    }

    const doLogin = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const username = `${cedulaPrefix}-${cedulaNumber}`

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            })
            const json = await res.json()

            if (res.ok) {
                const token = json.key || json.token || json.access_token
                if (token) {
                    localStorage.setItem('apiToken', token)

                    // Obtener detalles del usuario para determinar el rol
                    try {
                        const userRes = await fetch(`${import.meta.env.VITE_API_URL}/auth/user/`, {
                            headers: { 'Authorization': `Token ${token}` }
                        })
                        if (userRes.ok) {
                            const userData = await userRes.json()
                            localStorage.setItem('userData', JSON.stringify(userData))

                            // Lógica de redirección basada en rol
                            if (userData.username === 'admin' || userData.is_staff) {
                                navigate('/dashboard')
                            } else {
                                // Redirigir a dashboard para estudiante/docente
                                navigate('/dashboard')
                            }
                        } else {
                            navigate('/dashboard')
                        }
                    } catch (e) {
                        navigate('/dashboard')
                    }
                } else {
                    setError('Error: No se recibió un token válido.')
                }
            } else {
                // Manejar mensajes de error específicos
                if (json.non_field_errors) {
                    setError(json.non_field_errors.join(' '))
                } else {
                    setError('Credenciales inválidas. Por favor intenta de nuevo.')
                }
            }
        } catch (err) {
            setError('Error de conexión. Verifica que el servidor esté corriendo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-500 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse-soft" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse-soft animation-delay-500" />
            </div>

            <div className="absolute top-4 right-4 z-10">
                <ThemeToggle />
            </div>

            <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl p-8 rounded-2xl shadow-soft-lg border border-white/50 dark:border-gray-700/50 w-full max-w-md transition-all duration-500 animate-fade-in-up relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                        SISMEPA
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Sistema de Monitoreo de Progreso Académico</p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-xl relative mb-6 animate-fade-in" role="alert">
                        <strong className="font-semibold">Error: </strong>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={doLogin} className="space-y-5">
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2" htmlFor="cedula">
                            Cédula
                        </label>
                        <div className="flex gap-2">
                            <select
                                value={cedulaPrefix}
                                onChange={(e) => setCedulaPrefix(e.target.value)}
                                className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all duration-200 w-20"
                            >
                                <option value="V">V</option>
                                <option value="E">E</option>
                                <option value="J">J</option>
                            </select>
                            <input
                                id="cedula"
                                type="text"
                                value={cedulaNumber}
                                onChange={handleNumericInput}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all duration-200"
                                placeholder="Número de Cédula"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2" htmlFor="password">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all duration-200"
                            placeholder="Ingresa tu contraseña"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Ingresando...
                            </span>
                        ) : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    )
}
