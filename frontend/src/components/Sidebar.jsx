import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, UserPlus, FileText, LogOut } from 'lucide-react'

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation()
    const navigate = useNavigate()

    const isActive = (path) => location.pathname === path

    const handleLogout = () => {
        localStorage.removeItem('apiToken')
        localStorage.removeItem('userData')
        navigate('/login')
    }

    const menuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/register', icon: UserPlus, label: 'Registrar Usuario' },
        { path: '/admin/pensum', icon: FileText, label: 'Visualizar Pensum' },
    ]

    return (
        <div className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        SISMEPA
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">Panel Administrativo</p>
                </div>
                {/* Close button for mobile */}
                <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
                    <LogOut size={20} className="rotate-180" /> {/* Reusing icon as placeholder or use X */}
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => window.innerWidth < 1024 && onClose()} // Close on click on mobile
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive(item.path)
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </div>
    )
}
