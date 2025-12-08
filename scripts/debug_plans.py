import os
import sys
sys.path.append('/app')
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sismepa.settings')
django.setup()

from gestion.models import Asignatura, Planificacion, Programa
from django.contrib.auth.models import User

def debug_plans():
    print("--- Debugging Planificacion ---")
    
    # 1. Check Math I (MAT-21215)
    try:
        math_i = Asignatura.objects.get(codigo='MAT-21215')
        print(f"Asignatura found: {math_i}")
        plans = Planificacion.objects.filter(asignatura=math_i)
        print(f"Number of plans for Math I: {plans.count()}")
        for p in plans:
            print(f"  - Plan ID: {p.id}, File: {p.archivo}, Uploaded by: {p.uploaded_by}")
    except Asignatura.DoesNotExist:
        print("Math I not found!")

    # 2. Check all plans
    print("\n--- All Plans ---")
    all_plans = Planificacion.objects.all()
    for p in all_plans:
        print(f"Plan ID: {p.id}, Subject: {p.asignatura.codigo}, File: {p.archivo}")

if __name__ == '__main__':
    debug_plans()
