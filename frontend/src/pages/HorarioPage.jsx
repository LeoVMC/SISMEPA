import React, { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Download, Search, Filter, Loader2, BookOpen } from 'lucide-react'

export default function HorarioPage() {
    // User Data & Role
    const [userData, setUserData] = useState(null)
    const [viewMode, setViewMode] = useState('student') // 'student' | 'master'

    // Student View State
    const [horarioData, setHorarioData] = useState(null)
    const [loading, setLoading] = useState(true)

    // Master View State (Admin/Docente)
    const [availablePrograms, setAvailablePrograms] = useState([])
    const [filters, setFilters] = useState({
        programa: '',
        semestre: '',
        seccion: ''
    })
    const [masterHorarioData, setMasterHorarioData] = useState([])
    const [loadingMaster, setLoadingMaster] = useState(false)
    const [debouncedSection, setDebouncedSection] = useState('')

    const token = localStorage.getItem('apiToken')

    useEffect(() => {
        const storedUser = localStorage.getItem('userData')
        if (storedUser) {
            const parsed = JSON.parse(storedUser)
            setUserData(parsed)

            // Determine initial mode
            const isAdmin = parsed.is_superuser || (parsed.groups && parsed.groups.some(g => g.name === 'Administrador'))
            const isDocente = parsed.groups && parsed.groups.some(g => g.name === 'Docente')

            if (isAdmin || isDocente) {
                setViewMode('master')
                fetchPrograms()
            } else {
                fetchStudentHorario()
            }
        } else {
            fetchStudentHorario()
        }
    }, [])

    // Debounce Section Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSection(filters.seccion)
        }, 500)
        return () => clearTimeout(timer)
    }, [filters.seccion])

    // Fetch Master Horario on Filter Change
    useEffect(() => {
        if (viewMode === 'master') {
            fetchMasterHorario()
        }
    }, [filters.programa, filters.semestre, debouncedSection, viewMode])

    const fetchPrograms = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/programas/`, {
                headers: { Authorization: `Token ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setAvailablePrograms(data)
            }
        } catch (e) {
            console.error("Error loading programs", e)
        }
    }

    const fetchStudentHorario = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/estudiantes/mi-horario/`, {
                headers: { Authorization: `Token ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setHorarioData(data)
            } else {
                setHorarioData(null)
            }
        } catch (e) {
            console.error("Error fetching horario", e)
        } finally {
            setLoading(false)
        }
    }

    const fetchMasterHorario = async () => {
        setLoadingMaster(true)
        try {
            const query = new URLSearchParams()
            if (filters.programa) query.append('programa', filters.programa)
            if (filters.semestre) query.append('semestre', filters.semestre)
            if (debouncedSection) query.append('seccion', debouncedSection)

            const res = await fetch(`${import.meta.env.VITE_API_URL}/secciones/master-horario/?${query.toString()}`, {
                headers: { Authorization: `Token ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setMasterHorarioData(data)
            }
        } catch (e) {
            console.error("Error fetching master horario", e)
        } finally {
            setLoadingMaster(false)
        }
    }

    const handleDownload = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/estudiantes/descargar-horario/`, {
                headers: { Authorization: `Token ${token}` }
            })
            if (res.ok) {
                const blob = await res.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `Horario_${horarioData?.cedula || 'Estudiante'}.xlsx`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            }
        } catch (error) {
            console.error("Error de red al descargar", error)
        }
    }

    // Shared Definitions
    const bloques = [
        { id: 1, hora: "07:00 - 07:45" },
        { id: 2, hora: "07:45 - 08:30" },
        { id: 3, hora: "08:30 - 09:15" },
        { id: 4, hora: "09:15 - 10:00" },
        { id: 5, hora: "10:00 - 10:45" },
        { id: 6, hora: "10:45 - 11:30" },
        { id: 7, hora: "11:30 - 12:15" },
        { id: 8, hora: "12:15 - 01:00" },
        { id: 9, hora: "01:00 - 01:45" },
        { id: 10, hora: "01:45 - 02:30" },
        { id: 11, hora: "02:30 - 03:15" },
        { id: 12, hora: "03:15 - 04:00" },
        { id: 13, hora: "04:00 - 04:45" },
        { id: 14, hora: "04:45 - 05:30" },
    ]

    const dias = [
        { id: 1, nombre: "LUNES" },
        { id: 2, nombre: "MARTES" },
        { id: 3, nombre: "MIÉRCOLES" },
        { id: 4, nombre: "JUEVES" },
        { id: 5, nombre: "VIERNES" },
        { id: 6, nombre: "SÁBADO" },
    ]

    // Color Palette for Master View
    const getCourseColor = (courseCode) => {
        const colors = [
            'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
            'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
            'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200',
            'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
            'bg-rose-100 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200',
            'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200',
        ]
        let hash = 0
        if (!courseCode) return colors[0]
        for (let i = 0; i < courseCode.length; i++) hash = courseCode.charCodeAt(i) + ((hash << 5) - hash)
        return colors[Math.abs(hash) % colors.length]
    }

    const renderCell = (diaId, bloqueId) => {
        const timeMap = {
            1: "07:00", 2: "07:45", 3: "08:30", 4: "09:15", 5: "10:00", 6: "10:45",
            7: "11:30", 8: "12:15", 9: "13:00", 10: "13:45", 11: "14:30",
            12: "15:15", 13: "16:00", 14: "16:45"
        }
        const startTime = timeMap[bloqueId]
        const classes = masterHorarioData.filter(h => h.dia === diaId && h.hora_inicio === startTime)

        if (classes.length === 0) return null

        return (
            <div className="flex flex-col gap-1 w-full h-full">
                {classes.map((clase, idx) => {
                    const colorClass = getCourseColor(clase.codigo)
                    return (
                        <div key={idx} className={`p-1 rounded text-xs border ${colorClass} overflow-hidden shadow-sm`}>
                            <div className="font-bold truncate" title={clase.asignatura}>
                                {clase.asignatura}
                            </div>
                            <div className="flex justify-between items-center opacity-75 text-[10px]">
                                <span className="font-mono bg-white/50 dark:bg-white/20 px-1 rounded">{clase.seccion}</span>
                                {clase.aula && <span className="flex items-center gap-0.5"><MapPin size={8} />{clase.aula}</span>}
                            </div>
                            <div className="text-[9px] opacity-75 truncate mt-0.5">
                                {clase.docente}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    // --- RENDER STUDENT VIEW ---
    if (viewMode === 'student') {
        if (loading) return <div className="p-8 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2" />Cargando horario...</div>
        if (!horarioData) return <div className="p-8 text-center text-gray-500">No hay información de horario disponible.</div>

        // Mapeo Student Logic (RowSpan)
        const studentRenderCell = (diaId, bloqueId) => {
            const timeMap = {
                1: "07:00", 2: "07:45", 3: "08:30", 4: "09:15", 5: "10:00", 6: "10:45",
                7: "11:30", 8: "12:15", 9: "13:00", 10: "13:45", 11: "14:30",
                12: "15:15", 13: "16:00", 14: "16:45"
            }
            const startTime = timeMap[bloqueId]

            // Check coverage
            if (horarioData.horario.some(h => h.dia === diaId && h.hora_inicio < startTime && h.hora_fin > startTime)) {
                return 'covered'
            }

            const clase = horarioData.horario.find(h => h.dia === diaId && h.hora_inicio === startTime)
            if (!clase) return null

            // Calc RowSpan
            const timeToMinutes = (t) => {
                const [h, m] = t.split(':').map(Number)
                return h * 60 + m
            }
            const startMins = timeToMinutes(clase.hora_inicio)
            const endMins = timeToMinutes(clase.hora_fin)
            const rowSpan = Math.max(1, Math.round((endMins - startMins) / 45))

            return (
                <td key={diaId} rowSpan={rowSpan} className="p-1 border-r border-gray-200 dark:border-gray-700 h-24 align-top relative">
                    <div className={`h-full w-full p-2 rounded-lg border-l-4 shadow-sm animate-in zoom-in-95 duration-200 flex flex-col justify-between ${clase.estilos.bg} ${clase.estilos.border}`}>
                        <div className="flex justify-end items-start mb-1 h-5">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/50 dark:bg-white/20 dark:text-white ${clase.estilos.text}`}>{clase.codigo}</span>
                        </div>
                        <div className="flex-1 flex items-center">
                            <span className={`text-xs font-bold leading-tight line-clamp-3 ${clase.estilos.text}`}>{clase.asignatura}</span>
                        </div>
                        <div className={`mt-2 pt-2 border-t border-black/5 dark:border-white/5 flex justify-between items-end gap-2 text-[10px] opacity-80 ${clase.estilos.text}`}>
                            <div className="flex flex-col gap-0.5">
                                <div className="font-semibold">{clase.seccion}</div>
                                <div className="truncate max-w-[80px]">{clase.docente}</div>
                            </div>
                            {clase.aula && (
                                <div className="flex items-center gap-1 text-[10px] bg-white/50 dark:bg-white/20 dark:text-white px-1.5 py-0.5 rounded">
                                    <MapPin size={10} /><span>{clase.aula}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </td>
            )
        }

        return (
            <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Horario de Clases</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {horarioData.periodo} · {horarioData.estudiante}
                        </p>
                    </div>
                    <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm">
                        <Download size={18} /><span>Descargar Excel</span>
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                    <th className="p-3 border-b border-r border-gray-200 dark:border-gray-700 sticky left-0 bg-gray-50 dark:bg-gray-800 z-10 w-24">Bloque</th>
                                    {dias.map(dia => <th key={dia.id} className="p-3 border-b border-r border-gray-200 dark:border-gray-700 min-w-[140px] text-center font-bold">{dia.nombre}</th>)}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {bloques.map((bloque) => (
                                    <tr key={bloque.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 font-mono text-xs text-center text-gray-500 dark:text-gray-400">
                                            <div className="font-bold text-gray-700 dark:text-gray-300">BLOQUE {bloque.id}</div>
                                            <div>{bloque.hora}</div>
                                        </td>
                                        {dias.map((dia) => {
                                            const cell = studentRenderCell(dia.id, bloque.id)
                                            if (cell === 'covered') return null
                                            if (cell) return cell
                                            return <td key={dia.id} className="p-1 border-r border-gray-200 dark:border-gray-700 h-24 align-top relative"></td>
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Leyenda */}
                <div className="p-6 mt-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">Detalle de Asignaturas</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <th className="p-2 text-left font-semibold">N°</th>
                                    <th className="p-2 text-left font-semibold">CÓDIGO</th>
                                    <th className="p-2 text-left font-semibold">ASIGNATURA</th>
                                    <th className="p-2 text-left font-semibold">DOCENTE</th>
                                    <th className="p-2 text-center font-semibold">SECCIÓN</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {[...new Map(horarioData.horario.map(item => [item.codigo, item])).values()].map((item, idx) => (
                                    <tr key={item.codigo} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <td className="p-2 font-mono text-gray-400">{idx + 1}</td>
                                        <td className="p-2 font-mono font-bold text-gray-700 dark:text-gray-300">{item.codigo}</td>
                                        <td className="p-2 font-medium text-gray-800 dark:text-gray-200">{item.asignatura}</td>
                                        <td className="p-2 text-gray-600 dark:text-gray-400 uppercase">{item.docente}</td>
                                        <td className="p-2 text-center font-bold text-blue-600 dark:text-blue-400">{item.seccion}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }

    // --- MASTER VIEW (ADMIN/DOCENTE) ---
    return (
        <div className="space-y-6 max-w-full mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Search className="w-6 h-6 text-blue-500" />
                        Explorador de Horarios
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Visualización global y filtrado de secciones académicas
                    </p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">Carrera</label>
                    <div className="relative">
                        <select
                            className="w-full text-sm border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent py-2.5"
                            value={filters.programa}
                            onChange={e => setFilters({ ...filters, programa: e.target.value })}
                        >
                            <option value="">Todas las Carreras</option>
                            {availablePrograms.map(prog => (
                                <option key={prog.id} value={prog.id}>{prog.nombre_programa}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">Semestre</label>
                    <select
                        className="w-full text-sm border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent py-2.5"
                        value={filters.semestre}
                        onChange={e => setFilters({ ...filters, semestre: e.target.value })}
                    >
                        <option value="">Todos</option>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(s => (
                            <option key={s} value={s}>{s}º Semestre</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">Sección</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Ej: D1, N1..."
                            className="w-full text-sm border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent py-2.5 pl-9"
                            value={filters.seccion}
                            onChange={e => setFilters({ ...filters, seccion: e.target.value })}
                        />
                        <Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    </div>
                </div>
                <div>
                    <div className={`px-4 py-2.5 rounded-lg text-sm font-medium border w-full text-center transition-all ${loadingMaster ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                        {loadingMaster ? (
                            <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin w-4 h-4" /> Actualizando...</span>
                        ) : (
                            <span>{masterHorarioData.length > 0 ? `${masterHorarioData.length} bloques encontrados` : 'Sin resultados'}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                <th className="p-3 border-b border-r border-gray-200 dark:border-gray-700 sticky left-0 bg-gray-50 dark:bg-gray-800 z-10 w-24">Bloque</th>
                                {dias.map(dia => (
                                    <th key={dia.id} className="p-3 border-b border-r border-gray-200 dark:border-gray-700 min-w-[140px] text-center font-bold">
                                        {dia.nombre}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {bloques.map((bloque) => (
                                <tr key={bloque.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="p-2 border-r border-gray-200 dark:border-gray-700 font-mono text-xs text-center text-gray-500 dark:text-gray-400">
                                        <div className="font-bold text-gray-700 dark:text-gray-300">BLOQUE {bloque.id}</div>
                                        <div>{bloque.hora}</div>
                                    </td>
                                    {dias.map((dia) => (
                                        <td key={dia.id} className="p-1 border-r border-gray-200 dark:border-gray-700 h-24 align-top relative">
                                            {renderCell(dia.id, bloque.id)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #horario-print, #horario-print * { visibility: visible; }
                    #horario-print { position: absolute; left: 0; top: 0; width: 100%; }
                }
            `}</style>
        </div>
    )
}
