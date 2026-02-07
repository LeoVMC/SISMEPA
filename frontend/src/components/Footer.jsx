import React from 'react'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="w-full py-4 px-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-800/50 transition-colors duration-200">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Logo y Copyright */}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                        SISMEPA
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">Sistema de Monitoreo de Avance Educativo Universitario y Prelaciones Académicas</span>
                </div>

                {/* Info adicional */}
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                    <span className="text-gray-300 dark:text-gray-700">|</span>
                    <span>Copyright © {currentYear} SISMEPA TEAM</span>
                </div>
            </div>
        </footer>
    )
}
