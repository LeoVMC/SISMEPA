"""
Script para crear datos iniciales (programas).
Ejecutar desde la raíz del proyecto: python scripts/init_data.py
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

from gestion.models import Programa

def create_initial_data():
    if not Programa.objects.filter(nombre_programa="Ingeniería de Sistemas").exists():
        Programa.objects.create(
            nombre_programa="Ingeniería de Sistemas",
            titulo_otorgado="Ingeniero de Sistemas",
            duracion_anios=5
        )
        print("Programa 'Ingeniería de Sistemas' creado exitosamente.")
    else:
        print("El programa ya existe.")

if __name__ == "__main__":
    create_initial_data()
