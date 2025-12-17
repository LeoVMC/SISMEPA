import React, { useState, useEffect } from 'react'
import { Download, Search, User, GraduationCap, Shield, Edit, Trash2, ArrowUpDown, X, Save } from 'lucide-react'

// Función auxiliar para ordenar
const sortData = (data, key, direction) => {
    return [...data].sort((a, b) => {
        let valA = key.split('.').reduce((o, i) => o?.[i], a)
        let valB = key.split('.').reduce((o, i) => o?.[i], b)

        if (typeof valA === 'string') valA = valA.toLowerCase()
        if (typeof valB === 'string') valB = valB.toLowerCase()

        if (valA < valB) return direction === 'asc' ? -1 : 1
        if (valA > valB) return direction === 'asc' ? 1 : -1
        return 0
    })
}

export default function ListadoPage() {
    const [token] = useState(localStorage.getItem('apiToken') || '')
    const [activeTab, setActiveTab] = useState('Estudiantes')
    const [data, setData] = useState([])
    const [programas, setProgramas] = useState([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

    // Estado de Edición
    const [editingItem, setEditingItem] = useState(null)
    const [editForm, setEditForm] = useState({})
    const [cedulaPrefix, setCedulaPrefix] = useState('V')
    const [saving, setSaving] = useState(false)

    const TABS = [
        { id: 'Estudiantes', label: 'Estudiantes', icon: GraduationCap, endpoint: 'estudiantes', download: 'listado_estudiantes.xlsx' },
        { id: 'Docentes', label: 'Docentes', icon: User, endpoint: 'docentes', download: 'listado_docentes.xlsx' },
        { id: 'Administradores', label: 'Administradores', icon: Shield, endpoint: 'administradores', download: 'listado_admins.xlsx' },
    ]

    const activeConfig = TABS.find(t => t.id === activeTab)

    useEffect(() => {
        fetchProgramas()
    }, [token]) // Obtener programas una vez

    useEffect(() => {
        if (programas.length > 0 || activeTab === 'Administradores') {
            fetchData()
        }
    }, [activeTab, token, search, programas])

    const fetchProgramas = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/programas/`, {
                headers: { Authorization: token ? `Token ${token}` : undefined }
            })
            if (res.ok) {
                const json = await res.json()
                setProgramas(json)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            // 1. Obtener Datos Reales
            let url = `${import.meta.env.VITE_API_URL}/${activeConfig.endpoint}/`
            const params = new URLSearchParams()
            if (search) params.append('search', search)
            if (search) url += `?${params.toString()}`

            const realReq = fetch(url, {
                headers: { Authorization: token ? `Token ${token}` : undefined }
            }).then(r => r.ok ? r.json() : [])

            // 2. Obtener Datos Falsos (solo si no hay búsqueda o simulación simple)
            // Obtenemos siempre para mezclar, a menos que la búsqueda sea específica
            const fakeReq = fetch(`https://fakerapi.it/api/v2/persons?_quantity=10&_locale=es_ES`)
                .then(r => r.ok ? r.json() : { data: [] })

            const [realJson, fakeJson] = await Promise.all([realReq, fakeReq])

            const realResults = Array.isArray(realJson) ? realJson : (realJson.results || [])

            // Normalizar Datos Falsos
            const fakeResults = (fakeJson.data || []).map((p, idx) => {
                const randomProg = programas.length > 0 ? programas[Math.floor(Math.random() * programas.length)] : null
                return {
                    id: `fake-${idx}-${p.id}`,
                    isFake: true,
                    // Aplanar estructura para coincidir con la UI
                    usuario: {
                        first_name: p.firstname,
                        last_name: p.lastname,
                        email: p.email,
                    },
                    first_name: p.firstname, // Acceso directo de respaldo
                    last_name: p.lastname,
                    email: p.email,
                    telefono: p.phone,
                    cedula: `V-${Math.floor(Math.random() * 10000000)}`,
                    programa: randomProg ? randomProg : 'Ingeniería Demo', // Objeto o ID, la UI maneja ambos
                    tipo_contratacion: Math.random() > 0.5 ? 'Tiempo Completo' : 'Tiempo Parcial'
                }
            })

            // Filtrar resultados falsos si hay término de búsqueda (lado cliente)
            let filteredFake = fakeResults
            if (search) {
                const s = search.toLowerCase()
                filteredFake = fakeResults.filter(item =>
                    item.usuario.first_name.toLowerCase().includes(s) ||
                    item.usuario.last_name.toLowerCase().includes(s) ||
                    item.usuario.email.toLowerCase().includes(s)
                )
            }

            setData([...realResults, ...filteredFake])

        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/${activeConfig.endpoint}/reporte_excel/`, {
                headers: { Authorization: token ? `Token ${token}` : undefined }
            })

            if (res.ok) {
                const blob = await res.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = activeConfig.download
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            } else {
                alert('Error al descargar el listado')
            }
        } catch (e) {
            console.error(e)
            alert('Error de conexión al descargar')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) return

        const isFake = String(id).startsWith('fake-')

        if (isFake) {
            // Simulación de eliminación local
            setData(data.filter(item => item.id !== id))
            alert('Usuario (Simulado) eliminado solo de la vista.')
            return
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/${activeConfig.endpoint}/${id}/`, {
                method: 'DELETE',
                headers: { Authorization: token ? `Token ${token}` : undefined }
            })
            if (res.ok) {
                setData(data.filter(item => item.id !== id))
            } else {
                alert('Error al eliminar usuario')
            }
        } catch (e) {
            console.error(e)
            alert('Error de conexión')
        }
    }

    const handleNumericInput = (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '')
    }

    const handleEditClick = (item) => {
        setEditingItem(item)
        const userData = item.usuario ? item.usuario : item

        let cedulaVal = item.cedula || item.username || ''
        let prefix = 'V'
        let number = cedulaVal

        if (cedulaVal.includes('-')) {
            const parts = cedulaVal.split('-')
            // Asumiendo formato Prefijo-Número
            if (['V', 'E', 'J'].includes(parts[0])) {
                prefix = parts[0]
                number = parts[1]
            }
        }

        setCedulaPrefix(prefix)

        setEditForm({
            first_name: userData.first_name || item.first_name || '',
            last_name: userData.last_name || item.last_name || '',
            email: userData.email || item.email || '',
            telefono: item.telefono || '',
            cedula: number, // Solo la parte numérica
            programa: typeof item.programa === 'object' ? item.programa?.id : item.programa,
            tipo_contratacion: item.tipo_contratacion || 'Tiempo Completo',
        })
    }

    const handleSaveEdit = async (e) => {
        e.preventDefault()
        setSaving(true)

        if (editingItem.isFake) {
            // Simular Guardado
            setTimeout(() => {
                setData(data.map(d => {
                    if (d.id === editingItem.id) {
                        const updated = { ...d }
                        updated.usuario.first_name = editForm.first_name
                        updated.usuario.last_name = editForm.last_name
                        updated.usuario.email = editForm.email
                        updated.telefono = editForm.telefono
                        updated.cedula = `${cedulaPrefix}-${editForm.cedula}`

                        // Actualizar campos simples
                        updated.first_name = editForm.first_name
                        updated.email = editForm.email
                        updated.tipo_contratacion = editForm.tipo_contratacion

                        // Actualización visual de Programa
                        if (editForm.programa) {
                            const prog = programas.find(p => p.id == editForm.programa) // verificación estricta podría fallar por tipos
                            if (prog) updated.programa = prog
                        }
                        return updated
                    }
                    return d
                }))
                setSaving(false)
                setEditingItem(null)
                alert('Cambios guardados localmente (Simulación Faker)')
            }, 800)
            return
        }

        try {
            const isStudent = activeTab === 'Estudiantes'
            const isDocente = activeTab === 'Docentes'

            const payload = { ...editForm }

            // Formatear Cédula
            payload.cedula = `${cedulaPrefix}-${editForm.cedula}`

            if (!isStudent) {
                delete payload.programa
            }
            if (!isDocente) {
                delete payload.tipo_contratacion
            }

            const res = await fetch(`${import.meta.env.VITE_API_URL}/${activeConfig.endpoint}/${editingItem.id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token ? `Token ${token}` : undefined
                },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                const updatedItem = await res.json()
                setData(data.map(d => d.id === editingItem.id ? updatedItem : d))
                setEditingItem(null)
            } else {
                const err = await res.json()
                alert('Error al guardar: ' + JSON.stringify(err))
            }
        } catch (e) {
            console.error(e)
            alert('Error de conexión')
        } finally {
            if (!editingItem.isFake) setSaving(false)
        }
    }

    const handleSort = (key) => {
        let direction = 'asc'
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    const sortedData = React.useMemo(() => {
        if (!sortConfig.key) return data
        return sortData(data, sortConfig.key, sortConfig.direction)
    }, [data, sortConfig])

    const SortableHeader = ({ label, sortKey }) => (
        <th
            className="p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group select-none"
            onClick={() => handleSort(sortKey)}
        >
            <div className="flex items-center gap-2">
                {label}
                <ArrowUpDown size={14} className={`text-gray-400 group-hover:text-gray-600 ${sortConfig.key === sortKey ? 'text-blue-500' : ''}`} />
            </div>
        </th>
    )

    const renderTable = () => {
        if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>
        if (!data || data.length === 0) return <div className="p-8 text-center text-gray-500">No hay registros encontrados.</div>

        const isStudent = activeTab === 'Estudiantes'
        const isDocente = activeTab === 'Docentes'

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm uppercase">

                            <SortableHeader label="Nombres" sortKey="usuario.first_name" />
                            <SortableHeader label="Apellidos" sortKey="usuario.last_name" />
                            <SortableHeader label="Cédula" sortKey="cedula" />
                            <SortableHeader label="Teléfono" sortKey="telefono" />
                            <SortableHeader label="Correo" sortKey="usuario.email" />
                            {isStudent && <SortableHeader label="Carrera" sortKey="programa.nombre_programa" />}
                            {isDocente && <SortableHeader label="Contratación" sortKey="tipo_contratacion" />}
                            <th className="p-4 border-b border-gray-200 dark:border-gray-700">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 dark:text-gray-300">
                        {sortedData.map((item, idx) => {
                            const firstName = item.usuario?.first_name || item.first_name || '-'
                            const lastName = item.usuario?.last_name || item.last_name || '-'
                            const email = item.usuario?.email || item.email || '-'
                            const cedula = item.cedula || item.username || '-'
                            const telefono = item.telefono || '-'

                            let programa_nombre = '-'
                            if (item.programa) {
                                if (typeof item.programa === 'object') {
                                    programa_nombre = item.programa.nombre_programa
                                } else {
                                    // It's an ID, find it in programs list
                                    const prog = programas.find(p => p.id === item.programa)
                                    programa_nombre = prog ? prog.nombre_programa : item.programa
                                }
                            }

                            const contratacion = item.tipo_contratacion || '-'

                            return (
                                <tr key={item.id || idx} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800 ${item.isFake ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>

                                    <td className="p-4">{firstName}</td>
                                    <td className="p-4">{lastName}</td>
                                    <td className="p-4 font-mono text-sm">{cedula}</td>
                                    <td className="p-4">{telefono}</td>
                                    <td className="p-4">{email}</td>
                                    {isStudent && <td className="p-4">{programa_nombre}</td>}
                                    {isDocente && <td className="p-4">{contratacion}</td>}
                                    <td className="p-4 flex gap-2">
                                        <button onClick={() => handleEditClick(item)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Editar">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Eliminar">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )
    }

    const renderEditModal = () => {
        if (!editingItem) return null
        const isStudent = activeTab === 'Estudiantes'
        const isDocente = activeTab === 'Docentes'

        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                        <div className='flex items-center gap-2'>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Editar Usuario</h3>
                            {editingItem.isFake && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-200">Simulado</span>}
                        </div>
                        <button onClick={() => setEditingItem(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombres</label>
                                <input
                                    type="text"
                                    value={editForm.first_name}
                                    onChange={e => setEditForm({ ...editForm, first_name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellidos</label>
                                <input
                                    type="text"
                                    value={editForm.last_name}
                                    onChange={e => setEditForm({ ...editForm, last_name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
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
                                        type="text"
                                        maxLength="15"
                                        value={editForm.cedula}
                                        onInput={handleNumericInput}
                                        onChange={e => setEditForm({ ...editForm, cedula: e.target.value })}
                                        className="w-full px-4 py-2 rounded-r-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                                <input
                                    type="text"
                                    value={editForm.telefono}
                                    onInput={handleNumericInput}
                                    onChange={e => setEditForm({ ...editForm, telefono: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                            </div>

                            {isStudent && (
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Carrera</label>
                                    <select
                                        value={editForm.programa || ''}
                                        onChange={e => setEditForm({ ...editForm, programa: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    >
                                        <option value="">Seleccione una carrera</option>
                                        {programas.map(p => (
                                            <option key={p.id} value={p.id}>{p.nombre_programa}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {isDocente && (
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contratación</label>
                                    <select
                                        value={editForm.tipo_contratacion || ''}
                                        onChange={e => setEditForm({ ...editForm, tipo_contratacion: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    >
                                        <option value="">Seleccione el tipo de contratación</option>
                                        <option value="Tiempo Completo">Tiempo Completo</option>
                                        <option value="Tiempo Parcial">Tiempo Parcial</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setEditingItem(null)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Guardando...' : (
                                    <>
                                        <Save size={18} />
                                        Guardar Cambios
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Listados del Sistema</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gestión y visualización de usuarios por rol (Integración Híbrida).</p>
                </div>
                <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    {TABS.map(tab => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setSearch('') }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                <Icon size={18} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Toolbar */}
            <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50 dark:bg-gray-950/50">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder={`Buscar ${activeTab.toLowerCase()}...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-800 dark:text-white"
                    />
                </div>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
                >
                    <Download size={18} />
                    <span>Descargar Listado</span>
                </button>
            </div>

            {/* Content */}
            {renderTable()}

            {/* Modal */}
            {renderEditModal()}
        </div>
    )
}
