"""
Clases de permisos personalizados para la API REST.
"""
from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Permite acceso solo a superusuarios o miembros del grupo Administrador."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        # Permitir superusuario de Django o miembros del grupo Administrador
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name='Administrador').exists()


class IsDocente(permissions.BasePermission):
    """Permite acceso a docentes o superusuarios."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='Docente').exists() or request.user.is_superuser


class IsEstudiante(permissions.BasePermission):
    """Permite acceso a estudiantes o superusuarios."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='Estudiante').exists() or request.user.is_superuser


class IsDocenteOrAdminOrOwner(permissions.BasePermission):
    """
    Permite acceso si el usuario es superusuario, está en el grupo Docente,
    o es el dueño del recurso Estudiante (coincide con request.user).
    """
    
    def has_object_permission(self, request, view, obj):
        # Se espera que obj sea una instancia de Estudiante
        if request.user.is_superuser:
            return True
        if request.user.groups.filter(name='Docente').exists():
            return True
        try:
            return hasattr(obj, 'usuario') and obj.usuario == request.user
        except Exception:
            return False


class IsDocenteOrAdmin(permissions.BasePermission):
    """Permite acceso a docentes o administradores."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return (
            request.user.is_superuser or 
            request.user.groups.filter(name='Docente').exists() or 
            request.user.groups.filter(name='Administrador').exists()
        )
