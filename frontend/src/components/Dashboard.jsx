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
import { ChevronDown, ChevronRight, Users, TrendingUp, TrendingDown, Award, Download } from 'lucide-react'


ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const Dashboard = () => {
  const [dataEstudiante, setDataEstudiante] = useState(null)
  const [loading, setLoading] = useState(true)
  const [studentId, setStudentId] = useState(1)

  // Admin/Profesor State
  const [programs, setPrograms] = useState([])
  const [selectedProgram, setSelectedProgram] = useState('')
  const [adminData, setAdminData] = useState(null) // Data for the accordion
  const [expandedSemester, setExpandedSemester] = useState(null)
  const [expandedSubject, setExpandedSubject] = useState(null)


  const userData = JSON.parse(localStorage.getItem('userData') || '{}')
  const isAdmin = userData.username === 'admin' || userData.is_staff || userData.groups?.some(g => g.name === 'Administrador' || g.name === 'Admin')
  const isTeacher = userData.groups?.some(g => g.name === 'Docente' || g.name === 'Profesor')
  const showMonitoring = isAdmin || isTeacher
  const dashboardTitle = showMonitoring ? 'Monitoreo de Avance Educativo' : 'Mi Progreso Educativo'

  // Fetch data for Student View
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

  // Fetch data for Student View (Update on ID change)
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

  // Fetch Programs for Admin View
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

  // Fetch and Process Pensum Data (Admin View)
  useEffect(() => {
    if (showMonitoring && selectedProgram) {
      fetchAndProcessPensum()
    }
  }, [selectedProgram, showMonitoring])

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

      // Group by semester
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

        // Generate Mock Sections for this subject
        const sections = []
        const numSections = 1 + Math.floor(Math.random() * 3) // 1-3 sections
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

      // Convert to array and sort
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
          ? [14, 15, 12, 16, 18, 15, 17, 19] // Mock data for Admin demo
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
                            className="w-full flex items-center justify-between p-2 pl-4 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors"
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
