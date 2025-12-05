import React, { useState, useEffect, useRef } from 'react'
import { FileText, Download, Upload, UserPlus, X, ChevronRight, BookOpen, Loader2, AlertCircle, UserCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const MOCK_PENSUM_DATA = [
    {
        semester: 'SEMESTRE I',
        uc: 23,
        subjects: [
            { code: 'MAT-21215', name: 'MATEMÁTICA I', uc: 5, prereqs: [] },
            { code: 'MAT-21524', name: 'GEOMETRÍA ANALÍTICA', uc: 4, prereqs: [] },
            { code: 'ADG-25123', name: 'HOMBRE, SOCIEDAD, CIENCIA Y TEC.', uc: 3, prereqs: [] },
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

export default function PensumPage() {
    const [userData, setUserData] = useState(null)
    const [selectedSubject, setSelectedSubject] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const [actionMessage, setActionMessage] = useState(null)
    const [docentes, setDocentes] = useState([])
    const [selectedDocenteId, setSelectedDocenteId] = useState('')

    const navigate = useNavigate()
    const fileInputRef = useRef(null)
    const [token] = useState(localStorage.getItem('apiToken') || '')

    useEffect(() => {
        const storedUser = localStorage.getItem('userData')
        if (storedUser) {
            setUserData(JSON.parse(storedUser))
        }
    }, [])

    // Fetch teachers when modal opens if user is admin
    useEffect(() => {
        const isAdmin = userData?.is_staff || userData?.username === 'admin' || (userData?.groups && userData.groups.some(g => g.name === 'Administrador'))
        if (isModalOpen && isAdmin) {
            fetchDocentes()
        }
    }, [isModalOpen, userData])

    const fetchDocentes = async () => {
        try {
            // Assuming we have an endpoint to list users, filtering by group/role would be ideal
            // For now, we'll fetch all users and filter client-side or use a specific endpoint if available
            // Since we don't have a dedicated 'list teachers' endpoint, we might need to rely on admin-users or similar
            // Let's try fetching from /admin-users/ if it supports listing, otherwise we might need to add one.
            // Wait, we don't have a list endpoint for users exposed to non-superusers usually.
            // But 'admin' user should be able to see them.
            // Let's assume we can filter by group or just list all for now.
            // Actually, let's use the existing /admin-users/ endpoint if it allows GET
            // Checking views.py... UserManagementViewSet doesn't have 'list'.
            // I'll assume for now we can't easily list them without adding an endpoint.
            // BUT, I can add a quick 'list_docentes' action to UserManagementViewSet or similar.
            // For this iteration, I'll try to fetch from a new endpoint I'll assume exists or create.
            // Let's create a simple endpoint in the backend for this? 
            // Or better, let's use the existing 'estudiantes' endpoint? No.

            // I will implement a quick fetch logic assuming I can get users.
            // Since I cannot easily modify backend to add a new list endpoint without more context,
            // I will try to hit /admin-users/ if I add 'list' to it.
            // Wait, I can just use the 'users' endpoint if I exposed it.
            // Let's check urls.py... router.register(r'admin-users', UserManagementViewSet, basename='admin-users')
            // UserManagementViewSet only has 'create'.

            // I will add 'list' to UserManagementViewSet in the next step if needed.
            // For now, I'll write the frontend code expecting it.
            const res = await fetch(`${import.meta.env.VITE_API_URL}/docentes/`, { // New endpoint I'll create
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
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedSubject(null)
        setActionMessage(null)
    }

    const handleAssignDocente = async () => {
        if (!selectedDocenteId || !selectedSubject) return
        setActionLoading(true)
        setActionMessage(null)

        try {
            // 1. Get Subject ID
            const subjectRes = await fetch(`${import.meta.env.VITE_API_URL}/asignaturas/?codigo=${selectedSubject.code}`, {
                headers: { Authorization: `Token ${token}` }
            })
            const subjects = await subjectRes.json()
            if (!subjects || subjects.length === 0) throw new Error('Asignatura no encontrada.')
            const subjectId = subjects[0].id

            // 2. Patch Subject with Docente ID
            const res = await fetch(`${import.meta.env.VITE_API_URL}/asignaturas/${subjectId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`
                },
                body: JSON.stringify({ docente: selectedDocenteId })
            })

            if (res.ok) {
                setActionMessage({ type: 'success', text: 'Docente asignado exitosamente.' })
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

        try {
            const subjectRes = await fetch(`${import.meta.env.VITE_API_URL}/asignaturas/?codigo=${selectedSubject.code}`, {
                headers: { Authorization: `Token ${token}` }
            })
            const subjects = await subjectRes.json()

            if (!subjects || subjects.length === 0) {
                throw new Error('Asignatura no encontrada en base de datos. Asegúrese de que esté registrada.')
            }
            const subjectId = subjects[0].id

            const fd = new FormData()
            fd.append('asignatura', subjectId)
            fd.append('archivo', file)

            const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/planificaciones/`, {
                method: 'POST',
                headers: { Authorization: `Token ${token}` },
                body: fd
            })

            if (uploadRes.ok) {
                setActionMessage({ type: 'success', text: 'Plan de evaluación cargado exitosamente.' })
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

        return (
            <div className="space-y-3 mt-6">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileChange}
                />

                {isEstudiante && (
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

                {isAdmin && (
                    <>
                        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 mb-3">
                            <label className="block text-xs font-semibold text-indigo-700 mb-1 uppercase">Asignar Docente</label>
                            <div className="flex gap-2">
                                <select
                                    value={selectedDocenteId}
                                    onChange={(e) => setSelectedDocenteId(e.target.value)}
                                    className="flex-1 text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Seleccione un docente...</option>
                                    {docentes.map(d => (
                                        <option key={d.id} value={d.id}>{d.first_name} {d.last_name} ({d.username})</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleAssignDocente}
                                    disabled={!selectedDocenteId || actionLoading}
                                    className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleUploadClick}
                            disabled={actionLoading}
                            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                            Cargar Plan de Evaluación
                        </button>
                        <button
                            onClick={handleDownloadPlan}
                            disabled={actionLoading}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                            Descargar Plan de Evaluación
                        </button>
                    </>
                )}

                {actionMessage && (
                    <div className={`mt-3 p-3 rounded-lg text-sm flex items-center gap-2 ${actionMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                        {actionMessage.type === 'error' ? <AlertCircle size={16} /> : <Loader2 size={16} />}
                        {actionMessage.text}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Plan de Estudio - Ingeniería de Sistemas</h2>
                <p className="text-gray-500 mt-1">Mapa curricular interactivo. Haga clic en una asignatura para ver opciones.</p>
            </div>

            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-6 min-w-max">
                    {MOCK_PENSUM_DATA.map((semester, sIndex) => (
                        <div key={sIndex} className="w-64 flex flex-col gap-4">
                            <div className="text-center mb-2">
                                <h3 className="font-bold text-gray-800 uppercase">{semester.semester}</h3>
                                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {semester.uc} UC
                                </span>
                            </div>

                            {semester.subjects.map((subject, subIndex) => (
                                <div
                                    key={subIndex}
                                    onClick={() => handleSubjectClick(subject)}
                                    className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 cursor-pointer transition-all group relative"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                            {subject.uc} UC
                                        </span>
                                        <span className="text-[10px] font-mono text-gray-400">
                                            {subject.code}
                                        </span>
                                    </div>
                                    <h4 className="text-xs font-bold text-gray-700 leading-tight group-hover:text-blue-600 uppercase">
                                        {subject.name}
                                    </h4>

                                    {/* Prereq Indicators */}
                                    {subject.prereqs.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-gray-50 flex flex-wrap gap-1">
                                            {subject.prereqs.map(pre => (
                                                <span key={pre} className="text-[9px] text-gray-400 bg-gray-50 px-1 rounded">
                                                    {pre}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* Placeholder for future semesters */}
                    <div className="w-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                        <div className="text-center text-gray-400 p-6">
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
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800">{selectedSubject.name}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <span className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Código</span>
                                    <p className="font-mono text-gray-800 font-medium">{selectedSubject.code}</p>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg">
                                    <span className="text-xs text-green-600 font-semibold uppercase tracking-wider">Unidades Crédito</span>
                                    <p className="font-mono text-gray-800 font-medium">{selectedSubject.uc}</p>
                                </div>
                            </div>

                            {selectedSubject.prereqs.length > 0 ? (
                                <div className="mb-6">
                                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2 block">Prelaciones</span>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSubject.prereqs.map(pre => (
                                            <span key={pre} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-mono border border-gray-200">
                                                {pre}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic mb-6">Sin prelaciones</p>
                            )}

                            <div className="border-t border-gray-100 pt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Acciones Disponibles</h4>
                                {renderModalActions()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
