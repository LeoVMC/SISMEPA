import os
import sys
import django

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sismepa.settings')
django.setup()

from django.contrib.auth.models import User, Group
from gestion.models import Seccion

def debug_docente():
    print("--- 1. Checking 'Docente' Group ---")
    try:
        group = Group.objects.get(name='Docente')
        print(f"Group 'Docente' exists. Users count: {group.user_set.count()}")
        for u in group.user_set.all():
            print(f" - {u.username} (ID: {u.id})")
    except Group.DoesNotExist:
        print("❌ Group 'Docente' DOES NOT EXIST! This is likely the cause.")
        print("Available Groups:")
        for g in Group.objects.all():
            print(f" - {g.name}")

    print("\n--- 2. Checking Seccion Assignments ---")
    secciones = Seccion.objects.exclude(docente__isnull=True)
    print(f"Found {secciones.count()} sections with assigned docente.")
    
    for s in secciones[:10]:
        docente = s.docente
        print(f"Section {s.codigo_seccion} ({s.asignatura.nombre_asignatura}): Assigned to {docente.username} (ID: {docente.id})")
        if docente.groups.filter(name='Docente').exists():
             print(f"   -> User {docente.username} IS in 'Docente' group.")
        else:
             print(f"   -> ⚠️ User {docente.username} is NOT in 'Docente' group!")
             print(f"      Groups: {[g.name for g in docente.groups.all()]}")
             
    print("\n--- 3. Checking for mismatched ID logic ---")
    pass

if __name__ == "__main__":
    debug_docente()
