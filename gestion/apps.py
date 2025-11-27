from django.apps import AppConfig


class GestionConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'gestion'
    verbose_name = 'Gestion'
    
    def ready(self):
        # Register signal handlers (creates groups on post_migrate and assigns group on signup)
        try:
            from . import signals  # noqa: F401
        except Exception:
            # ignore import errors during some early operations
            pass
