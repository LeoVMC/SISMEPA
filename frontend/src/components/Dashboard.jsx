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
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Monitoreo de Avance Educativo</h1>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Seleccionar Estudiante (ID)</label>
          <input
            type="number"
            value={studentId}
            min={1}
            onChange={(e) => setStudentId(Number(e.target.value))}
            className="mt-1 block w-full md:w-32 rounded-md border-gray-300 shadow-sm p-2 border"
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
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Progreso de Carrera</h2>
          {loading ? (
            <p>Cargando...</p>
          ) : dataEstudiante ? (
            <div className="text-center">
              <div className="mb-2 text-sm text-gray-600">{dataEstudiante.nombre} — {dataEstudiante.programa}</div>
              <span className="text-5xl font-bold text-blue-600">
                {parseFloat(dataEstudiante.porcentaje_avance).toFixed(2)}%
              </span>
              <p className="text-gray-500 mt-2">Porcentaje completado</p>
              <div className="mt-4 flex justify-center gap-4">
                <div className="text-center">
                  <div className="text-xl font-semibold">{dataEstudiante.aprobadas}</div>
                  <div className="text-sm text-gray-500">Asignaturas aprobadas</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold">{dataEstudiante.total_asignaturas}</div>
                  <div className="text-sm text-gray-500">Total asignaturas</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-red-500">No se encontraron datos del estudiante.</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Rendimiento por Semestre</h2>
          <Radar data={chartData} />
        </div>
      </div>



    </div>
  )
}

export default Dashboard
