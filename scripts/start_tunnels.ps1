Write-Host "Iniciando LocalTunnel para SISMEPA..." -ForegroundColor Cyan

# Función para iniciar un proceso en segundo plano (o nueva ventana)
function Start-Tunnel {
    param (
        [int]$Port,
        [string]$Name
    )
    Write-Host "Iniciando túnel para $Name en puerto $Port..."
    Start-Process -FilePath "lt" -ArgumentList "--port $Port" -NoNewWindow
}

Write-Host "1. Asegúrate de que tu Backend (Django) esté corriendo en el puerto 8000."
Write-Host "2. Asegúrate de que tu Frontend (Vite) esté corriendo en el puerto 3000 (o 5173)."
Write-Host "--------------------------------------------------------"

# Iniciar túneles
Write-Host "Lanzando túneles... (Presiona Ctrl+C para detener)"
Write-Host "Copia las URLs que aparezcan abajo:"
Write-Host ""

# Ejecutar ambos comandos en paralelo es complicado en un solo script simple sin bloquear.
# La forma más fácil para el usuario es abrir dos terminales o usar start-process

Start-Process powershell -ArgumentList "-NoExit", "-Command", "lt --port 8000 --print-requests; Read-Host 'Presiona Enter para cerrar'"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "lt --port 3000 --print-requests; Read-Host 'Presiona Enter para cerrar'"

Write-Host "Se han abierto nuevas ventanas con los túneles."
Write-Host "IMPORTANTE:" -ForegroundColor Yellow
Write-Host "1. Copia la URL del túnel del Backend (puerto 8000)."
Write-Host "2. Pégala en 'frontend/.env.development' asi: VITE_API_URL=https://tu-url.loca.lt/api"
Write-Host "3. Reinicia el frontend si es necesario."
Write-Host "4. Abre la URL del túnel del Frontend (puerto 3000) en tu dispositivo."
