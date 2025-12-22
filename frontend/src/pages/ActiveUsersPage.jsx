import React, { useState, useEffect } from 'react'
import { Wifi, Search, User, Monitor, Clock, ShieldAlert, Smartphone } from 'lucide-react'

// Simulación de estados de conexión
const CONNECTION_STATUSES = ['online', 'idle', 'offline']

export default function ActiveUsersPage() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // all, students, teachers, admins
    const [search, setSearch] = useState('')

    // Obtener rol del usuario actual
    const currentUser = JSON.parse(localStorage.getItem('userData') || '{}')
    const isAdmin = currentUser.username === 'admin' || currentUser.is_staff || currentUser.groups?.some(g => g.name === 'Administrador' || g.name === 'Admin')
    const isTeacher = currentUser.groups?.some(g => g.name === 'Docente' || g.name === 'Profesor')

    useEffect(() => {
        // Carga inicial simulada de usuarios "conectados"
        fetchUsers()

        // Simulación de WebSocket: Actualizar estados cada 5 segundos
        const interval = setInterval(() => {
            updateUserStatuses()
        }, 5000)

        // Simular entrada/salida de usuarios cada 8 segundos
        const fluxInterval = setInterval(() => {
            simulateUserFlux()
        }, 8000)

        return () => {
            clearInterval(interval)
            clearInterval(fluxInterval)
        }
    }, [])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            // En un escenario real, esto sería un endpoint /users/active
            const res = await fetch(`https://fakerapi.it/api/v2/persons?_quantity=15&_locale=es_ES`)
            const data = await res.json()

            const simulatedUsers = data.data.map((u, i) => {
                let role = 'Estudiante'
                if (i % 5 === 0) role = 'Administrador'
                else if (i % 3 === 0) role = 'Docente'

                return {
                    id: i,
                    name: `${u.firstname} ${u.lastname}`,
                    email: u.email,
                    role: role,
                    status: 'online',
                    lastActivity: 'Hace un momento',
                    device: Math.random() > 0.5 ? 'Desktop' : 'Mobile',
                    ip: `192.168.1.${100 + i}`
                }
            })

            // Si es docente, filtrar solo estudiantes (simulación)
            if (isTeacher && !isAdmin) {
                setUsers(simulatedUsers.filter(u => u.role === 'Estudiante'))
            } else {
                setUsers(simulatedUsers)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const updateUserStatuses = () => {
        setUsers(prevUsers => prevUsers.map(user => {
            // 30% chance de cambiar estado
            if (Math.random() > 0.7) {
                const newStatus = Math.random() > 0.8 ? 'idle' : 'online'
                return { ...user, status: newStatus }
            }
            return user
        }))
    }

    const simulateUserFlux = () => {
        // Simular que alguien se desconecta o conecta
        // Implementación simplificada para mantener la lista estable pero dinámica
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())

        let matchesType = true
        if (filter === 'students') matchesType = user.role === 'Estudiante'
        if (filter === 'teachers') matchesType = user.role === 'Docente'
        if (filter === 'admins') matchesType = user.role === 'Administrador'

        return matchesSearch && matchesType
    })

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return 'bg-green-500'
            case 'idle': return 'bg-yellow-500'
            case 'offline': return 'bg-gray-400'
            default: return 'bg-gray-400'
        }
    }

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
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                        Usuarios en Línea
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Monitoreo en tiempo real de la actividad en la plataforma.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="font-mono font-bold text-lg text-gray-700 dark:text-gray-200">
                        {users.filter(u => u.status === 'online').length}
                    </span>
                    <span className="text-sm text-gray-500">Conectados</span>
                </div>
            </header>

            {/* Filtros y Búsqueda */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex flex-wrap gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-full md:w-auto self-start">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 text-sm rounded-md transition-all ${filter === 'all' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
                    >Todos</button>
                    <button
                        onClick={() => setFilter('students')}
                        className={`px-3 py-1.5 text-sm rounded-md transition-all ${filter === 'students' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
                    >Estudiantes</button>
                    {isAdmin && (
                        <>
                            <button
                                onClick={() => setFilter('teachers')}
                                className={`px-3 py-1.5 text-sm rounded-md transition-all ${filter === 'teachers' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
                            >Docentes</button>
                            <button
                                onClick={() => setFilter('admins')}
                                className={`px-3 py-1.5 text-sm rounded-md transition-all ${filter === 'admins' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
                            >Administradores</button>
                        </>
                    )}
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar usuario..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                    />
                </div>
            </div>

            {/* Grid de Usuarios */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(n => (
                        <div key={n} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.map(user => (
                        <div key={user.id} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                                    <User size={24} />
                                </div>
                                <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white dark:border-gray-900 rounded-full ${getStatusColor(user.status)}`}></div>
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

                            <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${user.role === 'Administrador'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                : user.role === 'Docente'
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                }`}>
                                {user.role}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
