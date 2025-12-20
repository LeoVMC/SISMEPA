import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Radar } from 'react-chartjs-2'
import { ChevronDown, ChevronRight, Users, Award, Download, Calendar, ToggleLeft, ToggleRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react'


ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const Dashboard = () => {
  const [dataEstudiante, setDataEstudiante] = useState(null)
  const [loading, setLoading] = useState(true)
  const [studentId, setStudentId] = useState(1)

  // Estado de Admin/Profesor
  const [programs, setPrograms] = useState([])
  const [selectedProgram, setSelectedProgram] = useState('')
  const [adminData, setAdminData] = useState(null) // Datos para el acordeón
  const [expandedSemester, setExpandedSemester] = useState(null)
  const [expandedSubject, setExpandedSubject] = useState(null)

  // Estado para Períodos Académicos
  const [periodos, setPeriodos] = useState([])
  const [periodosLoading, setPeriodosLoading] = useState(false)
  const [periodosMessage, setPeriodosMessage] = useState(null)

  const userData = JSON.parse(localStorage.getItem('userData') || '{}')
  const isAdmin = userData.username === 'admin' || userData.is_staff || userData.groups?.some(g => g.name === 'Administrador' || g.name === 'Admin')
  const isTeacher = userData.groups?.some(g => g.name === 'Docente' || g.name === 'Profesor')
  const showMonitoring = isAdmin || isTeacher
  const dashboardTitle = showMonitoring ? 'Monitoreo de Avance Educativo' : 'Mi Progreso Educativo'


  // Obtener datos para Vista Estudiante
  useEffect(() => {
    if (!showMonitoring) {
      const fetchData = async (id = studentId) => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/estudiantes/${id}/progreso/`)
          setDataEstudiante(response.data)
        } catch (error) {
          console.error('Error cargando datos', error)
        } finally {
          setLoading(false)
        }
      }
      fetchData()
    }
  }, [showMonitoring])

  // Obtener datos para Vista Estudiante (Actualizar al cambiar ID)
  useEffect(() => {
    if (!showMonitoring) {
      setLoading(true)
      const fetch = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/estudiantes/${studentId}/progreso/`)
          setDataEstudiante(response.data)
        } catch (err) {
          console.error(err)
          setDataEstudiante(null)
        } finally {
          setLoading(false)
        }
      }
      fetch()
    }
  }, [studentId, showMonitoring])

  // Obtener Programas para Vista Admin
  useEffect(() => {
    if (showMonitoring) {
      const fetchPrograms = async () => {
        try {
          const token = localStorage.getItem('apiToken')
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/programas/`, {
            headers: { Authorization: token ? `Token ${token}` : undefined }
          })
          setPrograms(res.data)
          if (res.data.length > 0) setSelectedProgram(res.data[0].id)
        } catch (e) {
          console.error(e)
        }
      }
      fetchPrograms()
    }
  }, [showMonitoring])

  // Obtener y Procesar Datos del Pensum (Vista Admin)
  useEffect(() => {
    if (showMonitoring && selectedProgram) {
      fetchAndProcessPensum()
    }
  }, [selectedProgram, showMonitoring])

  // Obtener Períodos Académicos (solo Admin)
  useEffect(() => {
    if (isAdmin) {
      fetchPeriodos()
    }
  }, [isAdmin])

  const fetchPeriodos = async () => {
    setPeriodosLoading(true)
    try {
      const token = localStorage.getItem('apiToken')
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/periodos/`, {
        headers: { Authorization: `Token ${token}` }
      })
      setPeriodos(res.data.results || res.data)
    } catch (e) {
      console.error('Error fetching periodos', e)
    } finally {
      setPeriodosLoading(false)
    }
  }

  const handleToggleInscripciones = async (periodoId) => {
    setPeriodosLoading(true)
    setPeriodosMessage(null)
    try {
      const token = localStorage.getItem('apiToken')
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/periodos/${periodoId}/toggle-inscripciones/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      )
      setPeriodosMessage({ type: 'success', text: res.data.mensaje })
      fetchPeriodos()
    } catch (e) {
      setPeriodosMessage({ type: 'error', text: 'Error al cambiar estado de inscripciones.' })
    } finally {
      setPeriodosLoading(false)
    }
  }

  const handleActivarPeriodo = async (periodoId) => {
    setPeriodosLoading(true)
    setPeriodosMessage(null)
    try {
      const token = localStorage.getItem('apiToken')
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/periodos/${periodoId}/activar/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      )
      setPeriodosMessage({ type: 'success', text: res.data.mensaje })
      fetchPeriodos()
    } catch (e) {
      setPeriodosMessage({ type: 'error', text: 'Error al activar período.' })
    } finally {
      setPeriodosLoading(false)
    }
  }

  const toRoman = (num) => {
    const lookup = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X' }
    return lookup[num] || num
  }

  const fetchAndProcessPensum = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('apiToken')
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/asignaturas/?programa=${selectedProgram}`, {
        headers: { Authorization: token ? `Token ${token}` : undefined }
      })

      const subjects = res.data
      const semestersMap = {}

      // Agrupar por semestre
      subjects.forEach(sub => {
        const semNum = sub.semestre
        if (semNum > 8) return // Omitir semestre 9 en adelante (Tesis/Pasantía)

        if (!semestersMap[semNum]) {
          semestersMap[semNum] = {
            id: `sem-${semNum}`,
            name: `${toRoman(semNum)} SEMESTRE`,
            subjects: []
          }
        }

        // Generar Secciones Simuladas para esta asignatura
        const sections = []
        const numSections = 1 + Math.floor(Math.random() * 3) // 1-3 secciones
        for (let k = 1; k <= numSections; k++) {
          sections.push({
            id: `sec-${sub.id}-${k}`,
            code: `SEC-${String.fromCharCode(64 + k)}`, // Sec A, B, C...
            avg: (10 + Math.random() * 10).toFixed(2),
            max: 20,
            min: Math.floor(Math.random() * 10),
            count: 15 + Math.floor(Math.random() * 30)
          })
        }

        semestersMap[semNum].subjects.push({
          id: sub.id,
          name: sub.nombre_asignatura,
          code: sub.codigo,
          sections: sections
        })
      })

      // Convertir a array y ordenar
      const sortedSemesters = Object.keys(semestersMap)
        .sort((a, b) => Number(a) - Number(b))
        .map(k => semestersMap[k])

      setAdminData(sortedSemesters)
    } catch (e) {
      console.error('Error fetching pensum for dashboard', e)
    } finally {
      setLoading(false)
    }
  }

  // Datos de ejemplo para radar
  const chartData = {
    labels: showMonitoring
      ? ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8']
      : ['Semestre 1', 'Semestre 2', 'Semestre 3', 'Semestre 4', 'Semestre 5'],
    datasets: [
      {
        label: 'Promedio de Notas',
        data: showMonitoring
          ? [14, 15, 12, 16, 18, 15, 17, 19] // Datos simulados para demo Admin
          : [14, 15, 12, 16, 18],
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    scales: {
      r: {
        min: 0,
        max: 20,
        grid: { color: 'rgba(128, 128, 128, 0.2)' },
        angleLines: { color: 'rgba(128, 128, 128, 0.2)' },
        pointLabels: { color: 'rgba(128, 128, 128, 0.7)' }
      }
    }
  }

  return (
    <div className="p-4 md:p-6 transition-colors duration-200">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6">{dashboardTitle}</h1>

      {/* Panel de Control de Períodos Académicos (Solo Admin) */}
      {isAdmin && (
        <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 p-4 rounded-lg shadow-md mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Control de Períodos Académicos</h2>
          </div>

          {periodosMessage && (
            <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${periodosMessage.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'}`}>
              {periodosMessage.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
              {periodosMessage.text}
            </div>
          )}

          {periodosLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="animate-spin" size={18} />
              Cargando períodos...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {periodos.map(periodo => (
                <div key={periodo.id} className={`p-4 rounded-lg border-2 transition-all ${periodo.es_pasado
                    ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 opacity-60'
                    : periodo.activo
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : periodo.es_futuro
                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                  }`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-white">{periodo.nombre_periodo}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {periodo.fecha_inicio} - {periodo.fecha_fin}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      {periodo.activo && (
                        <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full">Activo</span>
                      )}
                      {periodo.es_pasado && (
                        <span className="px-2 py-1 text-xs bg-gray-500 text-white rounded-full">Finalizado</span>
                      )}
                      {periodo.es_futuro && (
                        <span className="px-2 py-1 text-xs bg-amber-500 text-white rounded-full">Próximo</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* Botón toggle inscripciones - deshabilitado si período pasado */}
                    <button
                      onClick={() => handleToggleInscripciones(periodo.id)}
                      disabled={periodosLoading || periodo.es_pasado}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${periodo.es_pasado
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          : periodo.inscripciones_activas
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                    >
                      {periodo.inscripciones_activas ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      Inscripciones: {periodo.inscripciones_activas ? 'Abiertas' : 'Cerradas'}
                    </button>

                    {/* Botón activar período */}
                    {!periodo.activo && !periodo.es_pasado && (
                      periodo.es_activable ? (
                        <button
                          onClick={() => handleActivarPeriodo(periodo.id)}
                          disabled={periodosLoading}
                          className="w-full px-3 py-2 rounded-lg text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          Activar Período
                        </button>
                      ) : periodo.es_futuro && (
                        <div className="w-full px-3 py-2 rounded-lg text-xs text-center bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                          <AlertCircle size={14} className="inline mr-1" />
                          Disponible desde {periodo.fecha_inicio}
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>

          )}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          {showMonitoring ? (
            <div className="w-full md:w-80">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seleccionar Carrera</label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre_programa}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Seleccionar Estudiante (ID)</label>
              <input
                type="number"
                value={studentId}
                min={1}
                onChange={(e) => setStudentId(Number(e.target.value))}
                className="mt-1 block w-full md:w-32 rounded-md border-gray-300 shadow-sm p-2 border dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors"
              />
            </div>
          )}
        </div>
        <div>
          <button
            onClick={() => window.open(`${import.meta.env.VITE_API_URL}/estudiantes/reporte_excel/`)}
            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center gap-2 justify-center"
          >
            <Download size={18} />
            Descargar Reporte
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 p-6 rounded-lg shadow-md transition-colors">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">{showMonitoring ? 'Desglose Académico' : 'Progreso de Carrera'}</h2>

          {loading ? (
            <p className="dark:text-gray-300">Cargando...</p>
          ) : showMonitoring ? (
            <div className="space-y-2">
              {adminData?.map(sem => (
                <div key={sem.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedSemester(expandedSemester === sem.id ? null : sem.id)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{sem.name}</span>
                    {expandedSemester === sem.id ? <ChevronDown size={18} className="text-gray-500" /> : <ChevronRight size={18} className="text-gray-500" />}
                  </button>

                  {expandedSemester === sem.id && (
                    <div className="p-2 space-y-1 bg-white dark:bg-gray-900">
                      {sem.subjects.map(subj => (
                        <div key={subj.id}>
                          <button
                            onClick={() => setExpandedSubject(expandedSubject === subj.id ? null : subj.id)}
                            className="w-full flex items-center justify-between p-2 pl-4 text-sm text-left text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors"
                          >
                            <span>{subj.name}</span>
                            {expandedSubject === subj.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>

                          {expandedSubject === subj.id && (
                            <div className="mt-1 mb-2 ml-4 space-y-2 border-l-2 border-blue-500 pl-2">
                              {subj.sections.map(sec => (
                                <div key={sec.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-xs space-y-1">
                                  <div className="flex justify-between font-bold text-blue-600 dark:text-blue-400">
                                    <span>{sec.code}</span>
                                    <span className="flex items-center gap-1"><Users size={12} /> {sec.count}</span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 text-center text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center">
                                      <span className="text-green-600 dark:text-green-400 font-bold">{sec.avg}</span>
                                      <span>Prom</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <span className="text-blue-600 dark:text-blue-400 font-bold">{sec.max}</span>
                                      <span>Max</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <span className="text-red-500 dark:text-red-400 font-bold">{sec.min}</span>
                                      <span>Min</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : dataEstudiante ? (
            <div className="text-center">
              <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">{dataEstudiante.nombre} — {dataEstudiante.programa}</div>
              <span className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                {parseFloat(dataEstudiante.porcentaje_avance).toFixed(2)}%
              </span>
              <p className="text-gray-500 dark:text-gray-500 mt-2">Porcentaje completado</p>
              <div className="mt-4 flex justify-center gap-4">
                <div className="text-center">
                  <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">{dataEstudiante.aprobadas}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">Asignaturas aprobadas</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">{dataEstudiante.total_asignaturas}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">Total asignaturas</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-red-500">No se encontraron datos del estudiante.</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 p-6 rounded-lg shadow-md transition-colors">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Rendimiento por Semestre</h2>
          <Radar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
