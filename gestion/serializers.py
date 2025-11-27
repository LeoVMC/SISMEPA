# Keep compatibility: re-export from the organized api serializers
from .api.serializers import *

__all__ = [
    'UserSerializer', 'CreateUserSerializer', 'AsignaturaSerializer', 'EstudianteSerializer',
    'PensumSerializer', 'PlanificacionSerializer', 'DocumentoCalificacionesSerializer'
]
