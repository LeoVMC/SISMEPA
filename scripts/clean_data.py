"""
Script para limpiar datos de prueba.
Ejecutar desde la raíz del proyecto: python scripts/clean_data.py
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

from gestion.models import Planificacion

def clean_data():
    try:
        p = Planificacion.objects.get(pk=1)
        print(f"Deleting Plan {p.id} linked to {p.asignatura.nombre_asignatura} ({p.asignatura.codigo})")
        p.delete()
        print("Deleted.")
    except Planificacion.DoesNotExist:
        print("Plan 1 not found.")

if __name__ == '__main__':
    clean_data()
