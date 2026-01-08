import React, { useState, useEffect, useMemo } from 'react'
import { Download, Search, User, GraduationCap, Shield, Edit, Trash2, ArrowUpDown, X, Save } from 'lucide-react'
import { generateMockUsers } from '../utils/mockData'

// Configuración de pestañas
const TABS = [
    { id: 'Estudiantes', label: 'Estudiantes', icon: GraduationCap, endpoint: 'estudiantes', download: 'listado_estudiantes.xlsx' },
    { id: 'Docentes', label: 'Docentes', icon: User, endpoint: 'docentes', download: 'listado_docentes.xlsx' },
    { id: 'Administradores', label: 'Administradores', icon: Shield, endpoint: 'administradores', download: 'listado_admins.xlsx' },
]

// Función de ordenamiento
const sortData = (data, key, direction) => {
    if (!key) return data
    return [...data].sort((a, b) => {
        const getVal = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj)
        let valA = getVal(a, key)
        let valB = getVal(b, key)
        if (typeof valA === 'string') valA = valA.toLowerCase()
        if (typeof valB === 'string') valB = valB.toLowerCase()
        if (valA < valB) return direction === 'asc' ? -1 : 1
        if (valA > valB) return direction === 'asc' ? 1 : -1
        return 0
    })
}

export default function ListadoPage() {
    const token = localStorage.getItem('apiToken') || ''
    const [activeTab, setActiveTab] = useState('Estudiantes')
    const [data, setData] = useState([])
    const [programas, setProgramas] = useState([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
    const [editingItem, setEditingItem] = useState(null)
    const [editForm, setEditForm] = useState({})
    const [cedulaPrefix, setCedulaPrefix] = useState('V')
    const [saving, setSaving] = useState(false)

    const activeConfig = TABS.find(t => t.id === activeTab)

    // Cargar programas una vez
    useEffect(() => {
        fetchProgramas()
    }, [])

    // Cargar datos cuando cambia la pestaña
    useEffect(() => {
        fetchData()
    }, [activeTab, programas])

    const fetchProgramas = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/programas/`, {
                headers: token ? { Authorization: `Token ${token}` } : {}
            })
            if (res.ok) setProgramas(await res.json())
        } catch (e) {
            console.error('Error cargando programas:', e)
        }
    }

    // Función para obtener datos de FakerAPI
    const fetchFakerData = async (quantity, seed) => {
        try {
            const res = await fetch(`https://fakerapi.it/api/v2/persons?_quantity=${quantity}&_locale=es_ES&_seed=${seed}`)
            if (res.ok) {
                const json = await res.json()
                return json.data || []
            }
        } catch (error) {
            console.warn('FakerAPI no disponible:', error.message)
        }
        return null // Indica que se debe usar fallback
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            // Determinar seed basado en pestaña activa
            let seed = 12345
            if (activeTab === 'Docentes') seed = 67890
            if (activeTab === 'Administradores') seed = 11223

            // 1. Obtener datos de FakerAPI
            const fakerData = await fetchFakerData(10, seed)

            // 2. Normalizar datos fake
            let fakeResults = []
            if (fakerData) {
                fakeResults = fakerData.map((p, idx) => {
                    const uniqueVal = seed + idx
                    const randomProg = programas.length > 0 ? programas[uniqueVal % programas.length] : null
                    const cedulaNum = 10000000 + (uniqueVal * 3456) % 20000000
                    const esCompleto = uniqueVal % 2 === 0

                    return {
                        id: `fake-${idx}-${p.id || idx}`,
                        isFake: true,
                        usuario: {
                            first_name: p.firstname,
                            last_name: p.lastname,
                            email: p.email,
                        },
                        first_name: p.firstname,
                        last_name: p.lastname,
                        email: p.email,
                        telefono: p.phone,
                        cedula: `V-${cedulaNum}`,
                        programa: randomProg || null,
                        tipo_contratacion: esCompleto ? 'Tiempo Completo' : 'Tiempo Parcial'
                    }
                })
            } else {
                // Fallback a datos locales si FakerAPI falla
                fakeResults = generateMockUsers(10, activeTab.slice(0, -1), programas).map(u => ({
                    ...u,
                    isFake: true
                }))
            }

            // Filtrar resultados fake si hay búsqueda
            if (search) {
                const s = search.toLowerCase()
                fakeResults = fakeResults.filter(item =>
                    (item.usuario?.first_name || item.first_name || '').toLowerCase().includes(s) ||
                    (item.usuario?.last_name || item.last_name || '').toLowerCase().includes(s) ||
                    (item.usuario?.email || item.email || '').toLowerCase().includes(s)
                )
            }

            // 3. Intentar obtener datos reales de la API
            let realResults = []
            try {
                const url = search
                    ? `${import.meta.env.VITE_API_URL}/${activeConfig.endpoint}/?search=${search}`
                    : `${import.meta.env.VITE_API_URL}/${activeConfig.endpoint}/`

                const res = await fetch(url, {
                    headers: token ? { Authorization: `Token ${token}` } : {}
                })

                if (res.ok) {
                    const json = await res.json()
                    realResults = Array.isArray(json) ? json : (json.results || [])
                }
            } catch (e) {
                console.warn('API real no disponible:', e.message)
            }

            // Combinar: reales primero, luego fake
            setData([...realResults, ...fakeResults])

        } catch (error) {
            console.error('Error cargando datos:', error)
            // Fallback completo a datos locales
            setData(generateMockUsers(10, activeTab.slice(0, -1), programas))
        } finally {
            setLoading(false)
        }
    }

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const sortedData = useMemo(() => sortData(data, sortConfig.key, sortConfig.direction), [data, sortConfig])

    const handleDownload = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/${activeConfig.endpoint}/reporte_excel/`, {
                headers: token ? { Authorization: `Token ${token}` } : {}
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
            alert('Error de conexión al descargar')
        }
    }

    const handleDelete = async (item) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) return

        if (item.isFake) {
            setData(prev => prev.filter(d => d.id !== item.id))
            alert('Usuario (Simulado) eliminado de la vista.')
            return
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/${activeConfig.endpoint}/${item.id}/`, {
                method: 'DELETE',
                headers: token ? { Authorization: `Token ${token}` } : {}
            })
            if (res.ok) {
                setData(prev => prev.filter(d => d.id !== item.id))
            } else {
                alert('Error al eliminar usuario')
            }
        } catch (e) {
            alert('Error de conexión')
        }
    }

    const handleEditClick = (item) => {
        setEditingItem(item)
        const userData = item.usuario || item
        let prefix = 'V', number = item.cedula || ''

        if (number.includes('-')) {
            const parts = number.split('-')
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
            cedula: number,
            programa: typeof item.programa === 'object' ? item.programa?.id : item.programa,
            tipo_contratacion: item.tipo_contratacion || 'Tiempo Completo',
        })
    }

    const handleSaveEdit = async (e) => {
        e.preventDefault()
        setSaving(true)

        const payload = {
            ...editForm,
            cedula: `${cedulaPrefix}-${editForm.cedula}`,
        }

        // Limpiar campos no relevantes
        if (activeTab !== 'Estudiantes') delete payload.programa
        if (activeTab !== 'Docentes') delete payload.tipo_contratacion

        if (editingItem.isFake) {
            // Simulación de guardado
            setTimeout(() => {
                setData(prev => prev.map(d => {
                    if (d.id !== editingItem.id) return d
                    return {
                        ...d,
                        usuario: { ...d.usuario, ...payload },
                        ...payload,
                        programa: payload.programa ? programas.find(p => p.id == payload.programa) : d.programa
                    }
                }))
                setSaving(false)
                setEditingItem(null)
                alert('Cambios guardados (Simulación FakerAPI)')
            }, 500)
            return
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/${activeConfig.endpoint}/${editingItem.id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Token ${token}` } : {})
                },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                const updated = await res.json()
                setData(prev => prev.map(d => d.id === editingItem.id ? updated : d))
                setEditingItem(null)
            } else {
                const err = await res.json()
                alert('Error: ' + JSON.stringify(err))
            }
        } catch (e) {
            alert('Error de conexión')
        } finally {
            setSaving(false)
        }
    }

    // Componente de cabecera ordenable
    const SortableHeader = ({ label, sortKey }) => (
        <th
            className="p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors select-none"
            onClick={() => handleSort(sortKey)}
        >
            <div className="flex items-center gap-2">
                {label}
                <ArrowUpDown size={14} className={sortConfig.key === sortKey ? 'text-blue-500' : 'text-gray-400'} />
            </div>
        </th>
    )

    // Extraer datos de item para mostrar
    const getDisplayData = (item) => ({
        firstName: item.usuario?.first_name || item.first_name || '-',
        lastName: item.usuario?.last_name || item.last_name || '-',
        email: item.usuario?.email || item.email || '-',
        cedula: item.cedula || '-',
        telefono: item.telefono || '-',
        programa: typeof item.programa === 'object'
            ? item.programa?.nombre_programa
            : programas.find(p => p.id === item.programa)?.nombre_programa || '-',
        contratacion: item.tipo_contratacion || '-',
    })

    const isStudent = activeTab === 'Estudiantes'
    const isDocente = activeTab === 'Docentes'

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Listados del Sistema</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gestión y visualización de usuarios por rol.</p>
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
                                    : 'text-gray-500 hover:text-gray-700'
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
                        onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                </div>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm"
                >
                    <Download size={18} />
                    <span>Descargar Listado</span>
                </button>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Cargando...</div>
                ) : data.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No hay registros encontrados.</div>
                ) : (
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
                                const d = getDisplayData(item)
                                return (
                                    <tr
                                        key={item.id || idx}
                                        className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 ${item.isFake ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                    >
                                        <td className="p-4">{d.firstName}</td>
                                        <td className="p-4">{d.lastName}</td>
                                        <td className="p-4 font-mono text-sm">{d.cedula}</td>
                                        <td className="p-4">{d.telefono}</td>
                                        <td className="p-4">{d.email}</td>
                                        {isStudent && <td className="p-4">{d.programa}</td>}
                                        {isDocente && <td className="p-4">{d.contratacion}</td>}
                                        <td className="p-4">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleEditClick(item)}
                                                    className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                                                    title="Editar"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-lg"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal de Edición */}
            {editingItem && (
                <EditModal
                    item={editingItem}
                    form={editForm}
                    setForm={setEditForm}
                    prefix={cedulaPrefix}
                    setPrefix={setCedulaPrefix}
                    programas={programas}
                    isStudent={isStudent}
                    isDocente={isDocente}
                    saving={saving}
                    onSave={handleSaveEdit}
                    onClose={() => setEditingItem(null)}
                />
            )}
        </div>
    )
}

// Componente de Modal de Edición
function EditModal({ item, form, setForm, prefix, setPrefix, programas, isStudent, isDocente, saving, onSave, onClose }) {
    const handleNumericInput = (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '')
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Editar Usuario</h3>
                        {item.isFake && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-200">
                                FakerAPI
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={onSave} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Nombres" value={form.first_name} onChange={v => setForm({ ...form, first_name: v })} />
                        <InputField label="Apellidos" value={form.last_name} onChange={v => setForm({ ...form, last_name: v })} />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cédula</label>
                            <div className="flex">
                                <select
                                    value={prefix}
                                    onChange={(e) => setPrefix(e.target.value)}
                                    className="px-3 py-2 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white"
                                >
                                    <option value="V">V</option>
                                    <option value="E">E</option>
                                    <option value="J">J</option>
                                </select>
                                <input
                                    type="text"
                                    maxLength="15"
                                    value={form.cedula}
                                    onInput={handleNumericInput}
                                    onChange={e => setForm({ ...form, cedula: e.target.value })}
                                    className="w-full px-4 py-2 rounded-r-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                            </div>
                        </div>

                        <InputField label="Teléfono" value={form.telefono} onChange={v => setForm({ ...form, telefono: v })} numeric />
                        <div className="col-span-2">
                            <InputField label="Email" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
                        </div>

                        {isStudent && (
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Carrera</label>
                                <select
                                    value={form.programa || ''}
                                    onChange={e => setForm({ ...form, programa: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                >
                                    <option value="">Seleccione una carrera</option>
                                    {programas.map(p => <option key={p.id} value={p.id}>{p.nombre_programa}</option>)}
                                </select>
                            </div>
                        )}

                        {isDocente && (
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contratación</label>
                                <select
                                    value={form.tipo_contratacion || ''}
                                    onChange={e => setForm({ ...form, tipo_contratacion: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                >
                                    <option value="">Seleccione el tipo</option>
                                    <option value="Tiempo Completo">Tiempo Completo</option>
                                    <option value="Tiempo Parcial">Tiempo Parcial</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg dark:bg-gray-800 dark:text-gray-300"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? 'Guardando...' : <><Save size={18} /> Guardar</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Componente de campo de entrada reutilizable
function InputField({ label, value, onChange, type = 'text', numeric = false }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <input
                type={type}
                value={value}
                onInput={numeric ? (e) => e.target.value = e.target.value.replace(/[^0-9]/g, '') : undefined}
                onChange={e => onChange(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
        </div>
    )
}
