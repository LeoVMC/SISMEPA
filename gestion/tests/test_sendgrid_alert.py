import pytest
from django.contrib.auth.models import User
from gestion.models import Estudiante, Programa


def test_calcular_avance_triggers_sendgrid(monkeypatch, db):
    user = User.objects.create_user(username='testuser', password='pass', email='test@example.com', first_name='Test')
    programa = Programa.objects.create(nombre_programa='Ing. Prueba', titulo_otorgado='Ingeniero', duracion_anios=5)
    estudiante = Estudiante.objects.create(usuario=user, programa=programa, cedula='V-000', telefono='000')
    from gestion.models import Asignatura
    Asignatura.objects.create(programa=programa, nombre_asignatura='Intro', codigo='I101', creditos=3, semestre=1)

    called = {'ok': False, 'args': None}

    def fake_send_alert_task(to_email, subject, html_content):
        called['ok'] = True
        called['args'] = (to_email, subject, html_content)
        return True

    monkeypatch.setattr('gestion.tasks.send_alert_task', fake_send_alert_task)

    porcentaje = estudiante.calcular_avance()
    assert isinstance(porcentaje, float) or isinstance(porcentaje, int)
    assert called['ok'] is True
    assert called['args'][0] == 'test@example.com'
