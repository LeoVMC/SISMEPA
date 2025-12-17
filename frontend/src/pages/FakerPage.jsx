import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { User, RefreshCw } from 'lucide-react'

export default function FakerPage() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [quantity, setQuantity] = useState(10)

    const fetchData = async () => {
        setLoading(true)
        try {
            // Using endpoint: https://fakerapi.it/api/v2/persons
            // Params: _quantity, _locale=es_ES
            const response = await axios.get(`https://fakerapi.it/api/v2/persons?_quantity=${quantity}&_locale=es_ES`)
            if (response.data && response.data.data) {
                setData(response.data.data)
            }
        } catch (error) {
            console.error("Error fetching standard data:", error)
            // Fallback since v2 might have slight nuances or downtime, handling gracefully
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <div className="p-6 transition-colors duration-200 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <User className="text-blue-600 dark:text-blue-400" size={32} />
                            Generador de Datos (FakerAPI)
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Demostración de consumo de API externa para generar perfiles de usuarios ficticios en español.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <label htmlFor="qty" className="text-sm font-medium">Cantidad:</label>
                            <input 
                                id="qty"
                                type="number" 
                                min="1" 
                                max="100" 
                                value={quantity} 
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-20 px-3 py-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <button 
                            onClick={fetchData}
                            disabled={loading}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                            {loading ? 'Generando...' : 'Regenerar'}
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {data.map((person, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700 group">
                            <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                                <div className="absolute -bottom-10 left-6 p-1 bg-white dark:bg-gray-800 rounded-full">
                                    <img 
                                        src={person.image || `https://ui-avatars.com/api/?name=${person.firstname}+${person.lastname}`} 
                                        alt="Avatar" 
                                        className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-gray-700 bg-gray-200"
                                        onError={(e) => {
                                            e.target.onerror = null; 
                                            e.target.src = `https://ui-avatars.com/api/?name=${person.firstname}+${person.lastname}`
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="pt-12 p-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                    {person.firstname} {person.lastname}
                                </h3>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex flex-col gap-1">
                                    <span>{person.email}</span>
                                    <span>{person.phone}</span>
                                </div>
                                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold tracking-wider">
                                    <span>{person.address?.country || 'N/A'}</span>
                                    <span>{person.gender}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {!loading && data.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                        No hay datos para mostrar. Intenta regenerar.
                    </div>
                )}
            </div>
        </div>
    )
}
