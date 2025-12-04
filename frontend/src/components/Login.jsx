import React, { useState } from 'react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState(null)

  const doLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const json = await res.json()
      if (res.ok) {
        // dj-rest-auth returns token under `key` when using token auth
        const token = json.key || json.token || json.access_token || null
        if (token) {
          localStorage.setItem('apiToken', token)
          setMsg('Login exitoso — token guardado en localStorage')
        } else {
          setMsg('Login exitoso (no token retornado)')
        }
      } else {
        setMsg(JSON.stringify(json))
      }
    } catch (err) {
      setMsg(String(err))
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow mb-4">
      <h3 className="font-semibold">Login (dev)</h3>
      <form onSubmit={doLogin} className="mt-2 grid grid-cols-2 gap-2">
        <input placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} className="border p-1" />
        <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-1" />
        <button className="col-span-2 bg-blue-600 text-white py-1 px-3 rounded">Entrar</button>
      </form>
      {msg && <div className="mt-2 text-sm">{msg}</div>}
    </div>
  )
}
