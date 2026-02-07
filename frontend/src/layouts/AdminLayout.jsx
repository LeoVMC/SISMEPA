import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { Menu } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'
import Footer from '../components/Footer'

export default function AdminLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const location = useLocation()

    // Ocultar footer en páginas con scroll propio (como Asesorías)
    const hideFooter = location.pathname === '/asesorias'

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-950 transition-colors duration-200 relative overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between gap-3 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <span className="font-bold text-gray-800 dark:text-white">SISMEPA</span>
                    </div>
                    <ThemeToggle />
                </div>

                <div className="flex-1 overflow-y-auto flex flex-col">
                    <div className="flex-1 p-4 md:p-8">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </div>
                    {!hideFooter && <Footer />}
                </div>
            </main>
        </div>
    )
}
