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
