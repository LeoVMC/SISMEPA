import React, { useState, useEffect, useRef } from 'react'
import { FileText, Download, Upload, UserPlus, X, ChevronRight, BookOpen, Loader2, AlertCircle, UserCheck, CheckCircle, MonitorCheck, GraduationCap, ArrowRight, Cpu, Stethoscope, Building2, Gavel, Briefcase, Zap, Calculator, Trash2, RadioTower } from 'lucide-react'
import { useNavigate } from 'react-router-dom'


const SECCIONES = Array.from({ length: 10 }, (_, i) => `D${i + 1}`)

const ELECTIVAS_TECNICAS_SISTEMAS = [
    { code: 'ESI-31116', name: 'PLATAFORMA CLIENTE SERVIDOR' },
    { code: 'ESI-31123', name: 'TECNOLOGÍA DE REDES' },
    { code: 'ESI-31133', name: 'ARQUITECTURA DE SOFTWARE' },
    { code: 'ESI-31153', name: 'INTELIGENCIA ARTIFICIAL' },
    { code: 'ESI-31173', name: 'REDES DE ÁREA LOCAL' },
    { code: 'ESI-31193', name: 'SISTEMAS AVANZADOS DE BASES DE DATOS' }
]

const ELECTIVAS_TECNICAS_TELECOM = [
    { code: 'ETE-31113', name: 'ANTENAS II' },
    { code: 'ETE-31123', name: 'CONVERSIÓN ELECTROMECÁNICA' },
    { code: 'ETE-31133', name: 'RADIOENLACES DIGITALES' },
    { code: 'ETE-31143', name: 'TELEFONÍA' },
    { code: 'ETE-31153', name: 'TELEVISIÓN' },
    { code: 'ETE-31173', name: 'DIFUSIÓN Y MULTIMEDIA' }
]

const ELECTIVAS_NO_TECNICAS = [
    { code: 'ENT-31113', name: 'GERENCIA DE PROYECTOS' },
    { code: 'ENT-31123', name: 'PRINCIPIOS DE GERENCIA' },
    { code: 'ENT-31133', name: 'TOMA DE DECISIONES' },
    { code: 'ENT-31143', name: 'CALIDAD TOTAL' },
    { code: 'ENT-31213', name: 'ADMINISTRACIÓN DE EMPRESAS' },
    { code: 'ENT-31223', name: 'PLANIFICACIÓN Y EVALUACIÓN DE PROYECTOS' },
    { code: 'ENT-31233', name: 'ADMINISTRACIÓN DE RECURSOS HUMANOS' },
    { code: 'ENT-31243', name: 'INGENIERÍA DE MÉTODOS' },
    { code: 'ENT-31313', name: 'DERECHO LABORAL' },
    { code: 'ENT-31323', name: 'DERECHO Y ÉTICA PARA INGENIEROS' },
    { code: 'ENT-31333', name: 'SEGURIDAD Y DEFENSA' },
    { code: 'ENT-31413', name: 'ECONOMÍA' },
    { code: 'ENT-31423', name: 'DECISIONES ÓPTIMAS DE INVERSIÓN' },
    { code: 'ENT-31513', name: 'HIGIENE Y SEGURIDAD INDUSTRIAL' },
    { code: 'ENT-31523', name: 'PRODUCCIÓN INDUSTRIAL' },
    { code: 'ENT-31613', name: 'ORATORIA' },
    { code: 'ENT-31713', name: 'INFORMÁTICA' },
    { code: 'ENT-31723', name: 'CONTROL DE CALIDAD' }
]

const ACTIVIDADES_CULTURALES = [
    { code: 'ACT-11010', name: 'TRADICIÓN CULTURA Y FOLCLOR LOCAL' },
    { code: 'ACT-11020', name: 'LECTURA' },
    { code: 'ACT-11030', name: 'FORMACIÓN SOCIAL' },
    { code: 'ACT-12010', name: 'LECTURA MUSICAL' },
    { code: 'ACT-12020', name: 'EJECUCIÓN DE INSTRUMENTO' },
    { code: 'ACT-12030', name: 'ARTES PLÁSTICAS' },
    { code: 'ACT-12040', name: 'DIBUJO Y PINTURA' },
    { code: 'ACT-12050', name: 'DANZA' },
    { code: 'ACT-12060', name: 'TEATRO' },
    { code: 'ACT-13010', name: 'CULTURA Y COMUNICACIÓN' },
    { code: 'ACT-13020', name: 'PRENSA ESCRITA' },
    { code: 'ACT-13030', name: 'RADIO' },
    { code: 'ACT-13040', name: 'TELEVISIÓN' },
    { code: 'ACT-13050', name: 'AUDIOVISUAL' },
    { code: 'ACT-13060', name: 'PROTOCOLO' }
]

const ACTIVIDADES_DEPORTIVAS = [
    { code: 'ACT-14010', name: 'EDUCACIÓN FÍSICA Y DEPORTE' },
    { code: 'ACT-14020', name: 'EDUCACIÓN FÍSICA Y SALUD' },
    { code: 'ACT-14030', name: 'EDUCACIÓN FÍSICA Y RECREACIÓN' }
]

export default function PensumPage() {
    const [userData, setUserData] = useState(null)
    const [selectedProgram, setSelectedProgram] = useState(null)
    const [availablePrograms, setAvailablePrograms] = useState([])
    const [isProgramLoading, setIsProgramLoading] = useState(true)

    const [pensumData, setPensumData] = useState([]) // Semestres dinámicos
    const [selectedSubject, setSelectedSubject] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const [actionMessage, setActionMessage] = useState(null)
    const [docentes, setDocentes] = useState([])
    const [selectedDocenteId, setSelectedDocenteId] = useState('')
    const [selectedSeccion, setSelectedSeccion] = useState('D1') // Mantendrá D1.. o Código de Opción
    const [subjectsMap, setSubjectsMap] = useState({}) // código -> datos del backend


    const navigate = useNavigate()
    const fileInputRef = useRef(null)
    const [token] = useState(localStorage.getItem('apiToken') || '')

    // ... (rest of effects)

    // Ayudante para obtener nombre formateado para sección/opción
    const getOptionLabel = (code) => {
        // Buscar en todas las listas
        const allOptions = [...ELECTIVAS_TECNICAS_SISTEMAS, ...ELECTIVAS_TECNICAS_TELECOM, ...ELECTIVAS_NO_TECNICAS, ...ACTIVIDADES_CULTURALES, ...ACTIVIDADES_DEPORTIVAS]
        const found = allOptions.find(opt => opt.code === code)
        if (found) return found.name
        // Por defecto Sección Estándar
        return `Sección ${code}`
    }


    useEffect(() => {
        const storedUser = localStorage.getItem('userData')
        if (storedUser) {
            setUserData(JSON.parse(storedUser))
        }

        // Verificar session storage para el programa
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

    // Obtener docentes al abrir modal si es administrador
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

                // Auto-seleccionar programa para estudiantes si aplica
                if (userData?.programa) {
                    const studentProg = data.find(p => p.nombre_programa === userData.programa)
                    if (studentProg) {
                        handleSelectProgram(studentProg)
                    }
                }
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

                // Mapa para búsquedas
                const map = {}
                data.forEach(sub => {
                    map[sub.codigo] = sub
                })
                setSubjectsMap(map)

                // Agrupar por semestre para la vista
                const semesters = {}
                data.forEach(sub => {
                    if (!semesters[sub.semestre]) {
                        semesters[sub.semestre] = { semester: `${toRoman(sub.semestre)} SEMESTRE`, uc: 0, subjects: [] }
                    }
                    semesters[sub.semestre].subjects.push({
                        code: sub.codigo,
                        name: sub.nombre_asignatura,
                        uc: sub.creditos,
                        prereqs: sub.prelaciones || []
                    })
                    semesters[sub.semestre].uc += sub.creditos
                })

                // Convertir a array y ordenar
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
                setDocentes(data.results || data)
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

        // selección por defecto precisa
        if (subject.code.startsWith('ELE-TEC')) {
            const isTelecom = selectedProgram?.nombre_programa?.toLowerCase().includes('telecom')
            const list = isTelecom ? ELECTIVAS_TECNICAS_TELECOM : ELECTIVAS_TECNICAS_SISTEMAS
            setSelectedSeccion(list[0].code)
        }
        else if (subject.code.startsWith('ELE-NOTEC')) setSelectedSeccion(ELECTIVAS_NO_TECNICAS[0].code)
        else if (subject.code.startsWith('ACT-CULT')) setSelectedSeccion(ACTIVIDADES_CULTURALES[0].code)
        else if (subject.code.startsWith('ACT-DEP')) setSelectedSeccion(ACTIVIDADES_DEPORTIVAS[0].code)
        else setSelectedSeccion('D1')
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedSubject(null)
        setActionMessage(null)
        if (selectedProgram) fetchSubjects(selectedProgram.id) // Refrescar datos
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

    const handleAssignTutor = async (tutorType = 'generic') => {
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
                    docente: selectedDocenteId,
                    type: tutorType
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
                setActionMessage({ type: 'success', text: 'Planificación cargada exitosamente.' })
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
                setActionMessage({ type: 'error', text: 'No hay planificación cargada.' })
            }
        } catch (err) {
            setActionMessage({ type: 'error', text: 'Error al descargar el plan.' })
        } finally {
            setActionLoading(false)
        }
    }


    const handleDeletePlan = async () => {
        if (!selectedSubject) return
        if (!confirm('¿Estás seguro de eliminar la planificación?')) return

        setActionLoading(true)
        setActionMessage(null)

        try {
            // first get the plan id
            const res = await fetch(`${import.meta.env.VITE_API_URL}/planificaciones/?asignatura__codigo=${selectedSubject.code}`, {
                headers: { Authorization: `Token ${token}` }
            })
            const plans = await res.json()

            if (plans && plans.length > 0) {
                const latestPlan = plans[plans.length - 1]
                const delRes = await fetch(`${import.meta.env.VITE_API_URL}/planificaciones/${latestPlan.id}/`, {
                    method: 'DELETE',
                    headers: { Authorization: `Token ${token}` }
                })

                if (delRes.ok) {
                    setActionMessage({ type: 'success', text: 'Planificación eliminada exitosamente.' })
                    if (selectedProgram) fetchSubjects(selectedProgram.id)
                } else {
                    throw new Error('Error al eliminar plan.')
                }
            } else {
                setActionMessage({ type: 'error', text: 'No se encontró plan para eliminar.' })
            }
        } catch (err) {
            setActionMessage({ type: 'error', text: 'Error al eliminar el plan.' })
        } finally {
            setActionLoading(false)
        }
    }

    const handleRemoveTutor = async (tutorId, type = 'generic') => {
        if (!confirm('¿Eliminar tutor?')) return
        setActionLoading(true)
        const backendSubject = subjectsMap[selectedSubject.code]

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/asignaturas/${backendSubject.id}/remove-tutor/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`
                },
                body: JSON.stringify({
                    docente: tutorId,
                    type: type
                })
            })
            if (res.ok) {
                setActionMessage({ type: 'success', text: 'Tutor eliminado.' })
                if (selectedProgram) fetchSubjects(selectedProgram.id)
            } else {
                throw new Error('Error al eliminar tutor.')
            }
        } catch (e) {
            setActionMessage({ type: 'error', text: String(e.message) })
        } finally {
            setActionLoading(false)
        }
    }

    const handleRemoveDocenteFromSection = async (seccionCode) => {
        if (!confirm(`¿Quitar docente de la sección ${seccionCode}?`)) return
        setActionLoading(true)
        const backendSubject = subjectsMap[selectedSubject.code]

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/asignaturas/${backendSubject.id}/assign-docente/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`
                },
                body: JSON.stringify({
                    codigo_seccion: seccionCode,
                    docente: '' // Limpiar asignación
                })
            })

            if (res.ok) {
                setActionMessage({ type: 'success', text: `Docente removido de sección ${seccionCode}.` })
                if (selectedProgram) fetchSubjects(selectedProgram.id)
            } else {
                throw new Error('Error al remover docente.')
            }
        } catch (err) {
            setActionMessage({ type: 'error', text: String(err.message || err) })
        } finally {
            setActionLoading(false)
        }
    }

    const renderModalActions = () => {
        const isAdmin = isAdminUser()
        const isDocente = userData?.role === 'Docente' || (userData?.groups && userData.groups.some(g => g.name === 'Docente'))

        const backendSubject = subjectsMap[selectedSubject?.code]
        const subjectCode = selectedSubject?.code || ''

        // Determinar si es tipo especial
        let optionsList = null
        let isActivity = false

        if (subjectCode.startsWith('ELE-TEC')) {
            const isTelecom = selectedProgram?.nombre_programa?.toLowerCase().includes('telecom')
            optionsList = isTelecom ? ELECTIVAS_TECNICAS_TELECOM : ELECTIVAS_TECNICAS_SISTEMAS
        }
        else if (subjectCode.startsWith('ELE-NOTEC')) optionsList = ELECTIVAS_NO_TECNICAS
        else if (subjectCode.startsWith('ACT-CULT')) { optionsList = ACTIVIDADES_CULTURALES; isActivity = true; }
        else if (subjectCode.startsWith('ACT-DEP')) { optionsList = ACTIVIDADES_DEPORTIVAS; isActivity = true; }

        return (
            <div className="space-y-3 mt-6">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileChange}
                />

                {/* NOTA PARA ACTIVIDADES */}
                {isActivity && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-xs rounded-lg border border-yellow-100 dark:border-yellow-800/30">
                        <strong>Nota Importante:</strong>
                        <p className="mt-1">Los códigos de las actividades complementarias deben ser diferentes para evitar que las notas se sobreescriban entre sí. Se deben ver obligatoriamente dos actividades deportivas y dos actividades culturales durante la carrera para poder graduarse.</p>
                    </div>
                )}


                {/* Lógica Especial para PSI-30010 (Tesis) */}
                {backendSubject?.codigo === 'PSI-30010' ? (
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
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">({tutor.username})</span>
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleRemoveTutor(tutor.id, 'generic')}
                                                        className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                                        title="Eliminar tutor"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
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
                                            <option key={d.id} value={d.id}>{d.nombre_completo}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => handleAssignTutor('generic')}
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
                ) : backendSubject?.codigo === 'TAI-01' ? (
                    /* Lógica para TAI-01: Taller */
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-sm rounded-lg border border-blue-100 dark:border-blue-800/30 flex items-start gap-3">
                        <AlertCircle className="shrink-0 mt-0.5" size={18} />
                        <div>
                            <strong>Nota Importante:</strong>
                            <p className="mt-1">El taller de servicio comunitario se debe inscribir al mismo tiempo que el proyecto de servicio comunitario.</p>
                        </div>
                    </div>
                ) : backendSubject?.codigo === 'PRO-01' ? (
                    /* Lógica para PRO-01: Proyecto de Servicio - Sin Controles Específicos */
                    null
                ) : (
                    <>
                        {/* Mostrar Asignaciones */}
                        {backendSubject?.secciones?.length > 0 && (
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">
                                    {optionsList ? 'Asignaturas Ofertadas' : 'Docentes Asignados'}
                                </label>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2 border border-gray-100 dark:border-gray-700">
                                    {backendSubject.secciones.map(sec => (
                                        <div key={sec.id} className="flex justify-between items-center text-sm">
                                            <span className="font-semibold text-gray-600 dark:text-gray-300">
                                                {getOptionLabel(sec.codigo_seccion)}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-800 dark:text-white">{sec.docente_nombre || 'Sin asignar'}</span>
                                                {isAdmin && sec.docente_nombre && (
                                                    <button
                                                        onClick={() => handleRemoveDocenteFromSection(sec.codigo_seccion)}
                                                        className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                                        title="Quitar docente"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Controles de Asignación de Admin */}
                        {isAdmin && (
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800 mb-3">
                                <label className="block text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1 uppercase">
                                    {optionsList ? 'Asignar Asignatura a Docente' : 'Asignar Docente a Sección'}
                                </label>
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col gap-3">
                                        {/* Desplegable Dinámico: Opciones vs Secciones */}
                                        {optionsList ? (
                                            <select
                                                className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md shadow-sm truncate"
                                                value={selectedSeccion}
                                                onChange={e => setSelectedSeccion(e.target.value)}
                                            >
                                                {optionsList.map(opt => <option key={opt.code} value={opt.code}>{opt.name}</option>)}
                                            </select>
                                        ) : (
                                            <select
                                                className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md shadow-sm"
                                                value={selectedSeccion}
                                                onChange={e => setSelectedSeccion(e.target.value)}
                                            >
                                                {SECCIONES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        )}

                                        <select
                                            value={selectedDocenteId}
                                            onChange={(e) => setSelectedDocenteId(e.target.value)}
                                            className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">Seleccione docente...</option>
                                            {docentes.map(d => (
                                                <option key={d.id} value={d.id}>{d.nombre_completo}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        onClick={handleAssignDocente}
                                        disabled={!selectedDocenteId || !selectedSeccion || actionLoading}
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

                {/* Controles de Carga/Descarga (Compartido) */}
                {(isAdmin || isDocente || true) && (
                    <div className="flex gap-2">
                        {/* Carga: Solo Admin o Docente (Asignado) */}
                        {(isAdmin || (isDocente && getSubjectStatus(selectedSubject?.code).isAssignedToMe)) && (
                            <button
                                onClick={handleUploadClick}
                                disabled={actionLoading}
                                className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white py-2 px-3 text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                                Cargar Planificación
                            </button>
                        )}

                        {/* Descarga: Todos (si existe, manejado por lógica de botón pero visible a todos) */}
                        <button
                            onClick={handleDownloadPlan}
                            disabled={actionLoading}
                            className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white py-2 px-3 text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {actionLoading ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
                            Descargar Planificación
                        </button>
                        {/* Botón Eliminar Plan: Admin o Docente (Asignado) */}
                        {getSubjectStatus(selectedSubject?.code).hasPlan &&
                            (isAdmin || (isDocente && getSubjectStatus(selectedSubject?.code).isAssignedToMe)) && (
                                <button
                                    onClick={handleDeletePlan}
                                    disabled={actionLoading}
                                    className="flex items-center justify-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 py-2 px-3 text-sm rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                                    title="Eliminar Planificación"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                    </div>
                )}

                {actionMessage && (
                    <div className={`mt-3 p-3 rounded-lg text-sm flex items-center gap-2 ${actionMessage.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'}`}>
                        {actionMessage.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                        {actionMessage.text}
                    </div>
                )}
            </div>
        )
    }

    // Verificando estado para estilo de tarjeta
    const getSubjectStatus = (code) => {
        const backendData = subjectsMap[code]
        return {
            assigned: backendData?.has_assignments || false,
            hasPlan: backendData?.has_plan || false,
            isAssignedToMe: backendData?.is_assigned_to_current_user || false
        }
    }

    // Ayudante para obtener ícono basado en nombre del programa
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

    // --- VISTA SELECTOR DE PROGRAMA ---
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
                    </div>
                )}
            </div>
        )
    }

    // Lock body scroll when modal is open


    // --- VISTA DIAGRAMA DE FLUJO PENSUM ---
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
                {/* Visual Legend */}
                {(() => {
                    const isAdmin = isAdminUser()
                    const isDocente = userData?.role === 'Docente' || (userData?.groups && userData.groups.some(g => g.name === 'Docente'))

                    return (
                        <div className="flex flex-wrap gap-4 px-1 mb-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                            {/* Green Border Legend (Admin/Docente Only) */}
                            {(isAdmin || isDocente) && (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded border-2 border-green-500 bg-white dark:bg-gray-800"></div>
                                    <span>{isAdmin ? 'Asignatura con Docente Asignado' : 'Asignatura Asignada a Mí'}</span>
                                </div>
                            )}

                            {/* Green Check Legend (All Users) */}
                            <div className="flex items-center gap-2">
                                <div className="relative w-4 h-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                    <div className="absolute -bottom-1 -right-1 text-green-500 bg-green-50 dark:bg-green-900/50 rounded-full p-[1px]">
                                        <CheckCircle size={10} strokeWidth={3} />
                                    </div>
                                </div>
                                <span>Planificación Cargada</span>
                            </div>
                        </div>
                    )
                })()}

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
                                    // Admins see all assignments, Teachers see only theirs
                                    const status = getSubjectStatus(subject.code)
                                    const isAdmin = isAdminUser()
                                    // Admins see all assignments, Teachers see only theirs
                                    const isDocente = userData?.role === 'Docente' || (userData?.groups && userData.groups.some(g => g.name === 'Docente'))

                                    const showAssignedBorder = (isAdmin && status.assigned) || (isDocente && status.isAssignedToMe)

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
                                            {(subject.prereqs.length > 0 || subject.code === 'PSI-30010') && (
                                                <div className="mt-2 pt-2 border-t border-gray-50 dark:border-gray-800 flex flex-wrap gap-1">
                                                    {subject.code === 'PSI-30010' ? (
                                                        <span className="text-[9px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1 rounded font-bold">
                                                            TODO EL PENSUM
                                                        </span>
                                                    ) : (
                                                        subject.prereqs.map(pre => (
                                                            <span key={typeof pre === 'object' ? pre.codigo : pre} className="text-[9px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-1 rounded">
                                                                {typeof pre === 'object' ? pre.codigo : pre} #
                                                            </span>
                                                        ))
                                                    )}
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
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-800"
                        onClick={(e) => e.stopPropagation()}
                    >
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

                            {(selectedSubject.prereqs.length > 0 || selectedSubject.code === 'PSI-30010') ? (
                                <div className="mb-6">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-2 block">Prelaciones</span>

                                    {/* Special Display for Thesis (Too many prereqs) */}
                                    {selectedSubject.code === 'PSI-30010' ? (
                                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm rounded-lg border border-amber-100 dark:border-amber-800/30">
                                            <strong>Todas las asignaturas anteriores.</strong>
                                            <p className="text-xs mt-1 opacity-80">Se requiere la aprobación de todo el pensum previo.</p>
                                        </div>
                                    ) : (selectedSubject.code === 'TAI-01' || selectedSubject.code === 'PRO-01') ? (
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-sm rounded-lg border border-blue-100 dark:border-blue-800/30">
                                            <strong>50% de Créditos Aprobados.</strong>
                                            <p className="text-xs mt-1 opacity-80">Para cursar esta asignatura se requiere tener aprobado más del 50% del pensum.</p>
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
