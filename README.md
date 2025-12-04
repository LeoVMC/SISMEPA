# SISMEPA — Desarrollo local

Resumen rápido
- Backend: Django (`sismepa` project, `gestion` app)
- Frontend: Vite + React (`frontend/` folder)
- Tests: `pytest` + `pytest-django`

Estructura relevante
- `manage.py` — CLI Django
- `sismepa/` — settings, urls, wsgi/asgi
- `gestion/` — app principal: modelos, views, serializers, utils, tasks, tests
  - `gestion/utils/sendgrid_utils.py` — util para enviar correos via SendGrid
  - `gestion/tasks.py` — abstracción de tarea: usa Huey si está disponible, fallback a hilo
  - `gestion/tests/` — tests del app
- `frontend/` — Vite + React app (dev server en `http://localhost:5173` por defecto)

Archivos nuevos/actualizados (importante)
- `gestion/tasks.py`: encola `send_alert_task(...)` usando Huey o hilo de fallback.
- `gestion/utils/sendgrid_utils.py`: permite `async_send=False` (útil para tests) y por defecto usa hilo para envíos.
- `frontend/src/components/*`: componentes mínimos `Login`, `AdminPanel`, `DocentePanel`, `EstudiantePanel`.

Cómo configurar y ejecutar (Windows PowerShell)

1) Crear y activar virtualenv (recomendado):
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

2) Instalar dependencias (incluye opcionales `huey`/`redis`):
```powershell
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

3) Migraciones y crear superusuario:
```powershell
python manage.py migrate
python manage.py createsuperuser
```

4) Correr servidor de desarrollo Django:
```powershell
python manage.py runserver
```

5) Frontend (desde `frontend/`):
```powershell
cd frontend
npm install
npm run dev
```

Habilitar Huey (opcional)
- Si desea procesar tareas con Huey/Redis en vez del fallback de hilos:
  - Instalar Redis y ejecutar un servidor Redis
  - Asegurarse de que `redis` y `huey` estén instalados (`requirements.txt` incluye versiones sugeridas)
  - Ejecutar worker Huey (ejemplo):
```powershell
# Usando el paquete Huey (ajustar nombre de módulo según configuración)
huey_consumer.py gestion.tasks.HUEY
```

Notas sobre organización de archivos
- Archivos de utilidad y tareas están en `gestion/utils` y `gestion/tasks.py`.
- Tests se encuentran en `gestion/tests/`.
- Media/uploads se sirven automáticamente en `DEBUG=True` desde `MEDIA_URL`/`MEDIA_ROOT` (ver `sismepa/urls.py`).

Pruebas
- Ejecutar tests:
```powershell
.venv\Scripts\python.exe -m pytest -q
```

Si necesitas que configure Huey + Redis de forma automática (por ejemplo crear docker-compose para Redis + Huey worker), dímelo y lo preparo.

Contacto rápido
- Archivos clave: `gestion/models.py`, `gestion/views.py`, `gestion/serializers.py`, `gestion/utils/sendgrid_utils.py`, `gestion/tasks.py`, `sismepa/settings.py`.

*** Fin README
# Instrucciones para ejecutar con Docker Compose

Este repositorio contiene una aplicación Django (ubicada en la raíz) y una configuración de `docker-compose` para levantar una base de datos PostgreSQL y el backend.

Archivos añadidos:
- `docker-compose.yml` — definición de servicios `db`, `backend` y `frontend` (el servicio `backend` usa el contexto `.` para integrarse con la estructura actual del repo).
- `Dockerfile` — Dockerfile para el backend Django.
- `.dockerignore` — archivos excluidos del contexto de build.

Pasos rápidos (PowerShell en Windows):

1) Construir y levantar servicios en foreground:

```powershell
docker-compose up --build
```

2) (Primera ejecución) Aplicar migraciones desde el contenedor backend:

```powershell
docker-compose run --rm backend python manage.py migrate
```

3) Crear superusuario (opcional):

```powershell
docker-compose run --rm backend python manage.py createsuperuser
```

Notas y recomendaciones:
- El `docker-compose.yml` creado asume que el código Django está en la raíz del repositorio (donde está `manage.py`). Si prefieres un subdirectorio `backend/`, actualiza el `build` y los volúmenes del servicio `backend` a `./backend` y mueve el código.
- El servicio `frontend` apunta a `./frontend`. Si no tienes aún un frontend, puedes crear una app (por ejemplo con Create React App) dentro de `frontend/` o eliminar/ajustar ese servicio.
- La variable `DATABASE_URL` está fijada para usar el servicio `db` de Docker Compose. Para entornos de producción cambia la contraseña y otras configuraciones.
- Si `requirements.txt` tiene `psycopg2` en lugar de `psycopg2-binary`, el Dockerfile instala `libpq-dev` y herramientas de compilación para compilar la dependencia.

Si quieres, puedo:
- Ajustar `docker-compose.yml` para ejecutar migraciones automáticamente al arrancar.
- Crear un `frontend/` mínimo (React) para que el `frontend` build funcione.

---

**Local setup (rápido)**

Recomendado: usar el `venv` incluido en este repo para desarrollo.

PowerShell (Windows) — pasos mínimos:
```powershell
# Crear/activar entorno virtual (si no existe)
python -m venv .venv
.venv\Scripts\Activate.ps1

# Actualizar pip e instalar dependencias
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# Aplicar migraciones y crear superusuario
python manage.py migrate
python manage.py createsuperuser

# Ejecutar servidor Django
python manage.py runserver

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

Notas de seguridad:
- Crea un archivo `.env` desde `.env.example` con `SECRET_KEY` y otras variables sensibles, y nunca subas `.env` al repositorio.
- Para eliminar archivos sensibles ya commiteados (ej. `venv/`, `db.sqlite3`), puedes usar `git rm --cached <archivo>` seguido de commit, o reescribir historial con `git filter-repo`/BFG (esta última opción es destructiva; pídeme que la ejecute y la preparo).

Si quieres, hago los commits locales con los cambios y limpio los archivos rastreados en git. Si prefieres que reescriba el historial para eliminar por completo archivos previamente commiteados, confírmamelo y lo hago (esto sobrescribirá commits pasados y necesitarás forzar push al remoto).
