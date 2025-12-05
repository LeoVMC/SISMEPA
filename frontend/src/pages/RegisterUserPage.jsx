import React, { useState, useEffect } from 'react'

export default function RegisterUserPage() {
    const [token] = useState(localStorage.getItem('apiToken') || '')
    const [userResp, setUserResp] = useState(null)
    const [loading, setLoading] = useState(false)
    const [programas, setProgramas] = useState([])

    useEffect(() => {
        const fetchProgramas = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/programas/`, {
                    headers: { Authorization: token ? `Token ${token}` : undefined }
                })
                if (res.ok) {
                    const data = await res.json()
                    setProgramas(data)
                }
            } catch (e) {
                console.error("Error fetching programs", e)
            }
        }
        fetchProgramas()
    }, [token])

    const createUser = async (e) => {
        e.preventDefault()
        setLoading(true)
        setUserResp(null)

        const form = e.target
        const data = {
            username: form.username.value,
            password: form.password.value,
            email: form.email.value,
            first_name: form.first_name.value,
            role: form.role.value,
            cedula: form.cedula.value,
            telefono: form.telefono.value,
            programa: form.programa.value || null
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin-users/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token ? `Token ${token}` : undefined,
                },
                body: JSON.stringify(data),
            })
            const json = await res.json()
            setUserResp({ status: res.status, body: json })
            if (res.ok) form.reset()
        } catch (err) {
            setUserResp({ error: String(err) })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Registrar Nuevo Usuario</h2>
                <p className="text-gray-500 mt-1">Complete el formulario para habilitar un nuevo usuario en el sistema.</p>
            </div>

            <form onSubmit={createUser} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
                        <input name="username" required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input name="password" type="password" required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input name="email" type="email" required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                        <input name="first_name" required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                        <select name="role" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                            <option value="Estudiante">Estudiante</option>
                            <option value="Docente">Docente</option>
                            <option value="Administrador">Administrador</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Programa Académico</label>
                        <select name="programa" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                            <option value="">Seleccione un programa</option>
                            {programas.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre_programa}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
                        <input name="cedula" required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                        <input name="telefono" required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Creando...' : 'Registrar Usuario'}
                    </button>
                </div>

                {userResp && (
                    <div className={`mt-6 p-4 rounded-lg flex items-center gap-2 ${userResp.error || (userResp.status && userResp.status >= 400) ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                        {userResp.error || (userResp.status && userResp.status >= 400) ? (
                            <>
                                <span className="font-semibold">Error:</span>
                                <span className="text-sm">{typeof userResp.body === 'object' ? JSON.stringify(userResp.body) : (userResp.error || 'Error al registrar usuario')}</span>
                            </>
                        ) : (
                            <>
                                <span className="font-semibold">¡Éxito!</span>
                                <span className="text-sm">Usuario <strong>{userResp.body.username}</strong> registrado correctamente.</span>
                            </>
                        )}
                    </div>
                )}
            </form>
        </div>
    )
}
