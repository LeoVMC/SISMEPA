# ==============================================================================
# SISMEPA Backend - Dockerfile
# ==============================================================================
# Imagen base: Python 3.11 slim (Debian)
# ==============================================================================

FROM python:3.11-slim

# Variables de entorno para Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Instalar dependencias del sistema necesarias
# - build-essential, gcc: compilación de paquetes Python
# - libpq-dev: cliente PostgreSQL (para psycopg)
# - libmagic1: detección de tipos MIME (para python-magic)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copiar requirements e instalar dependencias Python
COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip==24.3.1 \
    && pip install -r /app/requirements.txt

# Copiar el código de la aplicación
COPY . /app

# Crear directorio para archivos media
RUN mkdir -p /app/media

# Copiar y configurar entrypoint
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Puerto del servidor Django
EXPOSE 8000

# Entrypoint ejecuta migraciones antes de iniciar
ENTRYPOINT ["/app/entrypoint.sh"]

# Comando por defecto: servidor de desarrollo Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
