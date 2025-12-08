import os
import sys
sys.path.append('/app')
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
