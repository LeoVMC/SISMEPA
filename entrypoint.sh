#!/bin/sh
set -e

echo "Esperando a la base de datos..."
python - <<'PY'
import os, time
from urllib.parse import urlparse
import psycopg

DATABASE_URL = os.getenv('DATABASE_URL', 'postgres://unefa_user:secure_password@db:5432/unefa_monitoring_db')
u = urlparse(DATABASE_URL)
host = u.hostname or 'db'
port = u.port or 5432
user = u.username
password = u.password
dbname = u.path.lstrip('/') or 'postgres'

for i in range(60):
    try:
        conn = psycopg.connect(host=host, port=port, user=user, password=password, dbname=dbname, connect_timeout=2)
        conn.close()
        print('Base de datos disponible')
        break
    except Exception:
        print('DB no lista, reintentando...')
        time.sleep(2)
else:
    print('No fue posible conectar con la base de datos', flush=True)
    raise SystemExit(1)
PY

echo "Ejecutando migraciones..."
python manage.py migrate --noinput

echo "Iniciando servidor..."
exec "$@"
