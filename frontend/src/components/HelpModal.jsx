import React from 'react'
import ReactDOM from 'react-dom'
import { X, ExternalLink, HelpCircle, Mail } from 'lucide-react'

const MANUAL_URL = 'https://heyzine.com/flip-book/f10ed2d2ed.html'
const QR_API_URL = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(MANUAL_URL)}`

export default function HelpModal({ isOpen, onClose }) {
    if (!isOpen) return null

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm mx-4 overflow-hidden animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                        <HelpCircle size={22} />
                        <h2 className="text-lg font-bold">Ayuda</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10 p-1"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col items-center text-center space-y-4">
                    <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                        Escanea el código QR o haz clic en el botón para acceder al <strong>Manual de Usuario.</strong>
                    </p>

                    {/* QR Code */}
                    <div className="bg-white p-3 rounded-xl shadow-inner border border-gray-100">
                        <img
                            src={QR_API_URL}
                            alt="QR - Manual de Usuario SISMEPA"
                            className="w-[200px] h-[200px] object-contain"
                        />
                    </div>

                    {/* Link Button */}
                    <a
                        href={MANUAL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-sm"
                    >
                        <ExternalLink size={16} />
                        Ver Manual de Usuario
                    </a>

                    <div className="w-full border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                            <Mail size={14} />
                            Correo de Contacto
                        </div>
                        <a
                            href="mailto:leonardovimica943@gmail.com"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
                        >
                            leonardovimica943@gmail.com
                        </a>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}
