from django.contrib import admin
from .models import Programa, Asignatura, Estudiante, Seccion, PeriodoAcademico, Inscripcion, DetalleInscripcion, Docente, Administrador

@admin.register(Programa)
class ProgramaAdmin(admin.ModelAdmin):
    list_display = ('nombre_programa', 'titulo_otorgado')

@admin.register(Asignatura)
class AsignaturaAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'nombre_asignatura', 'semestre', 'programa')
    list_filter = ('programa', 'semestre')
    search_fields = ('codigo', 'nombre_asignatura')

@admin.register(Seccion)
class SeccionAdmin(admin.ModelAdmin):
    list_display = ('asignatura', 'codigo_seccion', 'get_docente_name')
    list_filter = ('asignatura__programa', 'codigo_seccion')
    search_fields = ('asignatura__nombre_asignatura', 'codigo_seccion')

    @admin.display(description='Docente')
    def get_docente_name(self, obj):
        if obj.docente:
            return obj.docente.get_full_name() or obj.docente.username
        return "Sin asignar"

@admin.register(Estudiante)
class EstudianteAdmin(admin.ModelAdmin):
    list_display = ('cedula', 'get_full_name', 'programa')
    search_fields = ('cedula', 'usuario__first_name', 'usuario__last_name')

    @admin.display(description='Nombre Completo')
    def get_full_name(self, obj):
        return obj.usuario.get_full_name()

@admin.register(Docente)
class DocenteAdmin(admin.ModelAdmin):
    list_display = ('cedula', 'get_full_name', 'telefono', 'tipo_contratacion')
    search_fields = ('cedula', 'usuario__first_name', 'usuario__last_name')

    @admin.display(description='Nombre Completo')
    def get_full_name(self, obj):
        return obj.usuario.get_full_name()

@admin.register(Administrador)
class AdministradorAdmin(admin.ModelAdmin):
    list_display = ('cedula', 'get_full_name', 'telefono')
    search_fields = ('cedula', 'usuario__first_name', 'usuario__last_name')

    @admin.display(description='Nombre Completo')
    def get_full_name(self, obj):
        return obj.usuario.get_full_name()

@admin.register(PeriodoAcademico)
class PeriodoAdmin(admin.ModelAdmin):
    list_display = ('nombre_periodo', 'activo')
