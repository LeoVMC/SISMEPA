"""
Script para corregir prelaciones de Servicio Comunitario.
Elimina la prelación de Taller de Servicio Comunitario sobre Proyecto de Servicio Comunitario.
Ejecutar desde la raíz: python scripts/fix_community_prereq.py
"""
import os
import sys
import django

# Setup Django Environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sismepa.settings")
django.setup()

from gestion.models import Asignatura

def run():
    print("Fixing Community Service Prerequisites...")
    
    # Buscar asignaturas
    proyectos = Asignatura.objects.filter(nombre_asignatura__icontains="PROYECTO DE SERVICIO COMUNITARIO")
    talleres = Asignatura.objects.filter(nombre_asignatura__icontains="TALLER DE SERVICIO COMUNITARIO")
    
    if not proyectos.exists():
        print("No se encontró la asignatura 'Proyecto de Servicio Comunitario'.")
        return

    count = 0
    for proyecto in proyectos:
        # Check prerequisites
        prereqs = proyecto.prelaciones.all()
        for prereq in prereqs:
            if "TALLER DE SERVICIO COMUNITARIO" in prereq.nombre_asignatura.upper():
                print(f"Eliminando prelación: {prereq.nombre_asignatura} -> {proyecto.nombre_asignatura}")
                proyecto.prelaciones.remove(prereq)
                count += 1
                
    if count > 0:
        print(f"✅ Se eliminaron {count} prelaciones incorrectas.")
    else:
        print("ℹ️ No se encontraron prelaciones incorrectas para eliminar.")

if __name__ == "__main__":
    run()
