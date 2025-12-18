"""
Modelos de datos para la aplicación de gestión académica SISMEPA.
"""
from django.db import models
from django.conf import settings


class PeriodoAcademico(models.Model):
    """Representa un período académico (semestre/trimestre)."""
    nombre_periodo = models.CharField(max_length=50)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    activo = models.BooleanField(default=True)
    anio = models.IntegerField(default=2025)

    def __str__(self):
        return self.nombre_periodo


class Programa(models.Model):
    """Representa un programa académico (carrera universitaria)."""
    nombre_programa = models.CharField(max_length=200)
    titulo_otorgado = models.CharField(max_length=200)
    duracion_anios = models.IntegerField()

    def __str__(self):
        return self.nombre_programa


class Asignatura(models.Model):
    """Representa una asignatura/materia del pensum."""
    nombre_asignatura = models.CharField(max_length=200)
    codigo = models.CharField(max_length=20)
    creditos = models.IntegerField()
    semestre = models.IntegerField()
    programa = models.ForeignKey(Programa, on_delete=models.CASCADE)
    prelaciones = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='es_requisito_de')
    orden = models.IntegerField(default=0)
    # Manteniendo docente por compatibilidad, aunque las asignaciones específicas se moverán a Sección
    docente = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='asignaturas_asignadas')
    tutores = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name='tutorias_asignadas')

    def __str__(self):
        return f"{self.codigo} - {self.nombre_asignatura}"

    class Meta:
        unique_together = ('codigo', 'programa')


class Seccion(models.Model):
    """Representa una sección de una asignatura con su docente asignado."""
    asignatura = models.ForeignKey(Asignatura, on_delete=models.CASCADE, related_name='secciones')
    codigo_seccion = models.CharField(max_length=10)  # ej., D1, D2...
    docente = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='secciones_asignadas')

    class Meta:
        unique_together = ('asignatura', 'codigo_seccion')

    def __str__(self):
        docente_name = self.docente.get_full_name() if self.docente else "Sin asignar"
        return f"{self.asignatura.nombre_asignatura} - {self.codigo_seccion} ({docente_name})"


class Estudiante(models.Model):
    """Representa un estudiante inscrito en un programa académico."""
    usuario = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    programa = models.ForeignKey(Programa, on_delete=models.CASCADE)
    cedula = models.CharField(max_length=20, unique=True)
    telefono = models.CharField(max_length=20)
    fecha_ingreso = models.DateField(auto_now_add=True)
    nombre = models.CharField(max_length=100, blank=True)
    apellido = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)

    def __str__(self):
        name = self.usuario.get_full_name()
        return f"{name} ({self.cedula})" if name else f"{self.usuario.username} - {self.cedula}"

    def calcular_avance(self):
        """Calcula el porcentaje de avance académico del estudiante."""
        from django.apps import apps
        DetalleInscripcion = apps.get_model('gestion', 'DetalleInscripcion')
        
        total_asignaturas = 0
        if self.programa:
            total_asignaturas = self.programa.asignatura_set.count()
            
        if total_asignaturas == 0:
            return 0
            
        # Nota aprobatoria >= 10 (Escala 1-20)
        aprobadas = DetalleInscripcion.objects.filter(
            inscripcion__estudiante=self,
            nota_final__gte=10
        ).count()
        
        return round((aprobadas / total_asignaturas) * 100, 2)


class Docente(models.Model):
    """Representa un docente/profesor."""
    usuario = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    cedula = models.CharField(max_length=20, unique=True)
    telefono = models.CharField(max_length=20)
    TIPO_CONTRATACION_CHOICES = [
        ('Tiempo Completo', 'Tiempo Completo'),
        ('Tiempo Parcial', 'Tiempo Parcial'),
    ]
    tipo_contratacion = models.CharField(max_length=50, choices=TIPO_CONTRATACION_CHOICES, default='Tiempo Completo')

    def __str__(self):
        name = self.usuario.get_full_name()
        return f"{name} ({self.cedula})" if name else f"{self.usuario.username} - {self.cedula}"


class Administrador(models.Model):
    """Representa un administrador del sistema."""
    usuario = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    cedula = models.CharField(max_length=20, unique=True)
    telefono = models.CharField(max_length=20)

    def __str__(self):
        name = self.usuario.get_full_name()
        return f"{name} ({self.cedula})" if name else f"{self.usuario.username} - {self.cedula}"


class Inscripcion(models.Model):
    """Representa la inscripción de un estudiante en un período académico."""
    estudiante = models.ForeignKey(Estudiante, on_delete=models.CASCADE)
    periodo = models.ForeignKey(PeriodoAcademico, on_delete=models.CASCADE)
    fecha_inscripcion = models.DateTimeField(auto_now_add=True)


class DetalleInscripcion(models.Model):
    """Detalle de inscripción: vincula estudiante con asignaturas y notas."""
    inscripcion = models.ForeignKey(Inscripcion, on_delete=models.CASCADE, related_name='detalles')
    asignatura = models.ForeignKey(Asignatura, on_delete=models.PROTECT)
    nota_final = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    estatus = models.CharField(max_length=20, default='CURSANDO')


class DocumentoCalificaciones(models.Model):
    """Documento de calificaciones subido por un estudiante."""
    estudiante = models.ForeignKey(Estudiante, on_delete=models.CASCADE, related_name='documentos_calificaciones')
    archivo = models.FileField(upload_to='calificaciones/')
    uploaded_at = models.DateTimeField(auto_now_add=True)


class Pensum(models.Model):
    """Documento del pensum de un programa académico."""
    programa = models.ForeignKey(Programa, on_delete=models.CASCADE, related_name='pensums')
    archivo = models.FileField(upload_to='pensums/')
    uploaded_at = models.DateTimeField(auto_now_add=True)


class Planificacion(models.Model):
    """Planificación de una asignatura subida por un docente."""
    asignatura = models.ForeignKey(Asignatura, on_delete=models.CASCADE, related_name='planificaciones')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    archivo = models.FileField(upload_to='planificaciones/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
