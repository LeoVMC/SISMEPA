import React, { useState } from 'react'

export default function CalificacionesForm(){
  const [resp, setResp] = useState(null)
  const token = localStorage.getItem('apiToken')

  const submit = async (e) => {
    e.preventDefault()
    const form = e.target
    const file = form.archivo.files[0]
    const estudiante = form.estudiante.value
    if (!file) {
      setResp({ error: 'Selecciona un archivo' })
      return
    }
    const MAX = 10 * 1024 * 1024
    const allowed = ['application/pdf']
    if (file.size > MAX) {
      setResp({ error: 'Archivo demasiado grande (máx 10MB)' })
      return
    }
    if (!allowed.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
      setResp({ error: 'Tipo de archivo no permitido' })
      return
    }

    const xhr = new XMLHttpRequest()
    const fd = new FormData()
    fd.append('archivo', file)
    fd.append('estudiante', estudiante)

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        const pct = Math.round((evt.loaded / evt.total) * 100)
        setResp({ progress: pct })
      }
    }
    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText || '{}')
        setResp({ status: xhr.status, body: json })
      } catch (e) {
        setResp({ status: xhr.status, body: xhr.responseText })
      }
    }
    xhr.onerror = () => setResp({ error: 'Error de red' })
    xhr.open('POST', 'http://localhost:8000/api/calificaciones/')
    if (token) xhr.setRequestHeader('Authorization', `Token ${token}`)
    xhr.send(fd)
  }

  return (
    <form onSubmit={submit} className="p-4 bg-white rounded shadow mt-2">
      <h4 className="font-medium">Subir Calificaciones (Estudiante)</h4>
      <div className="mt-2">
        <input name="estudiante" placeholder="estudiante id" className="border p-1 mb-2" />
        <input name="archivo" type="file" className="block" />
      </div>
      <button className="mt-2 bg-indigo-600 text-white py-1 px-3 rounded">Subir</button>
      {resp && <pre className="mt-2 text-sm">{JSON.stringify(resp, null, 2)}</pre>}
    </form>
  )
}
