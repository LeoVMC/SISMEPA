import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const doLogin = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

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
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Iniciar Sesión</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={doLogin} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            Usuario
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Ingresa tu usuario"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
