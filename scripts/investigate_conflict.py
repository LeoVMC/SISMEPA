import os
import sys
import django
from datetime import date

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sismepa.settings')
django.setup()

from gestion.models import Estudiante, DetalleInscripcion, PeriodoAcademico, Seccion

def run_investigation():
    print("--- INVESTIGACION DE CHOQUE DE HORARIO ---")
    
    # 1. Obtener última inscripción (la que causó el problema/reporte)
    last_detalle = DetalleInscripcion.objects.order_by('-id').first()
    
    if not last_detalle:
        print("No hay inscripciones registradas en la BD.")
        return

    estudiante = last_detalle.inscripcion.estudiante
    periodo = last_detalle.inscripcion.periodo
    
    print(f"Estudiante: {estudiante} (ID: {estudiante.id})")
    print(f"Periodo: {periodo} (Activo: {periodo.activo})")

    # 2. Listar TODAS las materias 'CURSANDO' de este estudiante en este periodo
    inscripciones = DetalleInscripcion.objects.filter(
        inscripcion__estudiante=estudiante,
        inscripcion__periodo=periodo,
        estatus='CURSANDO'
    )
    
    print(f"\nMaterias Inscritas actualmente ({inscripciones.count()}):")
    
    schedules = []
    
    for det in inscripciones:
        sec = det.seccion
        asig = det.asignatura
        print(f"[{det.id}] {asig.nombre_asignatura} - Seccion {sec.codigo_seccion if sec else 'N/A'}")
        
        if sec:
            horarios = sec.horarios.all()
            for h in horarios:
                print(f"    -> Día {h.dia} ({h.get_dia_display()}): {h.hora_inicio} - {h.hora_fin}")
                schedules.append({
                    'id': det.id,
                    'asig': asig.nombre_asignatura,
                    'sec': sec.codigo_seccion,
                    'dia': h.dia,
                    'start': h.hora_inicio,
                    'end': h.hora_fin
                })
        else:
            print("    -> SIN SECCION ASIGNADA")

    # 3. Simular chequeo de conflictos entre ellas
    print("\n--- Verificando Cruzamientos Internos ---")
    conflict_found = False
    for i in range(len(schedules)):
        for j in range(i + 1, len(schedules)):
            s1 = schedules[i]
            s2 = schedules[j]
            
            # Chequeo MISMO DIA
            if s1['dia'] == s2['dia']:
                # Chequeo OVERLAP
                # (StartA < EndB) and (EndA > StartB)
                if (s1['start'] < s2['end']) and (s1['end'] > s2['start']):
                    print(f"¡CHOQUE DETECTADO OFF-LINE!")
                    print(f"   {s1['asig']} ({s1['sec']}) vs {s2['asig']} ({s2['sec']})")
                    print(f"   Día {s1['dia']}: {s1['start']}-{s1['end']} vs {s2['start']}-{s2['end']}")
                    conflict_found = True

    # 4. Busqueda especifica de "Educacion Ambiental"
    print("\n--- Buscando 'Educacion Ambiental' ---")
    edu_amb = DetalleInscripcion.objects.filter(
        inscripcion__estudiante=estudiante,
        asignatura__nombre_asignatura__icontains="AMBIENTAL"
    )
    
    if edu_amb.exists():
        for det in edu_amb:
            print(f"Encontrada: {det.asignatura.nombre_asignatura}")
            print(f"   Periodo: {det.inscripcion.periodo.nombre_periodo} (Activo: {det.inscripcion.periodo.activo})")
            print(f"   Estatus: {det.estatus}")
            if det.seccion:
                print(f"   Seccion: {det.seccion.codigo_seccion}")
                for h in det.seccion.horarios.all():
                    print(f"      -> Día {h.dia}: {h.hora_inicio} - {h.hora_fin}")
            else:
                print("   SIN SECCION")
    else:
        print("No se encontró ninguna inscripción en 'Educacion Ambiental' para este estudiante.")

    # 4. Verificar permisos del usuario
    user = estudiante.usuario
    print(f"\nUsuario: {user.username}")
    print(f"Superuser: {user.is_superuser}")
    print(f"Groups: {[g.name for g in user.groups.all()]}")

if __name__ == '__main__':
    run_investigation()
