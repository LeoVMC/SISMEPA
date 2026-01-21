import React, { useState } from 'react'
import { showSuccess } from '../utils/swalUtils'

export default function AdminPanel() {
  const [token, setToken] = useState(localStorage.getItem('apiToken') || '')
  const [userResp, setUserResp] = useState(null)
  const [pensumResp, setPensumResp] = useState(null)

  const createUser = async (e) => {
    e.preventDefault()
    const form = e.target
    const data = {
      username: form.username.value,
      password: form.password.value,
      email: form.email.value,
      first_name: form.first_name.value,
      role: form.role.value,
      cedula: form.cedula.value,
      telefono: form.telefono.value,
      programa: form.programa.value || null
    }

    try {
      const res = await fetch('http://localhost:8000/api/admin-users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Token ${token}` : undefined,
        },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      setUserResp({ status: res.status, body: json })
    } catch (err) {
      setUserResp({ error: String(err) })
    }
  }

  const uploadPensum = async (e) => {
    e.preventDefault()
    const form = e.target
    const file = form.archivo.files[0]
    const programa = form.programa.value
    if (!file) {
      setPensumResp({ error: 'Selecciona un archivo' })
      return
    }
    const MAX = 10 * 1024 * 1024
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (file.size > MAX) {
      setPensumResp({ error: 'Archivo demasiado grande (máx 10MB)' })
      return
    }
    if (!allowed.includes(file.type) && !file.name.toLowerCase().match(/\.(pdf|docx|doc)$/)) {
      setPensumResp({ error: 'Tipo de archivo no permitido' })
      return
    }

    const xhr = new XMLHttpRequest()
    const fd = new FormData()
    fd.append('archivo', file)
    fd.append('programa', programa)

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        const pct = Math.round((evt.loaded / evt.total) * 100)
        setPensumResp({ progress: pct })
      }
    }
    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText || '{}')
        setPensumResp({ status: xhr.status, body: json })
      } catch (e) {
        setPensumResp({ status: xhr.status, body: xhr.responseText })
      }
    }
    xhr.onerror = () => setPensumResp({ error: 'Error de red' })
    xhr.open('POST', 'http://localhost:8000/api/pensums/')
    if (token) xhr.setRequestHeader('Authorization', `Token ${token}`)
    xhr.send(fd)
  }

  const saveToken = () => {
    localStorage.setItem('apiToken', token)
    showSuccess('Token Guardado', 'Token guardado en localStorage')
  }

  const clearToken = () => {
    localStorage.removeItem('apiToken')
    setToken('')
    showSuccess('Token Eliminado', 'Token removido')
  }

  return (
    <div className="p-6 bg-white rounded shadow mt-6">
      <h3 className="text-lg font-semibold mb-3">Panel Admin (dev)</h3>

      <div className="mb-4">
        <label className="block text-sm">API Token</label>
        <input value={token} onChange={(e) => setToken(e.target.value)} className="mt-1 block w-full" />
      </div>

      <form onSubmit={createUser} className="mb-4">
        <h4 className="font-medium">Crear Usuario</h4>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <input name="username" placeholder="username" className="border p-1" />
          <input name="password" placeholder="password" type="password" className="border p-1" />
          <input name="email" placeholder="email" className="border p-1" />
          <input name="first_name" placeholder="Nombre" className="border p-1" />
          <select name="role" className="border p-1">
            <option value="Estudiante">Estudiante</option>
            <option value="Docente">Docente</option>
          </select>
          <input name="programa" placeholder="programa id" className="border p-1" />
          <input name="cedula" placeholder="cedula" className="border p-1" />
          <input name="telefono" placeholder="telefono" className="border p-1" />
        </div>
        <button type="submit" className="mt-2 bg-blue-600 text-white py-1 px-3 rounded">Crear</button>
        {userResp && <pre className="mt-2 text-sm">{JSON.stringify(userResp, null, 2)}</pre>}
      </form>

      <form onSubmit={uploadPensum} encType="multipart/form-data">
        <h4 className="font-medium">Subir Pensum</h4>
        <div className="mt-2">
          <input name="archivo" type="file" className="block" />
          <input name="programa" placeholder="programa id" className="border p-1 mt-2" />
        </div>
        <button className="mt-2 bg-green-600 text-white py-1 px-3 rounded">Subir</button>
        {pensumResp && <pre className="mt-2 text-sm">{JSON.stringify(pensumResp, null, 2)}</pre>}
      </form>

      <div className="mt-4 flex gap-2">
        <button onClick={saveToken} className="bg-gray-600 text-white py-1 px-3 rounded">Guardar Token</button>
        <button onClick={clearToken} className="bg-red-600 text-white py-1 px-3 rounded">Limpiar Token</button>
      </div>
    </div>
  )
}
