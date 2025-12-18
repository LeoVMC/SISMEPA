import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, UserPlus, FileText, LogOut, X, Users, Wifi, User } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation()
    const navigate = useNavigate()

    const isActive = (path) => location.pathname === path

    const handleLogout = () => {
        localStorage.removeItem('apiToken')
        localStorage.removeItem('userData')
        navigate('/login')
    }

    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    const isAdmin = userData.username === 'admin' || userData.is_staff || userData.groups?.some(g => g.name === 'Administrador' || g.name === 'Admin')
    const isTeacher = userData.groups?.some(g => g.name === 'Docente' || g.name === 'Profesor')
    const showMonitoring = isAdmin || isTeacher
    const dashboardLabel = showMonitoring ? 'Monitoreo' : 'Progreso'

    let panelLabel = 'Panel Estudiante'
    if (isAdmin) panelLabel = 'Panel Administrador'
    else if (isTeacher) panelLabel = 'Panel Docente'

    const menuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: dashboardLabel },
        { path: '/admin/pensum', icon: FileText, label: 'Visualizar Pensum' },
    ]

    // Mostrar opción de Usuarios en Línea solo a Admin y Docentes
    if (showMonitoring) {
        menuItems.splice(1, 0, { path: '/active-users', icon: Wifi, label: 'Usuarios en Línea' })
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

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => window.innerWidth < 1024 && onClose()} // Cerrar al hacer click en móvil
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive(item.path)
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-gray-800 space-y-4">


                <Link
                    to="/profile"
                    onClick={() => window.innerWidth < 1024 && onClose()}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/profile')
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                >
                    <User size={20} />
                    <span className="font-medium">Mi Perfil</span>
                </Link>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </div >
    )
}
