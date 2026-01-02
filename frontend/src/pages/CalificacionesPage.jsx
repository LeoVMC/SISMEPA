import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { BookOpen, Users, Save, CheckCircle, AlertCircle, ChevronDown, ChevronRight, Loader2, Download, UserPlus, X, Trash2, Search, Filter, GraduationCap, ArrowRight, Cpu, Stethoscope, Building2, Gavel, Briefcase, Zap, Calculator, RadioTower } from 'lucide-react'
import axios from 'axios'

export default function CalificacionesPage() {
    const [secciones, setSecciones] = useState([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState(null)
    const [expandedSeccion, setExpandedSeccion] = useState(null)
    const [expandedSubjects, setExpandedSubjects] = useState({}) // { codigo: boolean }
    const [editedNotas, setEditedNotas] = useState({})

    // Estado para modal de inscripción
    const [inscripcionModal, setInscripcionModal] = useState(null) // seccion object or null
    const [estudiantesDisponibles, setEstudiantesDisponibles] = useState([])
    const [selectedEstudiante, setSelectedEstudiante] = useState('')
    const [inscribiendo, setInscribiendo] = useState(false)
    const [busquedaEstudiante, setBusquedaEstudiante] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [filterSemestre, setFilterSemestre] = useState('')

    const [availablePrograms, setAvailablePrograms] = useState([])
    const [selectedProgram, setSelectedProgram] = useState(null)
    const [userData, setUserData] = useState(null)

    const token = localStorage.getItem('apiToken') || ''

    useEffect(() => {
        const storedUser = localStorage.getItem('userData')
        if (storedUser) setUserData(JSON.parse(storedUser))

        const sessionProgram = sessionStorage.getItem('calificacionesSelectedProgram')
        if (sessionProgram) {
            setSelectedProgram(JSON.parse(sessionProgram))
        } else {
            fetchPrograms()
        }
    }, [])

    useEffect(() => {
        if (selectedProgram) {
            sessionStorage.setItem('calificacionesSelectedProgram', JSON.stringify(selectedProgram))
        } else {
            sessionStorage.removeItem('calificacionesSelectedProgram')
        }
    }, [selectedProgram])

    useEffect(() => {
        if (selectedProgram) {
            fetchMisSecciones()
        }
    }, [selectedProgram])

    async function fetchPrograms() {
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

    async function fetchMisSecciones() {
        if (!selectedProgram) return
        setLoading(true)
        try {
            // Append program filter
            const res = await fetch(`${import.meta.env.VITE_API_URL}/secciones/mis-secciones/?programa=${selectedProgram.id}`, {
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

    const fetchEstudiantesDisponibles = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/estudiantes/`, {
                headers: { Authorization: `Token ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setEstudiantesDisponibles(data.results || data)
            }
        } catch (e) {
            console.error('Error fetching estudiantes', e)
        }
    }

    const handleOpenInscripcionModal = (seccion) => {
        setInscripcionModal(seccion)
        setSelectedEstudiante('')
        setBusquedaEstudiante('')
        // Obtener todos los estudiantes disponibles
        fetchEstudiantesDisponibles()
    }

    const handleCloseInscripcionModal = () => {
        setInscripcionModal(null)
        // Solo limpiar si es error, para mantener mensajes de éxito visibles en dashboard
        if (message?.type === 'error') {
            setMessage(null)
        }
    }

    const handleInscribirEstudiante = async () => {
        if (!selectedEstudiante || !inscripcionModal) return
        setInscribiendo(true)
        setMessage(null)

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/secciones/${inscripcionModal.id}/inscribir-estudiante/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`
                },
                body: JSON.stringify({ estudiante_id: selectedEstudiante })
            })

            const data = await res.json()
            if (res.ok) {
                setMessage({ type: 'success', text: data.status || 'Estudiante inscrito exitosamente.' })
                setInscripcionModal(null)
                fetchMisSecciones()
            } else {
                setMessage({ type: 'error', text: data.error || 'Error al inscribir.' })
            }
        } catch (e) {
            setMessage({ type: 'error', text: 'Error de conexión.' })
        } finally {
            setInscribiendo(false)
        }
    }

    const handleDescargarListado = (seccionId) => {
        // Abrir URL de descarga en nueva pestaña
        const url = `${import.meta.env.VITE_API_URL}/secciones/${seccionId}/descargar-listado/`
        window.open(url + `?token=${token}`, '_blank')
    }

    const handleEliminarEstudiante = async (seccionId, estudianteId) => {
        if (!confirm('¿Estás seguro de eliminar este estudiante de la sección? Esta acción eliminará sus notas y es irreversible.')) return
        setMessage(null)

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/secciones/${seccionId}/desinscribir-estudiante/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`
                },
                body: JSON.stringify({ estudiante_id: estudianteId })
            })

            const data = await res.json()
            if (res.ok) {
                setMessage({ type: 'success', text: 'Estudiante eliminado exitosamente.' })
                // Esperar un momento para que el usuario vea el mensaje y luego recargar
                setTimeout(() => fetchMisSecciones(), 1000)
            } else {
                setMessage({ type: 'error', text: data.error || 'Error al eliminar estudiante.' })
            }
        } catch (e) {
            setMessage({ type: 'error', text: 'Error de conexión.' })
        }
    }

    const handleNotaChange = (detalleId, campo, valor) => {
        let numVal = valor === '' ? null : parseFloat(valor)
        if (numVal !== null && (numVal < 1 || numVal > 20)) {
            return
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

        const newEditedNotas = { ...editedNotas }
        estudiantesConCambios.forEach(est => delete newEditedNotas[est.detalle_id])
        setEditedNotas(newEditedNotas)

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

    // Obtener IDs de estudiantes ya inscritos en la sección actual
    const estudiantesInscritos = inscripcionModal?.estudiantes?.map(e => e.estudiante_id) || []

    // Filtrar estudiantes por búsqueda y excluir ya inscritos
    const estudiantesFiltrados = estudiantesDisponibles.filter(est => {
        // Excluir si ya está inscrito
        if (estudiantesInscritos.includes(est.id)) return false

        const searchLower = busquedaEstudiante.toLowerCase()
        const nombre = est.nombre_completo || `${est.usuario?.first_name} ${est.usuario?.last_name}` || ''
        return nombre.toLowerCase().includes(searchLower) || est.cedula?.toLowerCase().includes(searchLower)
    })

    const handleDownloadListado = async (seccionId, asignaturaCodigo, seccionCodigo) => {
        try {
            const token = localStorage.getItem('apiToken')
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/secciones/${seccionId}/descargar-listado/`, {
                headers: { Authorization: `Token ${token}` },
                responseType: 'blob',
            })

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `Listado_${asignaturaCodigo}_${seccionCodigo}.xlsx`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (error) {
            console.error('Error descargando listado:', error)
            alert('Error al descargar el listado.')
        }
    }

    // Lógica de búsqueda y filtrado
    const uniqueSemesters = [...new Set(secciones.map(s => s.semestre).filter(Boolean))].sort((a, b) => a - b)

    const filteredSecciones = secciones.filter(seccion => {
        const term = (searchTerm || '').toLowerCase()
        const matchesSearch =
            seccion.asignatura_nombre.toLowerCase().includes(term) ||
            seccion.asignatura_codigo.toLowerCase().includes(term) ||
            seccion.codigo_seccion.toLowerCase().includes(term) ||
            (seccion.programa || '').toLowerCase().includes(term)

        const matchesSemestre = filterSemestre ? seccion.semestre === parseInt(filterSemestre) : true


        return matchesSearch && matchesSemestre
    })

    // Agrupar secciones por asignatura
    const groupedSecciones = React.useMemo(() => {
        const groups = {}
        filteredSecciones.forEach(sec => {
            if (!groups[sec.asignatura_codigo]) {
                groups[sec.asignatura_codigo] = {
                    codigo: sec.asignatura_codigo,
                    nombre: sec.asignatura_nombre,
                    secciones: []
                }
            }
            groups[sec.asignatura_codigo].secciones.push(sec)
        })

        // Convert to array and sort sections internally
        const result = Object.values(groups)
        result.forEach(group => {
            group.secciones.sort((a, b) => {
                return a.codigo_seccion.localeCompare(b.codigo_seccion, undefined, { numeric: true, sensitivity: 'base' })
            })
        })
        return result
    }, [filteredSecciones])

    const toggleSubject = (codigo) => {
        setExpandedSubjects(prev => ({
            ...prev,
            [codigo]: !prev[codigo]
        }))
    }

    const shouldShowTeacher = (subjectName) => {
        const name = (subjectName || '').toLowerCase()
        return !name.includes('pasantía') &&
            !name.includes('trabajo especial de grado') &&
            !name.includes('servicio comunitario')
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

    // 1. Program Selection View
    if (!selectedProgram) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col items-center justify-center p-8 mb-4">
                    <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mb-4">
                        <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 text-center">
                        Carga de Calificaciones
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-center">
                        Selecciona un programa académico para gestionar las calificaciones
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availablePrograms.map(prog => (
                        <div
                            key={prog.id}
                            onClick={() => {
                                setSelectedProgram(prog)
                                sessionStorage.setItem('calificacionesSelectedProgram', JSON.stringify(prog))
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        {React.cloneElement(getProgramIcon(selectedProgram.nombre_programa), { size: 32, className: "text-blue-600 dark:text-blue-400" })}
                        {selectedProgram.nombre_programa}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Gestión de calificaciones por sección
                    </p>
                </div>
                <button
                    onClick={() => {
                        setSelectedProgram(null)
                        sessionStorage.removeItem('calificacionesSelectedProgram')
                        setSecciones([])
                    }}
                    className="group flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300"
                >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">Cambiar Carrera</span>
                    <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                        <ArrowRight size={14} className="text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                </button>
            </div>

            {
                message && (
                    <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                        {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        {message.text}
                    </div>
                )
            }

            {/* Barra de Búsqueda y Filtros */}
            {
                secciones.length > 0 && (
                    <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-800 shadow-sm">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por materia, código, sección..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2 min-w-[200px]">
                            <Filter className="text-gray-400" size={18} />
                            <select
                                value={filterSemestre}
                                onChange={(e) => setFilterSemestre(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option value="">Todos los semestres</option>
                                {uniqueSemesters.map(sem => (
                                    <option key={sem} value={sem}>Semestre {sem}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )
            }

            {
                secciones.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-8 rounded-lg text-center">
                        <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-500 dark:text-gray-400">No tienes secciones asignadas.</p>
                    </div>
                ) : filteredSecciones.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-800">
                        <Search className="mx-auto text-gray-300 mb-3" size={48} />
                        <p className="text-gray-500 dark:text-gray-400">No se encontraron resultados para su búsqueda.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setFilterSemestre('') }}
                            className="mt-4 text-blue-600 hover:underline text-sm"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {groupedSecciones.map(subject => (
                            <div key={subject.codigo} className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg overflow-hidden shadow-sm">
                                {/* Nivel 1: Asignatura */}
                                <button
                                    onClick={() => toggleSubject(subject.codigo)}
                                    className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                                            {React.cloneElement(getProgramIcon(subject.nombre), { size: 24, className: "text-blue-600 dark:text-blue-400" })}
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                                {subject.nombre}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {subject.codigo} · {subject.secciones.length} secciones
                                            </p>
                                        </div>
                                    </div>
                                    {expandedSubjects[subject.codigo] ? <ChevronDown size={20} className="text-gray-400 dark:text-gray-200" /> : <ChevronRight size={20} className="text-gray-400 dark:text-gray-200" />}
                                </button>

                                {/* Nivel 2: Lista de Secciones (Sub-lista desplegable) */}
                                {expandedSubjects[subject.codigo] && (
                                    <div className="p-2 bg-gray-50/50 dark:bg-gray-800/50 space-y-2">
                                        {subject.secciones.map(seccion => (
                                            <div key={seccion.id} className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-md overflow-hidden">
                                                {/* Header Sección */}
                                                <button
                                                    onClick={() => setExpandedSeccion(expandedSeccion === seccion.id ? null : seccion.id)}
                                                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 pl-2">
                                                        <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                                                        <div className="text-left">
                                                            <span className="font-semibold text-gray-700 dark:text-gray-200">
                                                                Sección {seccion.codigo_seccion}
                                                            </span>
                                                            {shouldShowTeacher(subject.nombre) && (
                                                                <span className="text-xs text-gray-500 dark:text-gray-400 block">
                                                                    {seccion.docente_nombre}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                            <Users size={16} />
                                                            {seccion.total_estudiantes} estudiantes
                                                        </span>
                                                        {expandedSeccion === seccion.id ? <ChevronDown size={16} className="text-gray-400 dark:text-gray-200" /> : <ChevronRight size={16} className="text-gray-400 dark:text-gray-200" />}
                                                    </div>
                                                </button>

                                                {/* Nivel 3: Detalle de Sección (Estudiantes) */}
                                                {expandedSeccion === seccion.id && (
                                                    <div className="p-4 border-t dark:border-gray-800">
                                                        {/* Botones de acción */}
                                                        <div className="flex gap-2 mb-4">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleOpenInscripcionModal(seccion); }}
                                                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                                            >
                                                                <UserPlus size={16} />
                                                                Inscribir Estudiante
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDownloadListado(seccion.id, seccion.asignatura_codigo, seccion.codigo_seccion); }}
                                                                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                                                            >
                                                                <Download size={16} />
                                                                Descargar Listado
                                                            </button>
                                                        </div>

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
                                                                                <th className="text-center p-2 text-gray-600 dark:text-gray-400">Acciones</th>
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
                                                                                        <td className="p-2 text-center">
                                                                                            <button
                                                                                                onClick={() => handleEliminarEstudiante(seccion.id, est.estudiante_id)}
                                                                                                className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                                                                                                title="Eliminar estudiante"
                                                                                            >
                                                                                                <Trash2 size={18} />
                                                                                            </button>
                                                                                        </td>
                                                                                    </tr>
                                                                                )
                                                                            })}
                                                                        </tbody>
                                                                    </table>
                                                                </div>

                                                                {/* Botón Guardar Cambios */}
                                                                <div className="mt-4 flex justify-end">
                                                                    <button
                                                                        onClick={() => handleGuardarNotas(seccion)}
                                                                        disabled={saving || !Object.keys(editedNotas).some(id => seccion.estudiantes.find(e => e.detalle_id === parseInt(id)))}
                                                                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
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
                        ))}
                    </div>
                )
            }

            {/* Modal de inscripción */}
            {
                inscripcionModal && createPortal(
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                        onClick={handleCloseInscripcionModal}
                    >
                        <div
                            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-800"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white">Inscribir Estudiante</h3>
                                <button onClick={handleCloseInscripcionModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                {message && message.type === 'error' && (
                                    <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm flex items-start gap-2">
                                        <AlertCircle size={16} className="mt-0.5" />
                                        <span>{message.text}</span>
                                    </div>
                                )}

                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                        {inscripcionModal.asignatura_nombre}
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                                        Sección {inscripcionModal.codigo_seccion} · {inscripcionModal.programa}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Buscar estudiante
                                    </label>
                                    <input
                                        type="text"
                                        value={busquedaEstudiante}
                                        onChange={(e) => setBusquedaEstudiante(e.target.value)}
                                        placeholder="Nombre o cédula..."
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Seleccionar estudiante
                                    </label>
                                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                                        <div className="max-h-40 overflow-y-auto">
                                            {estudiantesFiltrados.length === 0 ? (
                                                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                                                    No se encontraron estudiantes
                                                </div>
                                            ) : (
                                                estudiantesFiltrados.slice(0, 50).map(est => (
                                                    <button
                                                        key={est.id}
                                                        type="button"
                                                        onClick={() => setSelectedEstudiante(est.id)}
                                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedEstudiante === est.id
                                                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200'
                                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                            }`}
                                                    >
                                                        {est.nombre_completo || `${est.usuario?.first_name} ${est.usuario?.last_name}`} ({est.cedula})
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                    {estudiantesFiltrados.length > 50 && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Mostrando primeros 50. Refine la búsqueda.</p>
                                    )}
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                                <button
                                    onClick={handleCloseInscripcionModal}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleInscribirEstudiante}
                                    disabled={!selectedEstudiante || inscribiendo}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                                >
                                    {inscribiendo ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                                    Inscribir
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            }
        </div >
    )
}
