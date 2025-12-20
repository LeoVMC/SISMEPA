import React, { useState, useEffect } from 'react'
import { BookOpen, Users, Save, CheckCircle, AlertCircle, ChevronDown, ChevronRight, Loader2 } from 'lucide-react'

export default function CalificacionesPage() {
    const [secciones, setSecciones] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState(null)
    const [expandedSeccion, setExpandedSeccion] = useState(null)
    const [editedNotas, setEditedNotas] = useState({}) // { detalle_id: { nota1, nota2, nota3, nota4 } }

    const token = localStorage.getItem('apiToken') || ''

    useEffect(() => {
        fetchMisSecciones()
    }, [])

    const fetchMisSecciones = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/secciones/mis-secciones/`, {
                headers: { Authorization: `Token ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setSecciones(data)
            } else {
                const err = await res.json()
                setMessage({ type: 'error', text: err.error || 'Error al cargar secciones.' })
            }
        } catch (e) {
            setMessage({ type: 'error', text: 'Error de conexión.' })
        } finally {
            setLoading(false)
        }
    }

    const handleNotaChange = (detalleId, campo, valor) => {
        // Validar que sea número entre 1 y 20
        let numVal = valor === '' ? null : parseFloat(valor)
        if (numVal !== null && (numVal < 1 || numVal > 20)) {
            return // No permitir valores fuera de rango
        }

        setEditedNotas(prev => ({
            ...prev,
            [detalleId]: {
                ...prev[detalleId],
                [campo]: numVal
            }
        }))
    }

    const getNotaValue = (estudiante, campo) => {
        const edited = editedNotas[estudiante.detalle_id]
        if (edited && edited[campo] !== undefined) {
            return edited[campo]
        }
        return estudiante[campo]
    }

    const handleGuardarNotas = async (seccion) => {
        setSaving(true)
        setMessage(null)

        const estudiantesConCambios = seccion.estudiantes.filter(est => editedNotas[est.detalle_id])

        if (estudiantesConCambios.length === 0) {
            setMessage({ type: 'error', text: 'No hay cambios para guardar.' })
            setSaving(false)
            return
        }

        let errores = []
        let exitos = 0

        for (const est of estudiantesConCambios) {
            const notas = editedNotas[est.detalle_id]
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/secciones/${seccion.id}/calificar/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`
                    },
                    body: JSON.stringify({
                        detalle_id: est.detalle_id,
                        nota1: notas.nota1 !== undefined ? notas.nota1 : est.nota1,
                        nota2: notas.nota2 !== undefined ? notas.nota2 : est.nota2,
                        nota3: notas.nota3 !== undefined ? notas.nota3 : est.nota3,
                        nota4: notas.nota4 !== undefined ? notas.nota4 : est.nota4
                    })
                })
                if (res.ok) {
                    exitos++
                } else {
                    const err = await res.json()
                    errores.push(`${est.nombre}: ${err.error}`)
                }
            } catch (e) {
                errores.push(`${est.nombre}: Error de conexión`)
            }
        }

        // Limpiar cambios guardados
        const newEditedNotas = { ...editedNotas }
        estudiantesConCambios.forEach(est => delete newEditedNotas[est.detalle_id])
        setEditedNotas(newEditedNotas)

        // Refrescar datos
        await fetchMisSecciones()

        if (errores.length > 0) {
            setMessage({ type: 'error', text: `Errores: ${errores.join(', ')}` })
        } else {
            setMessage({ type: 'success', text: `${exitos} calificación(es) guardada(s) exitosamente.` })
        }
        setSaving(false)
    }

    const calcularPromedio = (est) => {
        const n1 = getNotaValue(est, 'nota1')
        const n2 = getNotaValue(est, 'nota2')
        const n3 = getNotaValue(est, 'nota3')
        const n4 = getNotaValue(est, 'nota4')
        const notas = [n1, n2, n3, n4].filter(n => n !== null && n !== undefined)
        if (notas.length === 4) {
            return (notas.reduce((a, b) => a + b, 0) / 4).toFixed(2)
        }
        return '--'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando secciones...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Carga de Calificaciones</h1>

            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                    {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {message.text}
                </div>
            )}

            {secciones.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-8 rounded-lg text-center">
                    <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500 dark:text-gray-400">No tienes secciones asignadas.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {secciones.map(seccion => (
                        <div key={seccion.id} className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg overflow-hidden shadow-sm">
                            {/* Header de sección */}
                            <button
                                onClick={() => setExpandedSeccion(expandedSeccion === seccion.id ? null : seccion.id)}
                                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                                        <BookOpen className="text-blue-600 dark:text-blue-400" size={20} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-gray-800 dark:text-white">
                                            {seccion.asignatura_nombre}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {seccion.asignatura_codigo} · Sección {seccion.codigo_seccion} · {seccion.programa}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                        <Users size={16} />
                                        {seccion.total_estudiantes} estudiantes
                                    </span>
                                    {expandedSeccion === seccion.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                </div>
                            </button>

                            {/* Contenido expandido */}
                            {expandedSeccion === seccion.id && (
                                <div className="p-4">
                                    {seccion.estudiantes.length === 0 ? (
                                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                                            No hay estudiantes inscritos en esta sección.
                                        </p>
                                    ) : (
                                        <>
                                            {/* Tabla de calificaciones */}
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b dark:border-gray-700">
                                                            <th className="text-left p-2 text-gray-600 dark:text-gray-400">Estudiante</th>
                                                            <th className="text-left p-2 text-gray-600 dark:text-gray-400">Cédula</th>
                                                            <th className="text-center p-2 text-gray-600 dark:text-gray-400">Nota 1</th>
                                                            <th className="text-center p-2 text-gray-600 dark:text-gray-400">Nota 2</th>
                                                            <th className="text-center p-2 text-gray-600 dark:text-gray-400">Nota 3</th>
                                                            <th className="text-center p-2 text-gray-600 dark:text-gray-400">Nota 4</th>
                                                            <th className="text-center p-2 text-gray-600 dark:text-gray-400">Promedio</th>
                                                            <th className="text-center p-2 text-gray-600 dark:text-gray-400">Estado</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {seccion.estudiantes.map(est => {
                                                            const promedio = calcularPromedio(est)
                                                            const aprobado = promedio !== '--' && parseFloat(promedio) >= 10

                                                            return (
                                                                <tr key={est.detalle_id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                                    <td className="p-2 font-medium text-gray-800 dark:text-gray-200">{est.nombre}</td>
                                                                    <td className="p-2 text-gray-600 dark:text-gray-400">{est.cedula}</td>
                                                                    {['nota1', 'nota2', 'nota3', 'nota4'].map(campo => (
                                                                        <td key={campo} className="p-2 text-center">
                                                                            <input
                                                                                type="number"
                                                                                min="1"
                                                                                max="20"
                                                                                step="0.01"
                                                                                value={getNotaValue(est, campo) ?? ''}
                                                                                onChange={(e) => handleNotaChange(est.detalle_id, campo, e.target.value)}
                                                                                className="w-16 text-center border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                placeholder="--"
                                                                            />
                                                                        </td>
                                                                    ))}
                                                                    <td className={`p-2 text-center font-bold ${promedio !== '--' ? (aprobado ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400') : 'text-gray-400'}`}>
                                                                        {promedio}
                                                                    </td>
                                                                    <td className="p-2 text-center">
                                                                        {est.estatus === 'CURSANDO' ? (
                                                                            <span className="px-2 py-1 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">Cursando</span>
                                                                        ) : est.estatus === 'APROBADO' ? (
                                                                            <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">Aprobado</span>
                                                                        ) : (
                                                                            <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">Reprobado</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Botón guardar */}
                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    onClick={() => handleGuardarNotas(seccion)}
                                                    disabled={saving || !Object.keys(editedNotas).some(id => seccion.estudiantes.find(e => e.detalle_id === parseInt(id)))}
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                                                >
                                                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                                    Guardar Calificaciones
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
