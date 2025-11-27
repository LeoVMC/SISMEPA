import React from 'react'
import CalificacionesForm from './CalificacionesForm'

export default function EstudiantePanel(){
  return (
    <div className="p-4 bg-white rounded shadow mt-4">
      <h3 className="font-semibold">Panel Estudiante (dev)</h3>
      <p className="text-sm">Subida de documentos de calificaciones y visualización de pensum/progreso.</p>
      <CalificacionesForm />
    </div>
  )
}
