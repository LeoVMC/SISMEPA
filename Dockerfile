FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Instalar dependencias del sistema necesarias para psycopg2 y compilación
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev gcc libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar paquetes
COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip
RUN pip install -r /app/requirements.txt

# Copiar el código de la aplicación
COPY . /app

EXPOSE 8000

# Copiar entrypoint y darle permisos
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
