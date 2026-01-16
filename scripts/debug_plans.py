"""
Script para depurar planificaciones.
Ejecutar desde la raíz del proyecto: python scripts/debug_plans.py
"""
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
sys.path.insert(0, PROJECT_ROOT)

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sismepa.settings')
django.setup()

from gestion.models import Asignatura, Planificacion, Programa
from django.contrib.auth.models import User

def debug_plans():
    print("--- Debugging Planificacion ---")
    
    try:
        math_i = Asignatura.objects.get(codigo='MAT-21215')
        print(f"Asignatura found: {math_i}")
        plans = Planificacion.objects.filter(asignatura=math_i)
        print(f"Number of plans for Math I: {plans.count()}")
        for p in plans:
            print(f"  - Plan ID: {p.id}, File: {p.archivo}, Uploaded by: {p.uploaded_by}")
    except Asignatura.DoesNotExist:
        print("Math I not found!")

    print("\n--- All Plans ---")
    all_plans = Planificacion.objects.all()
    for p in all_plans:
        print(f"Plan ID: {p.id}, Subject: {p.asignatura.codigo}, File: {p.archivo}")

if __name__ == '__main__':
    debug_plans()
