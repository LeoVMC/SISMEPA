"""
Script maestro para poblar todo el sistema SISMEPA con datos de prueba robustos.
"""
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
sys.path.insert(0, PROJECT_ROOT)

import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sismepa.settings")
django.setup()

from django.contrib.auth.models import User, Group
from gestion.models import Programa, Asignatura, PeriodoAcademico, Seccion, Estudiante, Docente, Inscripcion, DetalleInscripcion, Horario
from scripts import recreate_pensum, populate_telecom
import datetime
import random

def run():
    print("=== INICIANDO POBLACIÓN DEL SISTEMA ===")
    
    print(">>> 0. Limpiando datos previos para evitar conflictos...")
    DetalleInscripcion.objects.all().delete()
    Inscripcion.objects.all().delete()
    Seccion.objects.all().delete()
    Horario.objects.all().delete()
    print("Datos de inscripciones y secciones limpiados.")
    
    print("\n>>> 1. Cargando Pensums...")
    populate_telecom.run()
    recreate_pensum.run()

    print("\n>>> 2. Creando Periodo Académico...")
    periodo, _ = PeriodoAcademico.objects.get_or_create(
        nombre_periodo="1-2026",
        defaults={
            "fecha_inicio": datetime.date(2026, 1, 15),
            "fecha_fin": datetime.date(2026, 6, 15),
            "activo": True,
            "inscripciones_activas": True,
            "anio": 2026
        }
    )
    PeriodoAcademico.objects.exclude(id=periodo.id).update(activo=False)
    print(f"Periodo Activo: {periodo}")

    print("\n>>> 3. Creando Docentes...")
    docentes = []
    for i in range(1, 4):
        cedula = f"V-{15000000+i}" # Formato cedula V-1500000X
        user, created = User.objects.get_or_create(username=cedula, defaults={
            'first_name': f'Profesor {i}', 'last_name': 'Test', 'email': f'docente{i}@unefa.edu.ve'
        })
        if created: user.set_password('123456'); user.save()
        
        docente, _ = Docente.objects.get_or_create(
            usuario=user,
            defaults={'cedula': cedula, 'telefono': '0414-0000000'}
        )
        docentes.append(docente)
        
        g, _ = Group.objects.get_or_create(name='Docente')
        user.groups.add(g)
    print(f"{len(docentes)} docentes creados/verificados.")

    print("\n>>> 4. Creando Estudiantes...")
    prog_sistemas = Programa.objects.get(nombre_programa="Ingeniería de Sistemas")
    prog_telecom = Programa.objects.get(nombre_programa="Ingeniería de Telecomunicaciones")

    estudiantes_data = [
        ("V-20000001", "Estudiante", "Sistemas", prog_sistemas, "V-20000001"),
        ("V-20000002", "Estudiante", "Telecom", prog_telecom, "V-20000002"),
    ]

    estudiantes_objs = []
    for user_pre, nom, ape, prog, ced in estudiantes_data:
        user, created = User.objects.get_or_create(username=user_pre, defaults={
            'first_name': nom, 'last_name': ape, 'email': f'{user_pre}@unefa.edu.ve'
        })
        if created: user.set_password('123456'); user.save()
        
        est, _ = Estudiante.objects.get_or_create(
            usuario=user,
            defaults={'programa': prog, 'cedula': ced, 'telefono': '0412-0000000'}
        )
        estudiantes_objs.append(est)
        
        g, _ = Group.objects.get_or_create(name='Estudiante')
        user.groups.add(g)

    print(f"{len(estudiantes_objs)} estudiantes creados/verificados.")

    print("\n>>> 5. Abriendo Secciones para Semestre 1...")
    asignaturas_sist = Asignatura.objects.filter(programa=prog_sistemas, semestre=1)
    asignaturas_tel = Asignatura.objects.filter(programa=prog_telecom, semestre=1)
    
    secciones_creadas = []
    
    for asig in asignaturas_sist:
        sec, _ = Seccion.objects.get_or_create(
            asignatura=asig,
            codigo_seccion="D1",
            defaults={'docente': random.choice(docentes).usuario}
        )
        secciones_creadas.append(sec)
        Horario.objects.get_or_create(seccion=sec, dia=1, hora_inicio=datetime.time(7,0), hora_fin=datetime.time(9,30), aula="A-10")

    for asig in asignaturas_tel:
        sec, _ = Seccion.objects.get_or_create(
            asignatura=asig,
            codigo_seccion="D1",
            defaults={'docente': random.choice(docentes).usuario}
        )
        secciones_creadas.append(sec)
        Horario.objects.get_or_create(seccion=sec, dia=2, hora_inicio=datetime.time(7,0), hora_fin=datetime.time(9,30), aula="B-20")

    print(f"{len(secciones_creadas)} secciones abiertas.")

    print("\n>>> 6. Inscribiendo Estudiantes...")
    
    est_sis = estudiantes_objs[0]
    insc_sis, _ = Inscripcion.objects.get_or_create(estudiante=est_sis, periodo=periodo)
    for sec in secciones_creadas:
        if sec.asignatura.programa == prog_sistemas:
            DetalleInscripcion.objects.get_or_create(
                inscripcion=insc_sis,
                asignatura=sec.asignatura,
                defaults={'seccion': sec, 'estatus': 'CURSANDO'}
            )

    est_tel = estudiantes_objs[1]
    insc_tel, _ = Inscripcion.objects.get_or_create(estudiante=est_tel, periodo=periodo)
    for sec in secciones_creadas:
        if sec.asignatura.programa == prog_telecom:
            DetalleInscripcion.objects.get_or_create(
                inscripcion=insc_tel,
                asignatura=sec.asignatura,
                defaults={'seccion': sec, 'estatus': 'CURSANDO'}
            )

    print("Inscripciones realizadas.")

    print("\n>>> 7. Creando Administrador con Cédula...")
    admin_cedula = "V-10000001"
    admin_user, created = User.objects.get_or_create(username=admin_cedula, defaults={
        'first_name': 'Administrador', 'last_name': 'Principal', 'email': 'admin.frontend@unefa.edu.ve',
        'is_staff': True, 'is_superuser': True
    })
    if created: 
        admin_user.set_password('123456')
        admin_user.save()
        
        from gestion.models import Administrador
        Administrador.objects.get_or_create(usuario=admin_user, defaults={'cedula': admin_cedula, 'telefono': '0412-0000000'})
        
        g, _ = Group.objects.get_or_create(name='Administrador')
        admin_user.groups.add(g)
    print(f"Administrador {admin_cedula} creado.")
    print("\n=== POBLACIÓN COMPLETADA EXITOSAMENTE ===")
    print("Usuarios creados (pass: 123456):")
    print("- Admin (Backend): admin")
    print("- Admin (Frontend): V-10000001")
    print("- Docente: V-15000001")
    print("- Estudiante Sistemas: V-20000001")
    print("- Estudiante Telecom: V-20000002")

if __name__ == "__main__":
    run()
