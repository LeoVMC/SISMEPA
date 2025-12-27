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

  // Estado para gráfico dinámico
  const [chartLabels, setChartLabels] = useState([])
  const [chartValues, setChartValues] = useState([])

  // Estado para estudiante (desglose personal)
  const [studentDesglose, setStudentDesglose] = useState(null)

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
      const fetchStudentData = async () => {
        setLoading(true)
        const token = localStorage.getItem('apiToken')

        try {
          const miProgresoRes = await axios.get(`${import.meta.env.VITE_API_URL}/estadisticas/mi-progreso/`, {
            headers: { Authorization: token ? `Token ${token}` : undefined }
          })
          if (miProgresoRes.data && !miProgresoRes.data.error) {
            setChartLabels(miProgresoRes.data.labels || [])
            setChartValues(miProgresoRes.data.data || [])
            setStudentDesglose(miProgresoRes.data.desglose || [])
            // Usar datos de estudiante del endpoint unificado
            if (miProgresoRes.data.estudiante) {
              setDataEstudiante(miProgresoRes.data.estudiante)
            }
          }
        } catch (error) {
          console.error('Error cargando mi-progreso:', error)
        }

        setLoading(false)
      }
      fetchStudentData()
    }
  }, [showMonitoring])

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
      fetchChartData()
    }
  }, [selectedProgram, showMonitoring])

  const fetchChartData = async () => {
    try {
      const token = localStorage.getItem('apiToken')
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/estadisticas/chart-data/?programa=${selectedProgram}`, {
        headers: { Authorization: token ? `Token ${token}` : undefined }
      })
      setChartLabels(res.data.labels || [])
      setChartValues(res.data.data || [])
    } catch (e) {
      console.error('Error fetching chart data', e)
    }
  }

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

  const handleDownloadStudentProgress = async () => {
    try {
      const token = localStorage.getItem('apiToken')
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/estudiantes/descargar-progreso-academico/`, {
        headers: { Authorization: `Token ${token}` },
        responseType: 'blob', // Important
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Progreso_Academico_SISMEPA.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error descargando progreso:', error)
      alert('Error al descargar el archivo.')
    }
  }

  const handleDownloadReport = async () => {
    try {
      const token = localStorage.getItem('apiToken')
      // Usar endpoint de desglose-excel con filtro de programa
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/estadisticas/descargar-desglose-excel/`, {
        headers: { Authorization: `Token ${token}` },
        params: { programa: selectedProgram },
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'Desglose_Academico.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error descargando reporte:', error)
      alert('Error al descargar el reporte.')
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
      // Llamar al endpoint de estadísticas reales
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/estadisticas/desglose/?programa=${selectedProgram}`, {
        headers: { Authorization: token ? `Token ${token}` : undefined }
      })

      // Los datos ya vienen formateados del backend
      const semestresData = res.data.map(sem => ({
        id: `sem-${sem.id}`,
        name: `${toRoman(sem.id)} SEMESTRE`,
        subjects: sem.subjects.map(subj => ({
          id: subj.id,
          name: subj.name,
          code: subj.code,
          sections: subj.sections.map(sec => ({
            id: sec.id,
            code: sec.code,
            docente: sec.docente,
            avg: sec.avg,
            max: sec.max,
            min: sec.min,
            count: sec.count
          }))
        }))
      }))

      setAdminData(semestresData)
    } catch (e) {
      console.error('Error fetching pensum for dashboard', e)
    } finally {
      setLoading(false)
    }
  }

  // Datos dinámicos para radar
  const chartData = {
    labels: chartLabels.length > 0 ? chartLabels : ['Sin datos'],
    datasets: [
      {
        label: 'Promedio de Notas',
        data: chartValues.length > 0 ? chartValues : [0],
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
    <div className="p-4 md:p-6 transition-colors duration-200 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6 animate-slide-in-left">{dashboardTitle}</h1>

      {/* Panel de Control de Períodos Académicos (Solo Admin) */}
      {isAdmin && (
        <div className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-100 dark:border-gray-800 p-4 rounded-xl shadow-soft mb-6 transition-all duration-300 hover:shadow-soft-lg">
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
                    {/* Botón toggle inscripciones - deshabilitado si período pasado o futuro */}
                    <button
                      onClick={() => handleToggleInscripciones(periodo.id)}
                      disabled={periodosLoading || periodo.es_pasado || periodo.es_futuro}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${(periodo.es_pasado || periodo.es_futuro)
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
            <div className="flex items-center gap-3">
              {dataEstudiante && (
                <div className="text-gray-800 dark:text-white">
                  <span className="font-medium text-lg">{dataEstudiante.nombre || dataEstudiante.nombre_completo}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block sm:inline sm:ml-2">
                    {dataEstudiante.programa}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        {!showMonitoring && (
          <div>
            <button
              onClick={handleDownloadStudentProgress}
              className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center gap-2 justify-center"
            >
              <Download size={18} />
              Descargar Progreso
            </button>
          </div>
        )}
        {showMonitoring && (
          <div>
            <button
              onClick={handleDownloadReport}
              className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center gap-2 justify-center"
            >
              <Download size={18} />
              Descargar Reporte
            </button>
          </div>
        )}
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
                                    <span>Sección {sec.code}</span>
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
            <div>
              {/* Barra de progreso y resumen */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-gray-800 dark:text-white">{dataEstudiante.nombre}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">— {dataEstudiante.programa}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {parseFloat(dataEstudiante.porcentaje_avance || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
                {/* Barra de progreso horizontal */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-green-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(dataEstudiante.porcentaje_avance || 0, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <span>{dataEstudiante.aprobadas || 0} de {dataEstudiante.total_asignaturas || 0} asignaturas aprobadas</span>
                  <span>Meta: 100%</span>
                </div>
              </div>

              {/* Desglose académico con formato acordeón igual a admin */}
              {studentDesglose && studentDesglose.length > 0 && (
                <div className="space-y-2">
                  {studentDesglose.map(sem => (
                    <div key={sem.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedSemester(expandedSemester === sem.id ? null : sem.id)}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span className="font-medium text-gray-700 dark:text-gray-200">{toRoman(sem.id)} SEMESTRE</span>
                        {expandedSemester === sem.id ? <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" /> : <ChevronRight size={16} className="text-gray-500 dark:text-gray-400" />}
                      </button>

                      {expandedSemester === sem.id && (
                        <div className="p-2 space-y-1 bg-white dark:bg-gray-900">
                          {sem.subjects?.map(subj => (
                            <div key={subj.id}>
                              <button
                                onClick={() => setExpandedSubject(expandedSubject === subj.id ? null : subj.id)}
                                className="w-full flex items-center justify-between p-2 pl-4 text-sm text-left text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors"
                              >
                                <span>{subj.name}</span>
                                {expandedSubject === subj.id ? <ChevronDown size={14} className="text-gray-500 dark:text-gray-400" /> : <ChevronRight size={14} className="text-gray-500 dark:text-gray-400" />}
                              </button>

                              {expandedSubject === subj.id && (
                                <div className="mt-1 mb-2 ml-4 space-y-2 border-l-2 border-blue-500 pl-2">
                                  {subj.sections?.map(sec => (
                                    <div key={sec.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-xs space-y-2">
                                      <div className="flex justify-between items-center">
                                        <span className="font-bold text-blue-600 dark:text-blue-400">Sección {sec.code}</span>
                                        <span className={`px-2 py-1 rounded-full text-xs ${sec.estatus === 'APROBADO' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                          sec.estatus === 'REPROBADO' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                            'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                          }`}>
                                          {sec.estatus}
                                        </span>
                                      </div>
                                      {/* Notas parciales */}
                                      <div className="grid grid-cols-5 gap-2 text-center">
                                        <div className="flex flex-col items-center">
                                          <span className="text-gray-500 dark:text-gray-400">N1</span>
                                          <span className="font-bold text-blue-600 dark:text-blue-400">
                                            {sec.nota1?.toFixed(1) || '--'}
                                          </span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                          <span className="text-gray-500 dark:text-gray-400">N2</span>
                                          <span className="font-bold text-blue-600 dark:text-blue-400">
                                            {sec.nota2?.toFixed(1) || '--'}
                                          </span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                          <span className="text-gray-500 dark:text-gray-400">N3</span>
                                          <span className="font-bold text-blue-600 dark:text-blue-400">
                                            {sec.nota3?.toFixed(1) || '--'}
                                          </span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                          <span className="text-gray-500 dark:text-gray-400">N4</span>
                                          <span className="font-bold text-blue-600 dark:text-blue-400">
                                            {sec.nota4?.toFixed(1) || '--'}
                                          </span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                          <span className="text-gray-500 dark:text-gray-400">Final</span>
                                          <span className={`font-bold ${sec.nota_final == null ? 'text-gray-400' :
                                            sec.nota_final >= 10 ? 'text-green-600 dark:text-green-400' :
                                              'text-red-500 dark:text-red-400'
                                            }`}>
                                            {sec.nota_final?.toFixed(1) || '--'}
                                          </span>
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
              )}
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
