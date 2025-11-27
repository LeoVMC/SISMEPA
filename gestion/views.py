"""Compatibility wrapper: re-export API viewsets from `gestion.api.views`.

This keeps `from gestion import views` or `from gestion.views import ...` working
while the organized implementation lives under `gestion.api`.
"""
from .api.views import *

__all__ = [
    'EstudianteViewSet', 'AsignaturaViewSet', 'UserManagementViewSet',
    'PensumViewSet', 'PlanificacionViewSet', 'DocumentoCalificacionesViewSet'
]
