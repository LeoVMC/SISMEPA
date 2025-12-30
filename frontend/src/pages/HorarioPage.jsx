import React, { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Download, Search, Filter, Loader2, BookOpen, ChevronDown, ArrowRight, GraduationCap, Cpu, Stethoscope, Building2, Gavel, Briefcase, Zap, Calculator, RadioTower } from 'lucide-react'

export default function HorarioPage() {
    // User Data & Role
    const [userData, setUserData] = useState(null)
    const [viewMode, setViewMode] = useState('student') // 'student' | 'master'

    // Student View State
    const [horarioData, setHorarioData] = useState(null)
    const [loading, setLoading] = useState(true)

    // Master View State (Admin/Docente)
    const [availablePrograms, setAvailablePrograms] = useState([])
    const [selectedProgram, setSelectedProgram] = useState(null)
    const [filters, setFilters] = useState({
        // programa removed from filters
        semestre: '1',
        seccion: 'D1'
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

    // Load selectedProgram from sessionStorage on initial mount
    useEffect(() => {
        const sessionProgram = sessionStorage.getItem('horarioSelectedProgram')
        if (sessionProgram) {
            setSelectedProgram(JSON.parse(sessionProgram))
        } else {
            // If no program is stored, and we are in master view, fetch programs to allow selection
            if (viewMode === 'master') {
                fetchPrograms()
            }
        }
    }, [viewMode]) // Depend on viewMode to ensure it runs after viewMode is set

    // Save selectedProgram to sessionStorage when it changes
    useEffect(() => {
        if (selectedProgram) {
            sessionStorage.setItem('horarioSelectedProgram', JSON.stringify(selectedProgram))
        } else {
            sessionStorage.removeItem('horarioSelectedProgram')
        }
    }, [selectedProgram])

    // Fetch Master Horario on Filter Change
    useEffect(() => {
        if (viewMode === 'master' && selectedProgram) {
            fetchMasterHorario()
        }
    }, [selectedProgram, filters.semestre, debouncedSection, viewMode])

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

    // Helper for Program Icons
    const getProgramIcon = (name) => {
        if (!name) return <GraduationCap className="text-blue-600 dark:text-blue-400" size={28} />

        const n = name.toLowerCase()
        if (n.includes('sistema') || n.includes('comput')) return <Cpu className="text-blue-600 dark:text-blue-400" size={28} />
        if (n.includes('enfermer') || n.includes('salud') || n.includes('medicin')) return <Stethoscope className="text-red-500 dark:text-red-400" size={28} />
        if (n.includes('civil') || n.includes('arquitect')) return <Building2 className="text-amber-600 dark:text-amber-400" size={28} />
        if (n.includes('derecho') || n.includes('ley')) return <Gavel className="text-yellow-700 dark:text-yellow-500" size={28} />
        if (n.includes('administra') || n.includes('gerencia')) return <Briefcase className="text-emerald-600 dark:text-emerald-400" size={28} />
        if (n.includes('electric') || n.includes('electron')) return <Zap className="text-yellow-500 dark:text-yellow-300" size={28} />
        if (n.includes('contad') || n.includes('econom')) return <Calculator className="text-cyan-600 dark:text-cyan-400" size={28} />
        if (n.includes('telecom')) return <RadioTower className="text-blue-600 dark:text-blue-400" size={28} />

        return <GraduationCap className="text-blue-600 dark:text-blue-400" size={28} />
    }

    async function fetchMasterHorario() {
        setLoadingMaster(true)
        try {
            const query = new URLSearchParams()
            if (selectedProgram) query.append('programa', selectedProgram.id)
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

        // Helper to convert "HH:MM" to minutes
        const toMinutes = (t) => {
            const [h, m] = t.split(':').map(Number)
            return h * 60 + m
        }

        const currentBlockStart = toMinutes(startTime)
        const currentBlockEnd = currentBlockStart + 45

        // 1. Check if this block is COVERED by a class starting earlier
        // We need to check all classes to see if any of them span OVER this block.
        // A class covers this block if: dia matches, AND start < current, AND end > current
        // BUT we need to be careful about conflicts.
        // If Class A spans over this, and Class B starts here... HTML table can't show both.
        // We will prioritize the SPAN (standard table behavior).
        // So checking coverage first is correct.

        const isCovered = masterHorarioData.some(h => {
            if (h.dia !== diaId) return false
            const hStart = toMinutes(h.hora_inicio)
            const hEnd = toMinutes(h.hora_fin)
            return hStart < currentBlockStart && hEnd > currentBlockStart
        })

        if (isCovered) return 'covered'

        // 2. Check if a class STARTS here
        const startingClasses = masterHorarioData.filter(h => {
            if (h.dia !== diaId) return false
            return toMinutes(h.hora_inicio) === currentBlockStart
        })

        if (startingClasses.length === 0) return null // Let the default empty TD render

        // 3. Render Starting Classes
        // If multiple classes start here (Conflict), we stack them inside the TD.
        // We use the MAX duration for the rowSpan to encompass the longest one.

        let maxRowSpan = 1
        startingClasses.forEach(clase => {
            const hStart = toMinutes(clase.hora_inicio)
            const hEnd = toMinutes(clase.hora_fin)
            const span = Math.max(1, Math.round((hEnd - hStart) / 45))
            if (span > maxRowSpan) maxRowSpan = span
        })

        return (
            <td key={`${diaId}-${bloqueId}`} rowSpan={maxRowSpan} className="p-1 border-r border-gray-200 dark:border-gray-700 h-24 align-top relative">
                <div className="flex flex-col gap-1 h-full w-full">
                    {startingClasses.map((clase, idx) => {
                        const colorClass = getCourseColor(clase.codigo) // Ensure this returns bg/border/text classes string
                        return (
                            <div key={idx} className={`flex-1 w-full p-2 rounded-lg border-l-4 shadow-sm animate-in zoom-in-95 duration-200 flex flex-col justify-between ${clase.estilos?.bg || colorClass.replace('border-', 'border-l-')} ${clase.estilos?.border || ''}`}>
                                {/* Note: master data might not have 'estilos'. We fallback to colorClass */}

                                <div className="flex justify-end items-start mb-1 h-5">
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/50 dark:bg-white/20 dark:text-white">{clase.codigo}</span>
                                </div>
                                <div className="flex-1 flex items-center">
                                    <span className="text-xs font-bold leading-tight line-clamp-3">{clase.asignatura}</span>
                                </div>
                                <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5 flex justify-between items-end gap-2 text-[10px] opacity-80">
                                    <div className="flex flex-col gap-0.5">
                                        <div className="font-semibold">{clase.seccion}</div>
                                        <div className="truncate max-w-[80px]">{clase.docente.split(' ')[0]}</div>
                                    </div>
                                    {clase.aula && (
                                        <div className="flex items-center gap-1 text-[10px] bg-white/50 dark:bg-white/20 dark:text-white px-1.5 py-0.5 rounded">
                                            <MapPin size={10} /><span>{clase.aula}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </td>
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

    // 1. Program Selection View
    if (!selectedProgram) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col items-center justify-center p-8 mb-4">
                    <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mb-4">
                        <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 text-center">
                        Explorador de Horarios
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-center">
                        Selecciona un programa académico para gestionar su horario
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availablePrograms.map(prog => (
                        <div
                            key={prog.id}
                            onClick={() => {
                                setSelectedProgram(prog)
                                sessionStorage.setItem('horarioSelectedProgram', JSON.stringify(prog))
                            }}
                            className="group relative overflow-hidden bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/10 p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-500 shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 pr-2">
                                    {prog.nombre_programa}
                                </h3>
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full mt-1 shrink-0">
                                    <ArrowRight size={16} className="text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 pl-1 relative z-10">
                                <p>Duración: <span className="font-semibold text-gray-700 dark:text-gray-300">{prog.duracion_anios} años</span></p>
                                <p>Título: <span className="font-semibold text-gray-700 dark:text-gray-300">{prog.titulo_otorgado}</span></p>
                            </div>

                            {/* Diagonal Stripe Decoration */}
                            <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-gray-200 dark:bg-gray-800 rotate-45 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20">
                                <div className="transform -rotate-45 -translate-x-7 -translate-y-0 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                                    {React.cloneElement(getProgramIcon(prog.nombre_programa), { size: 24, className: "text-gray-600 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" })}
                                </div>
                            </div>
                        </div>
                    ))}
                    {availablePrograms.length === 0 && (
                        <div className="col-span-full p-10 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500">
                            <Loader2 className="animate-spin mx-auto mb-3 text-blue-500" />
                            Cargando programas...
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // 2. Schedule View (Filtered by Selected Program)
    return (
        <div className="space-y-6 max-w-full mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        {React.cloneElement(getProgramIcon(selectedProgram.nombre_programa), { size: 32, className: "text-blue-600 dark:text-blue-400" })}
                        {selectedProgram.nombre_programa}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Visualización global y filtrado de secciones académicas
                    </p>
                </div>
                <button
                    onClick={() => {
                        setSelectedProgram(null)
                        sessionStorage.removeItem('horarioSelectedProgram')
                        setMasterHorarioData([])
                    }}
                    className="group flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300"
                >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">Cambiar Carrera</span>
                    <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                        <ArrowRight size={14} className="text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                {/* Removed Carrera Selector */}
                <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">Semestre</label>
                    <select
                        className="w-full text-sm border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent py-2.5 px-3"
                        value={filters.semestre}
                        onChange={e => setFilters({ ...filters, semestre: e.target.value })}
                    >
                        {/* Removed 'Todos', defaulting to I */}
                        {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].map((roman, idx) => (
                            <option key={idx + 1} value={idx + 1}>{roman} SEMESTRE</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">Sección</label>
                    <select
                        className="w-full text-sm border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent py-2.5 px-3"
                        value={filters.seccion}
                        onChange={e => setFilters({ ...filters, seccion: e.target.value })}
                    >
                        {Array.from({ length: 10 }, (_, i) => `D${i + 1}`).map(sec => (
                            <option key={sec} value={sec}>{sec}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <div>
                        {/* Loading indicator removed */}
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse table-fixed">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                <th className="p-3 border-b border-r border-gray-200 dark:border-gray-700 sticky left-0 bg-gray-50 dark:bg-gray-800 z-10 w-24">Bloque</th>
                                {dias.map(dia => (
                                    <th key={dia.id} className="p-3 border-b border-r border-gray-200 dark:border-gray-700 text-center font-bold">
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
                                    {dias.map((dia) => {
                                        const cell = renderCell(dia.id, bloque.id)
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

            {/* Lista Inferior (Detalle de Asignaturas) - Igual que Estudiante pero usando masterHorarioData */}
            {masterHorarioData.length > 0 && (
                <div className="p-6 mt-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">Detalle de Asignaturas (Filtrado)</h3>
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
                                {[...new Map(masterHorarioData.map(item => [item.codigo, item])).values()].map((item, idx) => (
                                    <tr key={item.codigo} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <td className="p-2 font-mono text-gray-400">{idx + 1}</td>
                                        <td className="p-2 font-mono font-bold text-gray-700 dark:text-gray-300">{item.codigo}</td>
                                        <td className="p-2 font-medium text-gray-800 dark:text-gray-200">{item.asignatura}</td>
                                        <td className="p-2 text-gray-600 dark:text-gray-400 uppercase">{item.docente || 'SIN ASIGNAR'}</td>
                                        <td className="p-2 text-center font-bold text-blue-600 dark:text-blue-400">{item.seccion}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

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
