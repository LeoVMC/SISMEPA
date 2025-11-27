import io
from django.contrib.auth.models import User, Group
from rest_framework.test import APIClient
from gestion.models import Programa, Asignatura, Estudiante
from django.conf import settings


def setup_groups():
    for g in ['Estudiante', 'Docente', 'Administrador']:
        Group.objects.get_or_create(name=g)


def test_reject_large_pensum(db):
    setup_groups()
    admin = User.objects.create_user('adminv', password='pass')
    g = Group.objects.get(name='Administrador')
    admin.groups.add(g)

    prog = Programa.objects.create(nombre_programa='P', titulo_otorgado='T', duracion_anios=4)

    client = APIClient()
    client.login(username='adminv', password='pass')

    # Create large file > MAX_UPLOAD_SIZE
    big = io.BytesIO(b'a' * (settings.MAX_UPLOAD_SIZE + 1))
    big.name = 'big.pdf'

    resp = client.post('/api/pensums/', {'programa': prog.id, 'archivo': big}, format='multipart')
    assert resp.status_code == 400


def test_reject_wrong_extension_planificacion(db):
    setup_groups()
    docente = User.objects.create_user('docv', password='pass')
    g = Group.objects.get(name='Docente')
    docente.groups.add(g)

    prog = Programa.objects.create(nombre_programa='P', titulo_otorgado='T', duracion_anios=4)
    asig = Asignatura.objects.create(programa=prog, nombre_asignatura='A', codigo='A99', creditos=3, semestre=1)

    client = APIClient()
    client.login(username='docv', password='pass')

    bad = io.BytesIO(b'content')
    bad.name = 'plan.exe'

    resp = client.post('/api/planificaciones/', {'asignatura': asig.id, 'archivo': bad}, format='multipart')
    assert resp.status_code == 400
