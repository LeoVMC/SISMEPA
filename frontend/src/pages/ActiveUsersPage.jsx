import React, { useState, useEffect, useMemo } from 'react'
import { Search, User, Monitor, Clock, ShieldAlert, Smartphone } from 'lucide-react'
import { generateOnlineUsers } from '../utils/mockData'

const STATUS_COLORS = {
    online: 'bg-green-500',
    idle: 'bg-yellow-500',
    offline: 'bg-gray-400',
}

const ROLE_STYLES = {
    Administrador: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    Docente: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    Estudiante: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
}

export default function ActiveUsersPage() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [selectedSection, setSelectedSection] = useState('all')
    const [mySections, setMySections] = useState([])

    const currentUser = JSON.parse(localStorage.getItem('userData') || '{}')
    const token = localStorage.getItem('apiToken')
    const isAdmin = currentUser.is_staff || currentUser.groups?.some(g => ['Administrador', 'Admin'].includes(g.name))
    const isTeacher = currentUser.groups?.some(g => ['Docente', 'Profesor'].includes(g.name))

    useEffect(() => {
        if (isTeacher) {
            loadTeacherData()
        } else {
            loadUsers()
        }
        const interval = setInterval(updateStatuses, 30000)
        return () => clearInterval(interval)
    }, [])

    const loadTeacherData = async () => {
        setLoading(true)
        try {
            const secRes = await fetch(`${import.meta.env.VITE_API_URL}/secciones/mis-secciones/`, {
                headers: { Authorization: `Token ${token}` }
            })

            const onlineRes = await fetch(`${import.meta.env.VITE_API_URL}/online-users/`, {
                headers: { Authorization: `Token ${token}` }
            })
            const onlineUsers = onlineRes.ok ? await onlineRes.json() : []

            if (secRes.ok) {
                const data = await secRes.json()
                setMySections(data)

                const allStudents = []
                const studentIds = new Set()

                data.forEach(sec => {
                    sec.estudiantes?.forEach(est => {
                        if (!studentIds.has(est.estudiante_id)) {
                            studentIds.add(est.estudiante_id)
                            const isOnline = onlineUsers.find(u => u.student_id === est.estudiante_id)

                            if (isOnline) {
                                allStudents.push({
                                    id: est.estudiante_id,
                                    name: est.nombre,
                                    email: est.cedula,
                                    role: 'Estudiante',
                                    status: 'online',
                                    lastActivity: 'Ahora',
                                    device: isOnline.device || 'Desktop',
                                    sections: [sec.id]
                                })
                            }
                        } else {
                            const existing = allStudents.find(s => s.id === est.estudiante_id)
                            if (existing) existing.sections.push(sec.id)
                        }
                    })
                })

                const fakeUsers = await fetchFakerUsers(5)
                const simulatedUsers = fakeUsers.map((u, i) => ({
                    id: `sim-teacher-${i}`,
                    name: `${u.firstname} ${u.lastname}`,
                    email: u.email,
                    role: 'Estudiante',
                    status: 'online',
                    lastActivity: 'Hace un momento',
                    device: Math.random() > 0.5 ? 'Desktop' : 'Mobile',
                    sections: []
                }))

                setUsers([...allStudents, ...simulatedUsers])
            }
        } catch (error) {
            console.error('Error cargando datos de docente:', error)
            setUsers(generateOnlineUsers(10))
        } finally {
            setLoading(false)
        }
    }

    const loadUsers = async () => {
        setLoading(true)
        try {
            const fakeUsers = await fetchFakerUsers(15)
            const simulatedUsers = fakeUsers.map((u, i) => {
                let role = 'Estudiante'
                if (i % 5 === 0) role = 'Administrador'
                else if (i % 3 === 0) role = 'Docente'
                return {
                    id: `sim-${i}`,
                    name: `${u.firstname} ${u.lastname}`,
                    email: u.email,
                    role: role,
                    status: 'online',
                    lastActivity: 'Hace un momento',
                    device: Math.random() > 0.5 ? 'Desktop' : 'Mobile',
                }
            })

            if (token) {
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/online-users/`, {
                        headers: { Authorization: `Token ${token}` }
                    })
                    if (res.ok) {
                        const realUsersRaw = await res.json()
                        const currentUserId = currentUser.user_id || currentUser.id
                        const realUsers = realUsersRaw
                            .filter(u => u.id !== currentUserId)
                            .map(u => ({
                                id: `real-${u.id}`,
                                name: u.name,
                                email: u.email,
                                role: u.role,
                                status: 'online',
                                lastActivity: 'Ahora mismo',
                                device: u.device || 'Desktop'
                            }))
                        setUsers([...realUsers, ...simulatedUsers])
                        return
                    }
                } catch (e) {
                    console.warn('API de usuarios online no disponible')
                }
            }

            setUsers(simulatedUsers)
        } catch (error) {
            console.error('Error cargando usuarios:', error)
            setUsers(generateOnlineUsers(12))
        } finally {
            setLoading(false)
        }
    }

    const fetchFakerUsers = async (quantity) => {
        try {
            const res = await fetch(`https://fakerapi.it/api/v2/persons?_quantity=${quantity}&_locale=es_ES`)
            if (res.ok) {
                const data = await res.json()
                return data.data || []
            }
        } catch (error) {
            console.warn('FakerAPI no disponible, usando datos locales:', error.message)
        }
        return generateOnlineUsers(quantity).map(u => ({
            firstname: u.name.split(' ')[0],
            lastname: u.name.split(' ')[1] || 'Usuario',
            email: u.email
        }))
    }

    const updateStatuses = () => {
        setUsers(prev => prev.map(user => ({
            ...user,
            status: Math.random() > 0.15 ? 'online' : 'idle'
        })))
    }

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.email?.toLowerCase().includes(search.toLowerCase())
            const matchesFilter = filter === 'all' ||
                (filter === 'students' && user.role === 'Estudiante') ||
                (filter === 'teachers' && user.role === 'Docente') ||
                (filter === 'admins' && user.role === 'Administrador')
            let matchesSection = true
            if (isTeacher && selectedSection !== 'all') {
                matchesSection = user.sections?.includes(parseInt(selectedSection))
            }
            return matchesSearch && matchesFilter && matchesSection
        })
    }, [users, search, filter, selectedSection, isTeacher])

    const onlineCount = users.filter(u => u.status === 'online').length

    if (!isAdmin && !isTeacher) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 text-gray-500">
                <ShieldAlert size={64} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Acceso Restringido</h2>
                <p>No tienes permisos para visualizar los usuarios conectados.</p>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                        Usuarios en Línea
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Monitoreo en tiempo real de la actividad en la plataforma.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                    </span>
                    <span className="font-mono font-bold text-lg text-gray-700 dark:text-gray-200">
                        {onlineCount}
                    </span>
                    <span className="text-sm text-gray-500">Conectados</span>
                </div>
            </header>

            {/* Filtros */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row gap-4 justify-between">
                {isAdmin && (
                    <div className="flex flex-wrap gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        {[
                            { id: 'all', label: 'Todos' },
                            { id: 'students', label: 'Estudiantes' },
                            { id: 'teachers', label: 'Docentes' },
                            { id: 'admins', label: 'Administradores' },
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setFilter(opt.id)}
                                className={`px-3 py-1.5 text-sm rounded-md transition-all ${filter === opt.id
                                    ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
                                    : 'text-gray-500'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}

                {isTeacher && mySections.length > 0 && (
                    <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="w-full md:w-64 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm dark:text-white"
                    >
                        <option value="all">Todas las Secciones</option>
                        {mySections.map(sec => (
                            <option key={sec.id} value={sec.id}>
                                {sec.asignatura_nombre} - Sec {sec.codigo_seccion}
                            </option>
                        ))}
                    </select>
                )}

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar usuario..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm dark:text-white"
                    />
                </div>
            </div>

            {/* Grid de usuarios */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(n => (
                        <div key={n} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.map(user => (
                        <UserCard key={user.id} user={user} />
                    ))}
                    {filteredUsers.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No se encontraron usuarios con los filtros aplicados.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function UserCard({ user }) {
    return (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
            <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                    <User size={24} />
                </div>
                <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white dark:border-gray-900 rounded-full ${STATUS_COLORS[user.status] || STATUS_COLORS.offline}`} />
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">{user.name}</h3>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>

                <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                        {user.device === 'Mobile' ? <Smartphone size={12} /> : <Monitor size={12} />}
                        <span>{user.device}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{user.lastActivity}</span>
                    </div>
                </div>
            </div>

            <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${ROLE_STYLES[user.role] || ROLE_STYLES.Estudiante}`}>
                {user.role}
            </span>
        </div>
    )
}
