# SISMEPA - Sistema de Monitoreo de Avance Educativo Universitario y Prelaciones Académicas

Sistema web para el seguimiento y monitoreo del avance académico de estudiantes universitarios.

---

## 📋 Requisitos Previos

### Desarrollo Local

| Requisito | Versión Mínima | Verificar con |
|-----------|----------------|---------------|
| Python | 3.11+ | `python --version` |
| Node.js | 18.0+ | `node --version` |
| npm | 9.0+ | `npm --version` |
| PostgreSQL | 15+ | `psql --version` |

### Con Docker (Recomendado)

| Requisito | Versión Mínima | Verificar con |
|-----------|----------------|---------------|
| Docker | 24.0+ | `docker --version` |
| Docker Compose | 2.20+ | `docker compose version` |

---

## 🚀 Instalación Rápida

### Opción 1: Docker Compose (Recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/SISMEPA.git
cd SISMEPA

# 2. Copiar archivo de variables de entorno
cp .env.example .env
# IMPORTANTE: Configurar variables EMAIL_HOST_USER y EMAIL_HOST_PASSWORD en .env para notificaciones

# 3. Construir y levantar servicios
docker compose up --build

# 4. (Primera vez) Crear superusuario
docker compose exec backend python manage.py createsuperuser

# 5. Poblado de Datos Completo (Sistemas + Telecom + Usuarios + Inscripciones)
docker compose exec backend python scripts/populate_full_system.py
```

**Acceder a:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Admin Django: http://localhost:8000/admin

---

### Opción 2: Desarrollo Local (Windows PowerShell)

#### Backend

```powershell
# 1. Crear y activar entorno virtual
python -m venv .venv
.venv\Scripts\Activate.ps1

# 2. Instalar dependencias
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# 3. Configurar variables de entorno
Copy-Item .env.example .env
# Editar .env con tus valores

# 4. Aplicar migraciones
python manage.py migrate

# 5. Crear superusuario
python manage.py createsuperuser

# 6. (Opcional) Poblar datos de prueba
python scripts/populate_telecom.py
python scripts/recreate_pensum.py

# 7. Ejecutar servidor
python manage.py runserver
```

#### Frontend

```powershell
# En otra terminal
cd frontend

# 1. Instalar dependencias
npm ci

# 2. Copiar variables de entorno
Copy-Item .env.example .env.development

# 3. Ejecutar servidor de desarrollo
npm run dev
```

---

### Opción 3: Desarrollo Local (Linux/macOS)

#### Backend

```bash
# 1. Crear y activar entorno virtual
python3 -m venv .venv
source .venv/bin/activate

# 2. Instalar dependencias
pip install --upgrade pip
pip install -r requirements.txt

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 4. Aplicar migraciones y crear superusuario
python manage.py migrate
python manage.py createsuperuser

# 5. Ejecutar servidor
python manage.py runserver
```

#### Frontend

```bash
# En otra terminal
cd frontend
npm ci
cp .env.example .env.development
npm run dev
```

---

## 📁 Estructura del Proyecto

```
SISMEPA/
├── sismepa/              # Configuración Django
│   ├── settings.py       # Configuración principal
│   └── urls.py           # Rutas de la API
├── gestion/              # App principal
│   ├── models.py         # Modelos de datos
│   ├── api/              # API REST (views, serializers)
│   ├── tests/            # Tests automatizados
│   └── utils/            # Utilidades
├── frontend/             # Aplicación React
│   ├── src/
│   │   ├── components/   # Componentes reutilizables
│   │   ├── pages/        # Páginas
│   │   └── context/      # Context API
│   └── package.json      # Dependencias npm
├── scripts/              # Scripts de utilidad
├── media/                # Archivos subidos
├── docker-compose.yml    # Orquestación Docker
├── Dockerfile            # Imagen del backend
└── requirements.txt      # Dependencias Python
```

---

## 🔧 Configuración

### Variables de Entorno

Copiar `.env.example` a `.env` y configurar:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `SECRET_KEY` | Clave secreta Django | `django-insecure-xxx` |
| `DJANGO_DEBUG` | Modo debug | `True` / `False` |
| `POSTGRES_*` | Configuración PostgreSQL | Ver `.env.example` |
| `SENDGRID_API_KEY` | API key de SendGrid | (opcional) |
| `REDIS_URL` | URL de Redis | `redis://localhost:6379/0` |

---

## 🧪 Testing

```bash
# Backend (pytest)
pytest -q

# Con cobertura
pytest --cov=gestion

# Frontend (si está configurado)
cd frontend && npm test
```

---

## 📦 Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Backend | Django 5.2 + Django REST Framework |
| Frontend | React 18 + Vite + TailwindCSS |
| Base de Datos | PostgreSQL 15 |
| Cola de Tareas | Huey + Redis |
| Containerización | Docker + Docker Compose |

---

## 👥 Roles de Usuario

- **Administrador**: Gestión completa de usuarios, pensums y reportes
- **Docente**: Visualización de estudiantes y subida de planificaciones
- **Estudiante**: Visualización de progreso académico

---

## 📝 Comandos Útiles

```bash
# Docker
docker compose up -d          # Iniciar en background
docker compose down           # Detener servicios
docker compose logs -f backend  # Ver logs del backend
docker compose exec backend python manage.py shell  # Shell Django

# Local
python manage.py makemigrations  # Crear migraciones
python manage.py migrate         # Aplicar migraciones
python manage.py createsuperuser # Crear admin
python manage.py collectstatic   # Recopilar estáticos
```

---

## 🔒 Notas de Seguridad

- **Nunca** subir el archivo `.env` al repositorio
- Cambiar `SECRET_KEY` en producción
- Usar contraseñas seguras para PostgreSQL
- Configurar `ALLOWED_HOSTS` correctamente en producción

---

## 📄 Licencia

Desarrollado por:
- Leonardo Miranda (Líder de proyecto)
- Luis Matos
- Emdrick Díaz

Correo de contacto: leonardovimica943@gmail.com

Este proyecto es de uso académico para la UNEFA, en la asignatura de Lenguajes de Programación III.
