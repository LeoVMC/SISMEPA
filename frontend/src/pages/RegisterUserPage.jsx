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
            username: form.cedula.value,
            password: form.password.value,
            email: form.email.value,
            first_name: form.first_name.value,
            last_name: form.last_name.value,
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
                        <input name="cedula" required className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                        <input name="telefono" required className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:text-white" />
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
                        <select name="role" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:text-white">
                            <option value="Estudiante">Estudiante</option>
                            <option value="Docente">Docente</option>
                            <option value="Administrador">Administrador</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Carrera</label>
                        <select name="programa" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:text-white">
                            <option value="">Seleccione una carrera</option>
                            {programas.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre_programa}</option>
                            ))}
                        </select>
                    </div>
                    {/* Username Hidden/Generated or kept? 
                        Screenshot shows "Nombre de Usuario" input. 
                        User prompt didn't say to remove "Nombre de Usuario". 
                        It said "El orden sea Nombres...". It didn't mention Username.
                        Usually Username is separate. 
                        Validating prompt: "Que el orden sea Nombres, Apellidos, Cédula, Teléfono, Correo, Contraseña, Rol, Carrera".
                        It does NOT list Username.
                        Maybe I should remove Username and auto-generate it from Cédula or Email?
                        Or maybe the user forgot to mention it.
                        "make sure that data is saved... order should be...".
                        If I remove username input, `createUser` needs to generate it.
                        The backend requires `username`.
                        I'll KEEP `username` but put it somewhere or auto-generate?
                        Given the strict order list: "Nombres... Carrera". It lists 8 items.
                        If I must follow the list strictly, where does `username` go?
                        I'll Auto-set username to be `cedula` or `email`?
                        Or I'll just append it to the end or beginning if not specified?
                        Wait, usually systems use email or cedula as username.
                        I'll risk removing the `username` input and set `username` = `cedula` or `email` in the payload.
                        Let's check `CreateUserSerializer`. It expects `username`.
                        I'll use `cedula` as username, or `email`. `cedula` is unique in `Estudiante` model but `User.username` must be unique.
                        I'll modify `createUser` to default username to `cedula` if not present.
                        Actually, I'll keep it simple: I will use `cedula` as the username in the payload.
                    */}
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
