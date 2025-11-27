import React from 'react'
import PlanificacionForm from './PlanificacionForm'

export default function DocentePanel(){
  return (
    <div className="p-4 bg-white rounded shadow mt-4">
      <h3 className="font-semibold">Panel Docente (dev)</h3>
      <p className="text-sm">Aquí podrá subir planificaciones y revisar documentación de sus asignaturas.</p>
      <PlanificacionForm />
    </div>
  )
}
