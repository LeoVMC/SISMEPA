"""
URL configuration for sismepa project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from gestion.views import (
    EstudianteViewSet, AsignaturaViewSet,
    UserManagementViewSet, PensumViewSet, PlanificacionViewSet, DocumentoCalificacionesViewSet,
)

router = DefaultRouter()
router.register(r'estudiantes', EstudianteViewSet, basename='estudiante')
router.register(r'asignaturas', AsignaturaViewSet, basename='asignatura')
router.register(r'admin-users', UserManagementViewSet, basename='admin-users')
router.register(r'pensums', PensumViewSet, basename='pensum')
router.register(r'planificaciones', PlanificacionViewSet, basename='planificacion')
router.register(r'calificaciones', DocumentoCalificacionesViewSet, basename='calificaciones')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    # dj-rest-auth endpoints (login/logout/password reset)
    path('api/auth/', include('dj_rest_auth.urls')),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
