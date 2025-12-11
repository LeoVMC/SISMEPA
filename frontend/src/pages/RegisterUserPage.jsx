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

    const [selectedRole, setSelectedRole] = useState('Estudiante')
    const [cedulaPrefix, setCedulaPrefix] = useState('V')

    const handleNumericInput = (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '')
    }

    const createUser = async (e) => {
        e.preventDefault()
        setLoading(true)
        setUserResp(null)

        const form = e.target
        const rawCedula = form.cedula.value
        const formattedCedula = `${cedulaPrefix}-${rawCedula}`

        const data = {
            username: formattedCedula, // Use full cedula as username
            password: form.password.value,
            email: form.email.value,
            first_name: form.first_name.value,
            last_name: form.last_name.value,
            role: form.role.value,
            cedula: formattedCedula,
            telefono: form.telefono.value,
            programa: form.programa?.value || null,
            tipo_contratacion: form.tipo_contratacion?.value || null
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
            if (res.ok) {
                form.reset()
                setSelectedRole('Estudiante')
                setCedulaPrefix('V')
            }
        } catch (err) {
            setUserResp({ error: String(err) })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 md:p-8 transition-colors">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Registrar Nuevo Usuario</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Complete el formulario para habilitar un nuevo usuario en el sistema.</p>
            </div>

            <form onSubmit={createUser} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombres</label>
                        <input name="first_name" required className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellidos</label>
                        <input name="last_name" required className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:text-white" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cédula</label>
                        <div className="flex">
                            <select
                                value={cedulaPrefix}
                                onChange={(e) => setCedulaPrefix(e.target.value)}
                                className="px-3 py-2 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option value="V">V</option>
                                <option value="E">E</option>
                                <option value="J">J</option>
                            </select>
                            <input
                                name="cedula"
                                required
                                type="text"
                                maxLength="15"
                                onInput={handleNumericInput}
                                placeholder="12345678"
                                className="w-full px-4 py-2 rounded-r-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                        <input
                            name="telefono"
                            required
                            type="text"
                            maxLength="15"
                            onInput={handleNumericInput}
                            placeholder="04141234567"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
                        <input name="email" type="email" required className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
                        <input name="password" type="password" required className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
                        <select
                            name="role"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:text-white"
                        >
                            <option value="Estudiante">Estudiante</option>
                            <option value="Docente">Docente</option>
                            <option value="Administrador">Administrador</option>
                        </select>
                    </div>

                    {selectedRole === 'Estudiante' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Carrera</label>
                            <select name="programa" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:text-white">
                                <option value="">Seleccione una carrera</option>
                                {programas.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre_programa}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {selectedRole === 'Docente' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contratación</label>
                            <select name="tipo_contratacion" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:text-white">
                                <option value="">Seleccione el tipo de contratación</option>
                                <option value="Tiempo Completo">Tiempo Completo</option>
                                <option value="Tiempo Parcial">Tiempo Parcial</option>
                            </select>
                        </div>
                    )}
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
                    <div className={`mt-6 p-4 rounded-lg flex items-center gap-2 ${userResp.error || (userResp.status && userResp.status >= 400) ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'}`}>
                        {userResp.error || (userResp.status && userResp.status >= 400) ? (
                            <>
                                <span className="font-semibold">Error:</span>
                                <span className="text-sm">{typeof userResp.body === 'object' ? JSON.stringify(userResp.body) : (userResp.error || 'Error al registrar usuario')}</span>
                            </>
                        ) : (
                            <>
                                <span className="font-semibold">¡Éxito!</span>
                                <span className="text-sm">Usuario registrado correctamente.</span>
                            </>
                        )}
                    </div>
                )}
            </form>
        </div>
    )
}
