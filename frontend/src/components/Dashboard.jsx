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


ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const Dashboard = () => {
  const [dataEstudiante, setDataEstudiante] = useState(null)
  const [loading, setLoading] = useState(true)
  const [studentId, setStudentId] = useState(1)

  const userData = JSON.parse(localStorage.getItem('userData') || '{}')
  const isAdmin = userData.username === 'admin' || userData.is_staff || userData.groups?.some(g => g.name === 'Administrador' || g.name === 'Admin')
  const isTeacher = userData.groups?.some(g => g.name === 'Docente' || g.name === 'Profesor')
  const showMonitoring = isAdmin || isTeacher
  const dashboardTitle = showMonitoring ? 'Monitoreo de Avance Educativo' : 'Mi Progreso Educativo'

  useEffect(() => {
    const fetchData = async (id = studentId) => {
      try {
        // Por defecto usamos id 1 — puedes parametrizar según necesites
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/estudiantes/${id}/progreso/`)
        setDataEstudiante(response.data)
      } catch (error) {
        console.error('Error cargando datos', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // cargar cuando cambie el studentId
  useEffect(() => {
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
  }, [studentId])

  // Datos de ejemplo para radar; más adelante podemos obtener por semestre desde otra API
  const chartData = {
    labels: ['Semestre 1', 'Semestre 2', 'Semestre 3', 'Semestre 4', 'Semestre 5'],
    datasets: [
      {
        label: 'Promedio de Notas',
        data: [14, 15, 12, 16, 18],
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="p-4 md:p-6 transition-colors duration-200">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6">{dashboardTitle}</h1>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
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
        <div>
          <button
            onClick={() => window.open(`${import.meta.env.VITE_API_URL}/estudiantes/reporte_excel/`)}
            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Descargar Reporte Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 p-6 rounded-lg shadow-md transition-colors">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Progreso de Carrera</h2>
          {loading ? (
            <p className="dark:text-gray-300">Cargando...</p>
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
          <Radar data={chartData} options={{
            scales: {
              r: {
                grid: { color: 'rgba(128, 128, 128, 0.2)' },
                angleLines: { color: 'rgba(128, 128, 128, 0.2)' },
                pointLabels: { color: 'rgba(128, 128, 128, 0.7)' }
              }
            }
          }} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
