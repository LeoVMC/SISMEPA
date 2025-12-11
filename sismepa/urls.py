"""
URL configuration for sismepa project.
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static

from gestion.api.views import (
    EstudianteViewSet, AsignaturaViewSet, PensumViewSet,
    PlanificacionViewSet, DocumentoCalificacionesViewSet, UserManagementViewSet, ProgramaViewSet,
    DocenteViewSet, AdminViewSet
)

router = DefaultRouter()
router.register(r'estudiantes', EstudianteViewSet, basename='estudiante')
router.register(r'programas', ProgramaViewSet, basename='programa')
router.register(r'asignaturas', AsignaturaViewSet, basename='asignatura')
router.register(r'pensums', PensumViewSet, basename='pensum')
router.register(r'planificaciones', PlanificacionViewSet, basename='planificacion')
router.register(r'calificaciones', DocumentoCalificacionesViewSet, basename='calificaciones')
router.register(r'admin-users', UserManagementViewSet, basename='admin-users')
router.register(r'docentes', DocenteViewSet, basename='docentes')
router.register(r'administradores', AdminViewSet, basename='administradores')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    # dj-rest-auth endpoints (login/logout/password reset)
    path('api/auth/', include('dj_rest_auth.urls')),
    path('', RedirectView.as_view(url='/api/', permanent=False)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
