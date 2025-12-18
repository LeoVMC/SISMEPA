"""
Script para crear asignaturas iniciales.
Ejecutar desde la raíz del proyecto: python scripts/init_subjects.py
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

from gestion.models import Programa, Asignatura

def create_subjects():
    try:
        programa = Programa.objects.get(nombre_programa="Ingeniería de Sistemas")
    except Programa.DoesNotExist:
        print("Error: El programa 'Ingeniería de Sistemas' no existe.")
        return

    subjects_data = [
        # Semestre I
        {'code': 'MAT-21215', 'name': 'MATEMÁTICA I', 'uc': 5, 'semestre': 1},
        {'code': 'MAT-21524', 'name': 'GEOMETRÍA ANALÍTICA', 'uc': 4, 'semestre': 1},
        {'code': 'ADG-25123', 'name': 'HOMBRE, SOCIEDAD, CIENCIA Y TEC.', 'uc': 3, 'semestre': 1},
        {'code': 'MAT-21212', 'name': 'DIBUJO', 'uc': 2, 'semestre': 1},
        {'code': 'ADG-25132', 'name': 'EDUCACIÓN AMBIENTAL', 'uc': 2, 'semestre': 1},
        {'code': 'IDM-24113', 'name': 'INGLÉS I', 'uc': 3, 'semestre': 1},
        {'code': 'AC-1', 'name': 'ACTIVIDAD COMPLEMENTARIA (CULTURAL)', 'uc': 0, 'semestre': 1},
        {'code': 'ADG-25131', 'name': 'SEMINARIO I', 'uc': 1, 'semestre': 1},
        {'code': 'DIN-21113', 'name': 'DEFENSA INTEGRAL DE LA NACIÓN I', 'uc': 3, 'semestre': 1},
        # Semestre II
        {'code': 'MAT-21225', 'name': 'MATEMÁTICA II', 'uc': 5, 'semestre': 2},
        {'code': 'QUF-23015', 'name': 'FÍSICA I', 'uc': 5, 'semestre': 2},
        {'code': 'AC-2', 'name': 'ACTIVIDAD COMPLEMENTARIA (DEPORTIVA)', 'uc': 0, 'semestre': 2},
        {'code': 'MAT-21114', 'name': 'ÁLGEBRA LINEAL', 'uc': 4, 'semestre': 2},
        {'code': 'QUF-22014', 'name': 'QUÍMICA GENERAL', 'uc': 4, 'semestre': 2},
        {'code': 'IDM-24123', 'name': 'INGLÉS II', 'uc': 3, 'semestre': 2},
        {'code': 'AC-3', 'name': 'ACTIVIDAD COMPLEMENTARIA (CULTURAL)', 'uc': 0, 'semestre': 2},
        {'code': 'ADG-25141', 'name': 'SEMINARIO II', 'uc': 1, 'semestre': 2},
        {'code': 'DIN-21123', 'name': 'DEFENSA INTEGRAL DE LA NACIÓN II', 'uc': 3, 'semestre': 2},
    ]

    for sub in subjects_data:
        Asignatura.objects.get_or_create(
            codigo=sub['code'],
            defaults={
                'nombre_asignatura': sub['name'],
                'creditos': sub['uc'],
                'semestre': sub['semestre'],
                'programa': programa
            }
        )
        print(f"Asignatura {sub['code']} procesada.")

if __name__ == "__main__":
    create_subjects()
