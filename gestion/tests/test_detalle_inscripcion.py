import pytest
from django.contrib.auth.models import User
from gestion.models import Programa, Asignatura, Estudiante, PeriodoAcademico, Inscripcion, DetalleInscripcion
from django.core.exceptions import ValidationError


@pytest.mark.django_db
def test_prelacion_rechaza_si_no_aprobo():
    prog = Programa.objects.create(nombre_programa='P', titulo_otorgado='T', duracion_anios=4)
    req = Asignatura.objects.create(programa=prog, codigo='REQ001', nombre_asignatura='Req', creditos=3, semestre=1)
    dep = Asignatura.objects.create(programa=prog, codigo='DEP001', nombre_asignatura='Dep', creditos=3, semestre=2)
    dep.prelaciones.add(req)

    user = User.objects.create_user(username='u1')
    est = Estudiante.objects.create(usuario=user, programa=prog, cedula='V-1', telefono='000')
    periodo = PeriodoAcademico.objects.create(nombre_periodo='1-2025', fecha_inicio='2025-01-01', fecha_fin='2025-06-01')
    ins = Inscripcion.objects.create(estudiante=est, periodo=periodo)

    detalle = DetalleInscripcion(inscripcion=ins, asignatura=dep)
    with pytest.raises(ValidationError):
        detalle.full_clean()


@pytest.mark.django_db
def test_prelacion_permite_si_aprobo():
    prog = Programa.objects.create(nombre_programa='P2', titulo_otorgado='T2', duracion_anios=4)
    req = Asignatura.objects.create(programa=prog, codigo='REQ002', nombre_asignatura='Req2', creditos=3, semestre=1)
    dep = Asignatura.objects.create(programa=prog, codigo='DEP002', nombre_asignatura='Dep2', creditos=3, semestre=2)
    dep.prelaciones.add(req)

    user = User.objects.create_user(username='u2')
    est = Estudiante.objects.create(usuario=user, programa=prog, cedula='V-2', telefono='000')
    periodo = PeriodoAcademico.objects.create(nombre_periodo='1-2025', fecha_inicio='2025-01-01', fecha_fin='2025-06-01')
    ins = Inscripcion.objects.create(estudiante=est, periodo=periodo)

    ins2 = Inscripcion.objects.create(estudiante=est, periodo=periodo)
    detalle_req = DetalleInscripcion.objects.create(inscripcion=ins2, asignatura=req, nota_final=12.0, estatus='APROBADO')

    detalle_dep = DetalleInscripcion(inscripcion=ins, asignatura=dep)
    detalle_dep.full_clean()
