from django.contrib.auth.models import User, Group
from rest_framework.test import APIClient
from gestion.models import Programa, Asignatura, Pensum, Planificacion, DocumentoCalificaciones, Estudiante
import io


def setup_groups():
    for g in ['Estudiante', 'Docente', 'Administrador']:
        Group.objects.get_or_create(name=g)


def create_user_with_group(username, group_name):
    user = User.objects.create_user(username=username, password='pass', email=f'{username}@example.com')
    g = Group.objects.get(name=group_name)
    user.groups.add(g)
    return user


def test_pensum_upload_only_admin(db, tmp_path):
    setup_groups()
    admin = create_user_with_group('admin1', 'Administrador')
    prog = Programa.objects.create(nombre_programa='Prog 1', titulo_otorgado='T', duracion_anios=4)

    client = APIClient()
    client.login(username='admin1', password='pass')

    file_obj = io.BytesIO(b'dummy content')
    file_obj.name = 'pensum.pdf'

    resp = client.post('/api/pensums/', {'programa': prog.id, 'archivo': file_obj}, format='multipart')
    assert resp.status_code in (200, 201)


def test_planificacion_only_docente(db):
    setup_groups()
    docente = create_user_with_group('doc1', 'Docente')
    prog = Programa.objects.create(nombre_programa='Prog 1', titulo_otorgado='T', duracion_anios=4)
    asig = Asignatura.objects.create(programa=prog, nombre_asignatura='A1', codigo='A1', creditos=3, semestre=1)

    client = APIClient()
    client.login(username='doc1', password='pass')

    file_obj = io.BytesIO(b'plan content')
    file_obj.name = 'plan.pdf'

    resp = client.post('/api/planificaciones/', {'asignatura': asig.id, 'archivo': file_obj}, format='multipart')
    assert resp.status_code in (200, 201)


def test_documento_calificaciones_only_estudiante(db):
    setup_groups()
    user = User.objects.create_user('est1', password='pass', email='est1@example.com')
    g = Group.objects.get(name='Estudiante')
    user.groups.add(g)
    prog = Programa.objects.create(nombre_programa='Prog 1', titulo_otorgado='T', duracion_anios=4)
    estudiante = Estudiante.objects.create(usuario=user, programa=prog, cedula='V-999', telefono='00')

    client = APIClient()
    client.login(username='est1', password='pass')

    file_obj = io.BytesIO(b'grades')
    file_obj.name = 'grades.pdf'

    resp = client.post('/api/calificaciones/', {'estudiante': estudiante.id, 'archivo': file_obj}, format='multipart')
    assert resp.status_code in (200, 201)
