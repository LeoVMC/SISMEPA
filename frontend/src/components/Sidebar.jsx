import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, UserPlus, FileText, LogOut, X, Users, Wifi, User, ClipboardList, Calendar } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import api from '../services/api'

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation()
    const navigate = useNavigate()
    const [ucActuales, setUcActuales] = useState(0)

    const isActive = (path) => location.pathname === path

    const handleLogout = () => {
        if (!window.confirm('¿Estás seguro de que deseas cerrar la sesión?')) return
        localStorage.removeItem('apiToken')
        localStorage.removeItem('userData')
        navigate('/login')
    }

    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    const isAdmin = userData.username === 'admin' || userData.is_staff || userData.groups?.some(g => g.name === 'Administrador' || g.name === 'Admin')
    const isTeacher = userData.groups?.some(g => g.name === 'Docente' || g.name === 'Profesor')
    const showMonitoring = isAdmin || isTeacher
    const dashboardLabel = showMonitoring ? 'Monitoreo' : 'Progreso'

    // Fetch UC Info for students
    useEffect(() => {
        if (!isAdmin && !isTeacher) {
            const fetchUC = async () => {
                try {
                    const response = await api.get('/estudiantes/mi-info/')
                    if (response.ok) {
                        const data = await response.json()
                        if (data.uc_actuales !== undefined) {
                            setUcActuales(data.uc_actuales)
                        }
                    }
                } catch (error) {
                    console.error("Error fetching UC info", error)
                }
            }
            fetchUC()

            // Listen for enrollment events (if implied) or just polling?
            // For now just on mount.
        }
    }, [isAdmin, isTeacher, location.pathname]) // Refresh on navigation changes (e.g. after enrollment)

    let panelLabel = 'Panel Estudiante'
    if (isAdmin) panelLabel = 'Panel Administrador'
    else if (isTeacher) panelLabel = 'Panel Docente'

    const menuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: dashboardLabel },
        { path: '/horario', icon: Calendar, label: 'Horario' },
        { path: '/admin/pensum', icon: FileText, label: 'Pensums' },
    ]

    // Mostrar opción de Usuarios en Línea solo a Admin y Docentes
    if (showMonitoring) {
        menuItems.splice(1, 0, { path: '/active-users', icon: Wifi, label: 'Usuarios en Línea' })
    }

    // Mostrar opción de Calificaciones a Docentes y Administradores
    if (isTeacher || isAdmin) {
        menuItems.push({ path: '/calificaciones', icon: ClipboardList, label: 'Calificaciones' })
    }

    if (isAdmin) {
        menuItems.push(
            { path: '/admin/register', icon: UserPlus, label: 'Registrar Usuario' },
            { path: '/admin/listado', icon: Users, label: 'Listado' }
        )
    }

    return (
        <div className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 text-white flex flex-col transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        SISMEPA
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">{panelLabel}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden lg:block">
                        <ThemeToggle />
                    </div>
                    {/* Botón cerrar para móvil */}
                    <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item, index) => {
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => window.innerWidth < 1024 && onClose()} // Cerrar al hacer click en móvil
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group
                                ${isActive(item.path)
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-glow-blue'
                                    : 'text-gray-400 hover:bg-gray-800/80 hover:text-white hover:translate-x-1'
                                }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <Icon size={20} className={`transition-transform duration-300 ${!isActive(item.path) ? 'group-hover:scale-110' : ''}`} />
                            <span className="font-medium">{item.label}</span>

                        </Link>
                    )
                })}
            </nav>

            {/* UC Counter for Students */}
            {!isAdmin && !isTeacher && ucActuales >= 0 && (
                <div className="px-4 mb-4">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700/50 shadow-lg">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">UC Usadas</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ucActuales > 35 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                {ucActuales} / 35
                            </span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${ucActuales > 35 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                                style={{ width: `${Math.min((ucActuales / 35) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="p-4 border-t border-gray-800 space-y-4">

                <Link
                    to="/profile"
                    onClick={() => window.innerWidth < 1024 && onClose()}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${isActive('/profile')
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-glow-blue'
                        : 'text-gray-400 hover:bg-gray-800/80 hover:text-white'
                        }`}
                >
                    <User size={20} className={`transition-transform duration-300 ${!isActive('/profile') ? 'group-hover:scale-110' : ''}`} />
                    <span className="font-medium">Mi Perfil</span>
                </Link>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-all duration-300 group text-red-400 hover:bg-red-900/20 hover:text-red-300"
                >
                    <LogOut size={20} className="transition-transform duration-300 group-hover:scale-110" />
                    <span className="font-medium">Cerrar Sesión</span>
                </button>
            </div>


        </div >
    )
}
