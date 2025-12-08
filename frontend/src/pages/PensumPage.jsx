import React, { useState, useEffect, useRef } from 'react'
import { FileText, Download, Upload, UserPlus, X, ChevronRight, BookOpen, Loader2, AlertCircle, UserCheck, CheckCircle, MonitorCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const MOCK_PENSUM_DATA = [
    {
        semester: 'SEMESTRE I',
        uc: 23,
        subjects: [
            { code: 'MAT-21215', name: 'MATEMÁTICA I', uc: 5, prereqs: [] },
            { code: 'MAT-21524', name: 'GEOMETRÍA ANALÍTICA', uc: 4, prereqs: [] },
            { code: 'ADG-25123', name: 'HOMBRE, SOCIEDAD, CIENCIA Y TECNOLOGÍA', uc: 3, prereqs: [] },
            { code: 'MAT-21212', name: 'DIBUJO', uc: 2, prereqs: [] },
            { code: 'ADG-25132', name: 'EDUCACIÓN AMBIENTAL', uc: 2, prereqs: [] },
            { code: 'IDM-24113', name: 'INGLÉS I', uc: 3, prereqs: [] },
            { code: 'AC-1', name: 'ACTIVIDAD COMPLEMENTARIA (CULTURAL)', uc: 0, prereqs: [] },
            { code: 'ADG-25131', name: 'SEMINARIO I', uc: 1, prereqs: [] },
            { code: 'DIN-21113', name: 'DEFENSA INTEGRAL DE LA NACIÓN I', uc: 3, prereqs: [] },
        ]
    },
    {
        semester: 'SEMESTRE II',
        uc: 25,
        subjects: [
            { code: 'MAT-21225', name: 'MATEMÁTICA II', uc: 5, prereqs: ['MAT-21215'] },
            { code: 'QUF-23015', name: 'FÍSICA I', uc: 5, prereqs: ['MAT-21215', 'MAT-21524'] },
            { code: 'AC-2', name: 'ACTIVIDAD COMPLEMENTARIA (DEPORTIVA)', uc: 0, prereqs: [] },
            { code: 'MAT-21114', name: 'ÁLGEBRA LINEAL', uc: 4, prereqs: ['MAT-21215', 'MAT-21524'] },
            { code: 'QUF-22014', name: 'QUÍMICA GENERAL', uc: 4, prereqs: [] },
            { code: 'IDM-24123', name: 'INGLÉS II', uc: 3, prereqs: ['IDM-24113'] },
            { code: 'AC-3', name: 'ACTIVIDAD COMPLEMENTARIA (CULTURAL)', uc: 0, prereqs: [] },
            { code: 'ADG-25141', name: 'SEMINARIO II', uc: 1, prereqs: ['ADG-25131'] },
            { code: 'DIN-21123', name: 'DEFENSA INTEGRAL DE LA NACIÓN II', uc: 3, prereqs: ['DIN-21113'] },
        ]
    }
]

const SECCIONES = Array.from({ length: 10 }, (_, i) => `D${i + 1}`)

export default function PensumPage() {
    const [userData, setUserData] = useState(null)
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
    }, [])

    useEffect(() => {
        fetchSubjects()
    }, [token])

    // Fetch teachers when modal opens if user is admin
    useEffect(() => {
        const isAdmin = userData?.is_staff || userData?.username === 'admin' || (userData?.groups && userData.groups.some(g => g.name === 'Administrador'))
        if (isModalOpen && isAdmin) {
            fetchDocentes()
        }
    }, [isModalOpen, userData])

    const fetchSubjects = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/asignaturas/`, {
                headers: { Authorization: `Token ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                // Convert list to map for easier lookup by code
                const map = {}
                data.forEach(sub => {
                    map[sub.codigo] = sub
                })
                setSubjectsMap(map)
            }
        } catch (e) {
            console.error("Error fetching subjects", e)
        }
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
        fetchSubjects() // Refresh data on close
    }

    const handleAssignDocente = async () => {
        if (!selectedDocenteId || !selectedSubject) return
        setActionLoading(true)
        setActionMessage(null)

        const backendSubject = subjectsMap[selectedSubject.code]
        if (!backendSubject) {
            setActionMessage({ type: 'error', text: 'Asignatura no sincronizada con backend.' })
            setActionLoading(false)
            return
        }

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
                fetchSubjects() // Refresh local data
            } else {
                throw new Error('Error al asignar docente.')
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
            if (!backendSubject) {
                throw new Error('Asignatura no encontrada en base de datos. Asegúrese de que esté registrada.')
            }

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
                fetchSubjects()
            } else {
                const err = await uploadRes.json()
                throw new Error(JSON.stringify(err))
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
                setActionMessage({ type: 'error', text: 'No hay plan de evaluación cargado para esta asignatura.' })
            }
        } catch (err) {
            setActionMessage({ type: 'error', text: 'Error al descargar el plan.' })
        } finally {
            setActionLoading(false)
        }
    }

    const renderModalActions = () => {
        const isAdmin = userData?.is_staff || userData?.username === 'admin' || (userData?.groups && userData.groups.some(g => g.name === 'Administrador'))
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

                {/* Display Current Assignments */}
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

                {/* Admin Assign Controls */}
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


                {isEstudiante && backendSubject?.has_plan && (
                    <button
                        onClick={handleDownloadPlan}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                        Descargar Plan de Evaluación
                    </button>
                )}

                {isDocente && (
                    <button
                        onClick={handleUploadClick}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                        Cargar Plan de Evaluación
                    </button>
                )}

                {/* Admin Upload/Download Controls */}
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

    return (
        <div className="h-full flex flex-col">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Plan de Estudio - Ingeniería de Sistemas</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Mapa curricular interactivo. Haga clic en una asignatura para ver opciones.</p>
            </div>

            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-6 min-w-max">
                    {MOCK_PENSUM_DATA.map((semester, sIndex) => (
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
                                const isAdmin = userData?.is_staff || userData?.username === 'admin' || (userData?.groups && userData.groups.some(g => g.name === 'Administrador'))
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
                                                    <span key={pre} className="text-[9px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-1 rounded">
                                                        {pre}
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
                    ))}

                    {/* Placeholder for future semesters */}
                    <div className="w-64 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                        <div className="text-center text-gray-400 dark:text-gray-500 p-6">
                            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium">Semestres III - IX</p>
                            <p className="text-xs mt-1">Próximamente</p>
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

                        <div className="p-6">
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
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSubject.prereqs.map(pre => (
                                            <span key={pre} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-md font-mono border border-gray-200 dark:border-gray-700">
                                                {pre}
                                            </span>
                                        ))}
                                    </div>
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
