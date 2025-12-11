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

                    // Fetch user details to determine role
                    try {
                        const userRes = await fetch(`${import.meta.env.VITE_API_URL}/auth/user/`, {
                            headers: { 'Authorization': `Token ${token}` }
                        })
                        if (userRes.ok) {
                            const userData = await userRes.json()
                            localStorage.setItem('userData', JSON.stringify(userData))

                            // Role-based redirection logic
                            if (userData.username === 'admin' || userData.is_staff) {
                                navigate('/dashboard')
                            } else {
                                // Placeholder for student/teacher dashboard
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
                // Handle specific error messages
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
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-200 relative">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md transition-colors duration-200">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Iniciar Sesión</h2>

                {error && (
                    <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={doLogin} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="cedula">
                            Cédula
                        </label>
                        <div className="flex gap-2">
                            <select
                                value={cedulaPrefix}
                                onChange={(e) => setCedulaPrefix(e.target.value)}
                                className="shadow border rounded py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline transition-colors w-24"
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
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline transition-colors"
                                placeholder="Número de Cédula"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline transition-colors"
                            placeholder="Ingresa tu contraseña"
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Cargando...' : 'Entrar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
