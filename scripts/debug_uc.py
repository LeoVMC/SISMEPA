import os
import sys
import django
from django.db.models import Sum

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sismepa.settings')
django.setup()

from gestion.models import Estudiante, DetalleInscripcion, PeriodoAcademico

def run_debug():
    print("--- DEBUG UC COUNT ---")
    
    estudiante = Estudiante.objects.get(id=2)
    periodo = PeriodoAcademico.objects.filter(activo=True).first()
    
    print(f"Estudiante: {estudiante} (ID: 2)")
    print(f"Periodo Activo: {periodo}")
    
    if not periodo:
        print("FATAL: No periodo activo.")
        return

    total_query = DetalleInscripcion.objects.filter(
        inscripcion__estudiante=estudiante,
        inscripcion__periodo=periodo
    ).aggregate(t=Sum('asignatura__creditos'))['t']
    
    print(f"\nQUERY RESULT (Total UC): {total_query}")
    
    detalles = DetalleInscripcion.objects.filter(
        inscripcion__estudiante=estudiante,
        inscripcion__periodo=periodo
    )
    
    print(f"\nDesglose ({detalles.count()} materias):")
    calculated_sum = 0
    for d in detalles:
        creditos = d.asignatura.creditos
        row = f"- {d.asignatura.nombre_asignatura} ({d.estatus}): {creditos} UC"
        if d.seccion:
            row += f" [Seccion: {d.seccion.codigo_seccion}]"
        else:
            row += " [SIN SECCION]"
            
        print(row)
        calculated_sum += creditos

    print(f"\nSuma Calculada Manualmente: {calculated_sum}")
    
    if total_query == calculated_sum:
        print("STATUS: Consistency OK.")
    else:
        print("STATUS: INCONSISTENCY DETECTED.")

if __name__ == '__main__':
    run_debug()
