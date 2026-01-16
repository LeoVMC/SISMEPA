from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.contrib.auth.models import Group

try:
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
        pass


if user_signed_up is not None:
    @receiver(user_signed_up)
    def assign_default_group(request, user, **kwargs):
        """Assign the `Estudiante` group to newly registered users by default."""
        try:
            grupo, _ = Group.objects.get_or_create(name='Estudiante')
            user.groups.add(grupo)
        except Exception:
            pass


from django.db.models.signals import post_save
from gestion.models import PeriodoAcademico, DetalleInscripcion, Seccion
from gestion.notifications import notify_student_period_start, notify_student_risk, notify_student_failure, notify_docente_assignment

@receiver(post_save, sender=PeriodoAcademico)
def periodo_notification(sender, instance, created, **kwargs):
    """Notificar inicio de periodo a estudiantes cuando se activa."""
    if instance.activo:
        from gestion.models import Estudiante
        estudiantes = Estudiante.objects.filter(usuario__is_active=True)
        for est in estudiantes:
            notify_student_period_start(est, instance)

@receiver(post_save, sender=DetalleInscripcion)
def risk_notification(sender, instance, **kwargs):
    """Verificar riesgo de reprobación al guardar una nota."""
    if instance.estatus in ['CURSANDO', 'REPROBADO']:
        notas = [n for n in [instance.nota1, instance.nota2, instance.nota3, instance.nota4] if n is not None]
        num_notas = len(notas)
        
        if num_notas == 3:
            suma = sum(notas)
            necesario = 40 - suma
            if necesario >= 15:
                promedio_actual = sum(notas) / num_notas
                notify_student_risk(instance.inscripcion.estudiante, instance.asignatura, promedio_actual, necesario)
                
        elif num_notas == 4:
            nota_final = sum(notas) / 4
            if nota_final < 10:
                notify_student_failure(instance.inscripcion.estudiante, instance.asignatura, nota_final)


