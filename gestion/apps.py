from django.apps import AppConfig


class GestionConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'gestion'
    verbose_name = 'Gestion'
    
    def ready(self):
        try:
            from . import signals  # noqa: F401
        except Exception:
            pass
