from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        # allow Django superuser or members of Administrador group
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name='Administrador').exists()


class IsDocente(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='Docente').exists() or request.user.is_superuser


class IsEstudiante(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='Estudiante').exists() or request.user.is_superuser


class IsDocenteOrAdminOrOwner(permissions.BasePermission):
    """Allow if user is superuser, in Docente group, or is the Estudiante owner (matches request.user)."""
    def has_object_permission(self, request, view, obj):
        # obj expected to be Estudiante instance
        if request.user.is_superuser:
            return True
        if request.user.groups.filter(name='Docente').exists():
            return True
        try:
            return hasattr(obj, 'usuario') and obj.usuario == request.user
        except Exception:
            return False


class IsDocenteOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_superuser or request.user.groups.filter(name='Docente').exists() or request.user.groups.filter(name='Administrador').exists()
