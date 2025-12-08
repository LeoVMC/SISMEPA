import React, { useState, useEffect, useRef } from 'react'
import { FileText, Download, Upload, UserPlus, X, ChevronRight, BookOpen, Loader2, AlertCircle, UserCheck, CheckCircle, MonitorCheck, GraduationCap, ArrowRight, Cpu, Stethoscope, Building2, Gavel, Briefcase, Zap, Calculator } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const SECCIONES = Array.from({ length: 10 }, (_, i) => `D${i + 1}`)

export default function PensumPage() {
    const [userData, setUserData] = useState(null)
    const [selectedProgram, setSelectedProgram] = useState(null)
    const [availablePrograms, setAvailablePrograms] = useState([])
    const [isProgramLoading, setIsProgramLoading] = useState(true)

    const [pensumData, setPensumData] = useState([]) // Dynamic semesters
    const [selectedSubject, setSelectedSubject] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const [actionMessage, setActionMessage] = useState(null)
    const [docentes, setDocentes] = useState([])
    const [selectedDocenteId, setSelectedDocenteId] = useState('')
    const [selectedSeccion, setSelectedSeccion] = useState('D1')
    const [subjectsMap, setSubjectsMap] = useState({}) // code -> backend data

    const navigate = useNavigate()
    const fileInputRef = useRef(null)
    const [token] = useState(localStorage.getItem('apiToken') || '')

    useEffect(() => {
        const storedUser = localStorage.getItem('userData')
        if (storedUser) {
            setUserData(JSON.parse(storedUser))
        }

        // Check session storage for program
        const sessionProgram = sessionStorage.getItem('selectedProgram')
        if (sessionProgram) {
            setSelectedProgram(JSON.parse(sessionProgram))
        } else {
            fetchPrograms()
        }
    }, [])

    useEffect(() => {
        if (selectedProgram) {
            fetchSubjects(selectedProgram.id)
        }
    }, [selectedProgram, token])

    // Fetch teachers when modal opens if user is admin
    useEffect(() => {
        const isAdmin = isAdminUser()
        if (isModalOpen && isAdmin) {
            fetchDocentes()
        }
    }, [isModalOpen])

    const isAdminUser = () => {
        return userData?.is_staff || userData?.username === 'admin' || (userData?.groups && userData.groups.some(g => g.name === 'Administrador'))
    }

    const fetchPrograms = async () => {
        setIsProgramLoading(true)
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/programas/`, {
                headers: { Authorization: `Token ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setAvailablePrograms(data)
            }
        } catch (e) {
            console.error("Error fetching programs", e)
        } finally {
            setIsProgramLoading(false)
        }
    }

    const handleSelectProgram = (program) => {
        setSelectedProgram(program)
        sessionStorage.setItem('selectedProgram', JSON.stringify(program))
    }

    const handleChangeProgram = () => {
        setSelectedProgram(null)
        sessionStorage.removeItem('selectedProgram')
        setPensumData([])
        fetchPrograms()
    }

    const fetchSubjects = async (programId) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/asignaturas/?programa=${programId}`, {
                headers: { Authorization: `Token ${token}` }
            })
            if (res.ok) {
                const data = await res.json()

                // Map for lookups
                const map = {}
                data.forEach(sub => {
                    map[sub.codigo] = sub
                })
                setSubjectsMap(map)

                // Group by semester for the view
                const semesters = {}
                data.forEach(sub => {
                    if (!semesters[sub.semestre]) {
                        semesters[sub.semestre] = { semester: `SEMESTRE ${toRoman(sub.semestre)}`, uc: 0, subjects: [] }
                    }
                    semesters[sub.semestre].subjects.push({
                        code: sub.codigo,
                        name: sub.nombre_asignatura,
                        uc: sub.creditos,
                        prereqs: sub.prelaciones || []
                    })
                    semesters[sub.semestre].uc += sub.creditos
                })

                // Convert to array and sort
                const sortedSemesters = Object.keys(semesters).sort((a, b) => a - b).map(k => semesters[k])
                setPensumData(sortedSemesters)
            }
        } catch (e) {
            console.error("Error fetching subjects", e)
        }
    }

    const toRoman = (num) => {
        const lookup = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X' }
        return lookup[num] || num
    }

    const fetchDocentes = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/docentes/`, {
                headers: { Authorization: `Token ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setDocentes(data)
            }
        } catch (e) {
            console.error("Error fetching docentes", e)
        }
    }

    const handleSubjectClick = (subject) => {
        setSelectedSubject(subject)
        setIsModalOpen(true)
        setActionMessage(null)
        setSelectedDocenteId('')
        setSelectedSeccion('D1')
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedSubject(null)
        setActionMessage(null)
        if (selectedProgram) fetchSubjects(selectedProgram.id) // Refresh data
    }

    const handleAssignDocente = async () => {
        if (!selectedDocenteId || !selectedSubject) return
        setActionLoading(true)
        setActionMessage(null)

        const backendSubject = subjectsMap[selectedSubject.code]
        if (!backendSubject) return

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/asignaturas/${backendSubject.id}/assign-docente/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`
                },
                body: JSON.stringify({
                    codigo_seccion: selectedSeccion,
                    docente: selectedDocenteId
                })
            })

            if (res.ok) {
                setActionMessage({ type: 'success', text: `Docente asignado a sección ${selectedSeccion} exitosamente.` })
                if (selectedProgram) fetchSubjects(selectedProgram.id)
            } else {
                throw new Error('Error al asignar docente.')
            }
        } catch (err) {
            setActionMessage({ type: 'error', text: String(err.message || err) })
        } finally {
            setActionLoading(false)
        }
    }

    const handleAssignTutor = async () => {
        if (!selectedDocenteId || !selectedSubject) return
        setActionLoading(true)
        setActionMessage(null)

        const backendSubject = subjectsMap[selectedSubject.code]
        if (!backendSubject) return

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/asignaturas/${backendSubject.id}/assign-tutor/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`
                },
                body: JSON.stringify({
                    docente: selectedDocenteId
                })
            })

            if (res.ok) {
                setActionMessage({ type: 'success', text: `Tutor asignado exitosamente.` })
                if (selectedProgram) fetchSubjects(selectedProgram.id)
            } else {
                const data = await res.json()
                throw new Error(data.error || 'Error al asignar tutor.')
            }
        } catch (err) {
            setActionMessage({ type: 'error', text: String(err.message || err) })
        } finally {
            setActionLoading(false)
        }
    }

    const handleUploadClick = () => {
        fileInputRef.current.click()
    }

    const handleFileChange = async (e) => {
        const file = e.target.files[0]
        if (!file || !selectedSubject) return

        setActionLoading(true)
        setActionMessage(null)

        const backendSubject = subjectsMap[selectedSubject.code]

        try {
            if (!backendSubject) throw new Error('Asignatura no encontrada.')

            const fd = new FormData()
            fd.append('asignatura', backendSubject.id)
            fd.append('archivo', file)

            const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/planificaciones/`, {
                method: 'POST',
                headers: { Authorization: `Token ${token}` },
                body: fd
            })

            if (uploadRes.ok) {
                setActionMessage({ type: 'success', text: 'Plan de evaluación cargado exitosamente.' })
                if (selectedProgram) fetchSubjects(selectedProgram.id)
            } else {
                throw new Error('Error al cargar archivo.')
            }

        } catch (err) {
            setActionMessage({ type: 'error', text: String(err.message || err) })
        } finally {
            setActionLoading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleDownloadPlan = async () => {
        if (!selectedSubject) return
        setActionLoading(true)
        setActionMessage(null)

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/planificaciones/?asignatura__codigo=${selectedSubject.code}`, {
                headers: { Authorization: `Token ${token}` }
            })
            const plans = await res.json()

            if (plans && plans.length > 0) {
                const latestPlan = plans[plans.length - 1]
                const backendOrigin = new URL(import.meta.env.VITE_API_URL).origin
                const url = latestPlan.archivo.startsWith('http')
                    ? latestPlan.archivo
                    : `${backendOrigin}${latestPlan.archivo}`

                window.open(url, '_blank')
                setActionMessage({ type: 'success', text: 'Descarga iniciada.' })
            } else {
                setActionMessage({ type: 'error', text: 'No hay plan de evaluación cargado.' })
            }
        } catch (err) {
            setActionMessage({ type: 'error', text: 'Error al descargar el plan.' })
        } finally {
            setActionLoading(false)
        }
    }

    const renderModalActions = () => {
        const isAdmin = isAdminUser()
        const isDocente = userData?.role === 'Docente' || (userData?.groups && userData.groups.some(g => g.name === 'Docente'))
        const isEstudiante = !isAdmin && !isDocente

        const backendSubject = subjectsMap[selectedSubject?.code]

        return (
            <div className="space-y-3 mt-6">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileChange}
                />

                {/* Special Logic for PSI-30010 (Thesis/Internship) */}
                {backendSubject?.code === 'PSI-30010' ? (
                    <>
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">
                                Tutores Asignados ({backendSubject.tutores?.length || 0}/10)
                            </label>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2 border border-gray-100 dark:border-gray-700">
                                {backendSubject.tutores && backendSubject.tutores.length > 0 ? (
                                    backendSubject.tutores.map(tutor => (
                                        <div key={tutor.id} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-800 dark:text-white font-medium">{tutor.first_name} {tutor.last_name}</span>
                                            <span className="text-xs text-gray-500">({tutor.username})</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No hay tutores asignados.</p>
                                )}
                            </div>
                        </div>

                        {isAdmin && (
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800 mb-3">
                                <label className="block text-xs font-semibold text-purple-700 dark:text-purple-300 mb-1 uppercase">Asignar Tutor</label>
                                <div className="flex gap-2">
                                    <select
                                        value={selectedDocenteId}
                                        onChange={(e) => setSelectedDocenteId(e.target.value)}
                                        className="flex-1 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                    >
                                        <option value="">Seleccione tutor...</option>
                                        {docentes.map(d => (
                                            <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleAssignTutor}
                                        disabled={!selectedDocenteId || actionLoading || (backendSubject.tutores?.length >= 10)}
                                        className="bg-purple-600 text-white p-2 rounded-md hover:bg-purple-700 disabled:opacity-50 text-sm font-medium flex justify-center gap-2 items-center"
                                    >
                                        {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                                        Asignar
                                    </button>
                                </div>
                                {backendSubject.tutores?.length >= 10 && <p className="text-xs text-red-500 mt-1">Límite de tutores alcanzado.</p>}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Display Current Assignments (Standard Subjects) */}
                        {backendSubject?.secciones?.length > 0 && (
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">Docentes Asignados</label>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2 border border-gray-100 dark:border-gray-700">
                                    {backendSubject.secciones.map(sec => (
                                        <div key={sec.id} className="flex justify-between items-center text-sm">
                                            <span className="font-semibold text-gray-600 dark:text-gray-300">Sección {sec.codigo_seccion}</span>
                                            <span className="text-gray-800 dark:text-white">{sec.docente_nombre || 'Sin asignar'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Admin Assign Controls (Standard) */}
                        {isAdmin && (
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800 mb-3">
                                <label className="block text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1 uppercase">Asignar Docente a Sección</label>
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <select
                                            className="w-20 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md shadow-sm"
                                            value={selectedSeccion}
                                            onChange={e => setSelectedSeccion(e.target.value)}
                                        >
                                            {SECCIONES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <select
                                            value={selectedDocenteId}
                                            onChange={(e) => setSelectedDocenteId(e.target.value)}
                                            className="flex-1 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">Seleccione docente...</option>
                                            {docentes.map(d => (
                                                <option key={d.id} value={d.id}>{d.first_name} {d.last_name} ({d.username})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        onClick={handleAssignDocente}
                                        disabled={!selectedDocenteId || actionLoading}
                                        className="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium flex justify-center gap-2 items-center"
                                    >
                                        {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
                                        Asignar
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Upload/Download Controls (Shared) */}
                {isAdmin && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleUploadClick}
                            disabled={actionLoading}
                            className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white py-2 px-3 text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {actionLoading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                            Cargar Plan
                        </button>
                        <button
                            onClick={handleDownloadPlan}
                            disabled={actionLoading}
                            className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white py-2 px-3 text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {actionLoading ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
                            Descargar Plan
                        </button>
                    </div>
                )}

                {actionMessage && (
                    <div className={`mt-3 p-3 rounded-lg text-sm flex items-center gap-2 ${actionMessage.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'}`}>
                        {actionMessage.type === 'error' ? <AlertCircle size={16} /> : <Loader2 size={16} />}
                        {actionMessage.text}
                    </div>
                )}
            </div>
        )
    }

    // Checking status for card styling
    const getSubjectStatus = (code) => {
        const backendData = subjectsMap[code]
        return {
            assigned: backendData?.has_assignments || false,
            hasPlan: backendData?.has_plan || false
        }
    }

    // Helper to get icon based on program name
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

        return <GraduationCap className="text-blue-600 dark:text-blue-400" size={28} />
    }

    // --- PROGRAM SELECTOR VIEW ---
    if (!selectedProgram) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8">
                <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mb-4">
                        <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Seleccione su Carrera</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        Para visualizar el pensum de estudios correspondiente, por favor seleccione una de las carreras disponibles.
                    </p>
                </div>

                {isProgramLoading ? (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-blue-500" size={40} />
                        <span className="text-sm text-gray-500">Cargando programas...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
                        {availablePrograms.map(prog => (
                            <div
                                key={prog.id}
                                onClick={() => handleSelectProgram(prog)}
                                className="group bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/10 p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-500 shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 pr-2">
                                        {prog.nombre_programa}
                                    </h3>
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full mt-1 shrink-0">
                                        <ArrowRight size={16} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 pl-1">
                                    <p>Duración: <span className="font-semibold text-gray-700 dark:text-gray-300">{prog.duracion_anios} años</span></p>
                                    <p>Título: <span className="font-semibold text-gray-700 dark:text-gray-300">{prog.titulo_otorgado}</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    // --- PENSUM FLOWCHART VIEW ---
    return (
        <div className="h-full flex flex-col">
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        {getProgramIcon(selectedProgram.nombre_programa)}
                        {selectedProgram.nombre_programa}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 ml-9">Mapa curricular interactivo</p>
                </div>

                <button
                    onClick={handleChangeProgram}
                    className="group flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300"
                >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">Cambiar Carrera</span>
                    <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                        <ArrowRight size={14} className="text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                </button>
            </div>

            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-6 min-w-max">
                    {pensumData.length > 0 ? (
                        pensumData.map((semester, sIndex) => (
                            <div key={sIndex} className="w-64 flex flex-col gap-4">
                                <div className="text-center mb-2">
                                    <h3 className="font-bold text-gray-800 dark:text-white uppercase">{semester.semester}</h3>
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                                        {semester.uc} UC
                                    </span>
                                </div>

                                {semester.subjects.map((subject, subIndex) => {
                                    const status = getSubjectStatus(subject.code)
                                    // Only admins see the green border for assignment
                                    const isAdmin = isAdminUser()
                                    const showAssignedBorder = isAdmin && status.assigned

                                    return (
                                        <div
                                            key={subIndex}
                                            onClick={() => handleSubjectClick(subject)}
                                            className={`
                                                relative bg-white dark:bg-gray-900 p-3 rounded-lg border shadow-sm hover:shadow-md cursor-pointer transition-all group
                                                ${showAssignedBorder ? 'border-green-500 dark:border-green-500 border-2' : 'border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-500'}
                                            `}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-700">
                                                    {subject.uc} UC
                                                </span>
                                                <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">
                                                    {subject.code}
                                                </span>
                                            </div>
                                            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-200 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 uppercase">
                                                {subject.name}
                                            </h4>

                                            {/* Prereq Indicators */}
                                            {subject.prereqs.length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-gray-50 dark:border-gray-800 flex flex-wrap gap-1">
                                                    {subject.prereqs.map(pre => (
                                                        <span key={typeof pre === 'object' ? pre.codigo : pre} className="text-[9px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-1 rounded">
                                                            {typeof pre === 'object' ? pre.codigo : pre} #
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Green Marker for Plan Loaded */}
                                            {status.hasPlan && (
                                                <div className="absolute bottom-2 right-2 text-green-500 bg-green-50 dark:bg-green-900/50 rounded-full p-0.5">
                                                    <CheckCircle size={14} strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        ))
                    ) : (
                        <div className="w-full flex flex-col items-center justify-center p-10 text-gray-400">
                            <Loader2 className="animate-spin mb-2" size={30} />
                            <p>Cargando materias del pensum...</p>
                        </div>
                    )}

                    {/* Placeholder for future semesters (visual only) */}
                    <div className="w-64 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 opacity-50">
                        <div className="text-center text-gray-400 dark:text-gray-500 p-6">
                            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium">Fin del Pensum</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && selectedSubject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-800">
                        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white">{selectedSubject.name}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                    <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">Código</span>
                                    <p className="font-mono text-gray-800 dark:text-gray-200 font-medium">{selectedSubject.code}</p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                                    <span className="text-xs text-green-600 dark:text-green-400 font-semibold uppercase tracking-wider">Unidades Crédito</span>
                                    <p className="font-mono text-gray-800 dark:text-gray-200 font-medium">{selectedSubject.uc}</p>
                                </div>
                            </div>

                            {selectedSubject.prereqs.length > 0 ? (
                                <div className="mb-6">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-2 block">Prelaciones</span>

                                    {/* Special Display for Thesis (Too many prereqs) */}
                                    {selectedSubject.code === 'PSI-30010' ? (
                                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm rounded-lg border border-amber-100 dark:border-amber-800/30">
                                            <strong>Todas las asignaturas anteriores.</strong>
                                            <p className="text-xs mt-1 opacity-80">Esta materia requiere la aprobación de todo el pensum previo.</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedSubject.prereqs.map(pre => (
                                                <span key={typeof pre === 'object' ? pre.codigo : pre} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-md font-mono border border-gray-200 dark:border-gray-700">
                                                    {typeof pre === 'object' ? pre.codigo : pre}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic mb-6">Sin prelaciones</p>
                            )}

                            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Acciones Disponibles</h4>
                                {renderModalActions()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
