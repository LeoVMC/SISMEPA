from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.contrib.auth.models import Group

try:
    # allauth signal
    from allauth.account.signals import user_signed_up
except Exception:
    user_signed_up = None


@receiver(post_migrate)
def create_default_roles(sender, **kwargs):
    """Create default role groups after migrations run."""
    try:
        Group.objects.get_or_create(name='Estudiante')
        Group.objects.get_or_create(name='Docente')
        Group.objects.get_or_create(name='Administrador')
    except Exception:
        # Ignore errors during early setup
        pass


if user_signed_up is not None:
    @receiver(user_signed_up)
    def assign_default_group(request, user, **kwargs):
        """Assign the `Estudiante` group to newly registered users by default."""
        try:
            grupo, _ = Group.objects.get_or_create(name='Estudiante')
            user.groups.add(grupo)
        except Exception:
            # don't break registration flow if DB not ready
            pass

# --- Notification Signals ---

from django.db.models.signals import post_save
from gestion.models import PeriodoAcademico, DetalleInscripcion, Seccion
from gestion.notifications import notify_student_period_start, notify_student_risk, notify_docente_assignment

@receiver(post_save, sender=PeriodoAcademico)
def periodo_notification(sender, instance, created, **kwargs):
    """Notificar inicio de periodo a estudiantes cuando se activa."""
    if instance.activo:
        # Enviar correos a todos los estudiantes activos
        # Nota: Esto debería hacerse con una tarea asíncrona (Celery) en producción
        from gestion.models import Estudiante
        estudiantes = Estudiante.objects.filter(usuario__is_active=True)
        for est in estudiantes:
            notify_student_period_start(est, instance)

@receiver(post_save, sender=DetalleInscripcion)
def risk_notification(sender, instance, **kwargs):
    """Verificar riesgo de reprobación al guardar una nota."""
    # Si hay alguna nota cargada y el promedio/nota actual es bajo (ej. < 10)
    # y el estatus es CURSANDO (no finalizado aun)
    if instance.estatus == 'CURSANDO':
        notas = [n for n in [instance.nota1, instance.nota2, instance.nota3, instance.nota4] if n is not None]
        if notas:
            promedio_parcial = sum(notas) / len(notas)
            if promedio_parcial < 10:
                notify_student_risk(instance.inscripcion.estudiante, instance.asignatura, promedio_parcial)

# Para Sección, usamos una señal que detecte cambio de docente.
# Esto requiere seguimiento del estado anterior, lo cual es difícil en post_save.
# Se implementará la notificación de asignación directamente en la vista o usando un hack de pre_init.

