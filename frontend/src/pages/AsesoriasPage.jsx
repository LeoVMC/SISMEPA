import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, Bot, User, Loader2 } from 'lucide-react'

export default function AsesoriasPage() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            content: '¡Hola! Soy tu asistente de asesorías académicas. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre tus materias, dudas académicas, o cualquier consulta relacionada con tus estudios.',
            timestamp: new Date()
        }
    ])
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!inputValue.trim() || isLoading) return

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputValue.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setIsLoading(true)


        setTimeout(() => {
            const aiResponse = {
                id: Date.now() + 1,
                type: 'ai',
                content: 'Gracias por tu mensaje. La integración con el asistente de IA está en desarrollo. Pronto podré ayudarte con tus consultas académicas de manera más inteligente. Por ahora, este es un mensaje de demostración.',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, aiResponse])
            setIsLoading(false)
        }, 1500)
    }

    const formatTime = (date) => {
        return date.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className="flex flex-col animate-fade-in -m-4 md:-m-8 h-[calc(100vh-56px)] lg:h-screen overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 bg-white/80 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-glow-blue">
                        <MessageCircle className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Asesorías</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Asistente de IA para consultas académicas</p>
                    </div>
                </div>
            </div>

            {/* Contenedor de Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex items-start gap-3 animate-fade-in-up ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        {/* Avatar */}
                        <div className={`flex-shrink-0 p-2 rounded-xl ${message.type === 'ai'
                            ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                            : 'bg-gradient-to-br from-green-500 to-emerald-600'
                            }`}>
                            {message.type === 'ai' ? (
                                <Bot className="text-white" size={20} />
                            ) : (
                                <User className="text-white" size={20} />
                            )}
                        </div>

                        {/* Burbuja de Mensaje */}
                        <div className={`max-w-[75%] ${message.type === 'user' ? 'text-right' : ''}`}>
                            <div className={`inline-block px-4 py-3 rounded-2xl ${message.type === 'ai'
                                ? 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-md'
                                : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-tr-md'
                                } shadow-soft`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                            </div>
                            <p className={`text-xs text-gray-400 dark:text-gray-500 mt-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                                {formatTime(message.timestamp)}
                            </p>
                        </div>
                    </div>
                ))}

                {/* Indicador de Carga */}
                {isLoading && (
                    <div className="flex items-start gap-3 animate-fade-in">
                        <div className="flex-shrink-0 p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                            <Bot className="text-white" size={20} />
                        </div>
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-3 rounded-2xl rounded-tl-md shadow-soft">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                <Loader2 className="animate-spin" size={16} />
                                <span className="text-sm">Escribiendo...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Area de Escritura */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Escribe tu consulta aquí..."
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isLoading}
                        className="p-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-blue hover:shadow-lg active:scale-95"
                    >
                        <Send size={20} />
                    </button>
                </form>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
                    La integración con Gemini AI está próximamente disponible
                </p>
            </div>
        </div>
    )
}
