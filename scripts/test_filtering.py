"""
Script para probar filtrado de API.
Ejecutar desde la raíz del proyecto: python scripts/test_filtering.py
"""
import os
import sys

# Agregar directorio raíz del proyecto al path (funciona desde cualquier ubicación)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
sys.path.insert(0, PROJECT_ROOT)

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sismepa.settings')
django.setup()

from django.conf import settings
from rest_framework.test import APIClient
from django.contrib.auth.models import User


def test_api_filtering():
    print("--- Probando Filtrado de API ---")
    client = APIClient()
    
    # Autenticar como admin
    admin = User.objects.get(username='admin')
    client.force_authenticate(user=admin)
    
    # 1. Probar filtro de Matemática I
    print("Obteniendo planificaciones para MAT-21215...")
    response = client.get('/api/planificaciones/', {'asignatura__codigo': 'MAT-21215'})
    if response.status_code == 200:
        data = response.json()
        print(f"Cantidad: {len(data)}")
        for item in data:
            print(f" - ID: {item['id']}, Asignatura: {item['asignatura']}")
    else:
        print(f"Error: {response.status_code}")
        # Intentar extraer error básico del HTML
        content = response.content.decode('utf-8')
        if "Exception Value:" in content:
             print(content.split("Exception Value:")[1].split("</pre>")[0])
        else:
             print(content[:500])


if __name__ == '__main__':
    test_api_filtering()
