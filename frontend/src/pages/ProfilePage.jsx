import React, { useState, useEffect } from 'react'
import { User, Lock, Save, Camera, Mail, Phone, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('personal')
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)

    // Form States
    const [personalForm, setPersonalForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        username: ''
    })

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    useEffect(() => {
        // Load initial data from localStorage
        const storedUser = localStorage.getItem('userData')
        if (storedUser) {
            const parsed = JSON.parse(storedUser)
            setUserData(parsed)
            setPersonalForm({
                first_name: parsed.first_name || '',
                last_name: parsed.last_name || '',
                email: parsed.email || '',
                phone: parsed.telefono || '', // Assuming 'telefono' field
                username: parsed.username || ''
            })
        }
    }, [])

    const handlePersonalSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        // Validate
        if (!personalForm.first_name || !personalForm.last_name || !personalForm.email) {
            setMessage({ type: 'error', text: 'Por favor complete los campos obligatorios.' })
            setLoading(false)
            return
        }

        // Simulate API Call
        setTimeout(() => {
            const updatedUser = { ...userData, ...personalForm }
            localStorage.setItem('userData', JSON.stringify(updatedUser))
            setUserData(updatedUser)
            setMessage({ type: 'success', text: 'Información actualizada exitosamente.' })
            setLoading(false)
        }, 1000)
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ type: 'error', text: 'Las contraseñas nuevas no coinciden.' })
            setLoading(false)
            return
        }

        if (passwordForm.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' })
            setLoading(false)
            return
        }

        // Simulate API Call
        setTimeout(() => {
            setMessage({ type: 'success', text: 'Contraseña actualizada exitosamente.' })
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
            setLoading(false)
        }, 1500)
    }

    if (!userData) return <div className="p-8 text-center">Cargando perfil...</div>

    const roleName = userData.groups?.[0]?.name || (userData.is_staff ? 'Administrador' : 'Usuario')

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mi Perfil</h1>
                <p className="text-gray-500 dark:text-gray-400">Gestiona tu información personal y seguridad de la cuenta.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* ID Card / Sidebar */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20"></div>

                        <div className="relative relative z-10 flex flex-col items-center">
                            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-900 shadow-lg mb-4 text-gray-400">
                                <User size={48} />
                                {/* Optional: Add camera button overlay */}
                                {/* <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition-colors">
                                     <Camera size={14} />
                                 </button> */}
                            </div>

                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{userData.first_name} {userData.last_name}</h2>
                            <span className="inline-block mt-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                                {roleName}
                            </span>

                            <div className="mt-6 w-full space-y-3 text-left">
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <Shield size={16} className="shrink-0" />
                                    <span className="truncate">{userData.username}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <Mail size={16} className="shrink-0" />
                                    <span className="truncate">{userData.email || 'No email'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <nav className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-2 space-y-1">
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'personal'
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            <User size={18} />
                            Información Personal
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'security'
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            <Lock size={18} />
                            Seguridad
                        </button>
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="md:col-span-2">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 md:p-8">
                        {message && (
                            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 text-sm ${message.type === 'success'
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                                }`}>
                                {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                {message.text}
                            </div>
                        )}

                        {activeTab === 'personal' && (
                            <form onSubmit={handlePersonalSubmit} className="space-y-6 animate-in fade-in duration-300">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                                    Editar Información
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nombres</label>
                                        <input
                                            type="text"
                                            value={personalForm.first_name}
                                            onChange={e => setPersonalForm({ ...personalForm, first_name: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Apellidos</label>
                                        <input
                                            type="text"
                                            value={personalForm.last_name}
                                            onChange={e => setPersonalForm({ ...personalForm, last_name: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Correo Electrónico</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="email"
                                                value={personalForm.email}
                                                onChange={e => setPersonalForm({ ...personalForm, email: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Teléfono</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="tel"
                                                value={personalForm.phone}
                                                onChange={e => setPersonalForm({ ...personalForm, phone: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                placeholder="+58 ..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                        Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'security' && (
                            <form onSubmit={handlePasswordSubmit} className="space-y-6 animate-in fade-in duration-300">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                                    Cambiar Contraseña
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Contraseña Actual</label>
                                        <input
                                            type="password"
                                            value={passwordForm.currentPassword}
                                            onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nueva Contraseña</label>
                                        <input
                                            type="password"
                                            value={passwordForm.newPassword}
                                            onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirmar Nueva Contraseña</label>
                                        <input
                                            type="password"
                                            value={passwordForm.confirmPassword}
                                            onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                        Actualizar Contraseña
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
