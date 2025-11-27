# Frontend (React + Vite + Tailwind)

Pasos rápidos para desarrollo local (sin Docker):

1. Entrar en la carpeta `frontend`:

```powershell
cd C:\Users\LeoVMC\Desktop\SISMEPA\frontend
```

2. Instalar dependencias:

```powershell
npm install
```

3. Levantar el servidor de desarrollo:

```powershell
npm run dev
```

La app estará en `http://localhost:5173` por defecto.

Notas:
- El componente `Dashboard` ya intenta consumir `http://localhost:8000/api/estudiantes/1/progreso/` para mostrar porcentaje de avance y dispone de un botón para descargar `reporte_excel`.
- Asegúrate de tener el backend en `http://localhost:8000` y habilitar CORS si es necesario.
