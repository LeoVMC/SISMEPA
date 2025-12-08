from django.contrib import admin
from .models import Programa, Asignatura, Estudiante, Seccion, PeriodoAcademico, Inscripcion, DetalleInscripcion

@admin.register(Programa)
class ProgramaAdmin(admin.ModelAdmin):
    list_display = ('nombre_programa', 'titulo_otorgado')

@admin.register(Asignatura)
class AsignaturaAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'nombre_asignatura', 'semestre', 'programa')
    list_filter = ('programa', 'semestre')

@admin.register(Seccion)
class SeccionAdmin(admin.ModelAdmin):
    list_display = ('asignatura', 'codigo_seccion', 'docente')
    list_filter = ('asignatura__programa', 'codigo_seccion')

@admin.register(Estudiante)
class EstudianteAdmin(admin.ModelAdmin):
    list_display = ('cedula', 'usuario', 'programa')

@admin.register(PeriodoAcademico)
class PeriodoAdmin(admin.ModelAdmin):
    list_display = ('nombre_periodo', 'activo')
