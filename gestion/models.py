from django.db import models
from django.conf import settings

class PeriodoAcademico(models.Model):
    nombre_periodo = models.CharField(max_length=50)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    activo = models.BooleanField(default=True)
    anio = models.IntegerField(default=2025)

    def __str__(self):
        return self.nombre_periodo

class Programa(models.Model):
    nombre_programa = models.CharField(max_length=200)
    titulo_otorgado = models.CharField(max_length=200)
    duracion_anios = models.IntegerField()

    def __str__(self):
        return self.nombre_programa

class Asignatura(models.Model):
    nombre_asignatura = models.CharField(max_length=200)
    codigo = models.CharField(max_length=20)
    creditos = models.IntegerField()
    semestre = models.IntegerField()
    programa = models.ForeignKey(Programa, on_delete=models.CASCADE)
    prelaciones = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='es_requisito_de')
    orden = models.IntegerField(default=0)
    # Keeping docente for backward compatibility, though specific assignments will move to Seccion
    docente = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='asignaturas_asignadas')
    tutores = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name='tutorias_asignadas')

    def __str__(self):
        return f"{self.codigo} - {self.nombre_asignatura}"

    class Meta:
        unique_together = ('codigo', 'programa')

class Seccion(models.Model):
    asignatura = models.ForeignKey(Asignatura, on_delete=models.CASCADE, related_name='secciones')
    codigo_seccion = models.CharField(max_length=10) # e.g., D1, D2...
    docente = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='secciones_asignadas')

    class Meta:
        unique_together = ('asignatura', 'codigo_seccion')

    def __str__(self):
        return f"{self.asignatura.codigo} - {self.codigo_seccion}"

class Estudiante(models.Model):
    usuario = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    programa = models.ForeignKey(Programa, on_delete=models.CASCADE)
    cedula = models.CharField(max_length=20, unique=True)
    telefono = models.CharField(max_length=20)
    fecha_ingreso = models.DateField(auto_now_add=True)
    nombre = models.CharField(max_length=100, blank=True)
    apellido = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)

    def __str__(self):
        return f"{self.usuario.username} - {self.cedula}"

class Docente(models.Model):
    usuario = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    cedula = models.CharField(max_length=20, unique=True)
    telefono = models.CharField(max_length=20)
    TIPO_CONTRATACION_CHOICES = [
        ('Tiempo Completo', 'Tiempo Completo'),
        ('Tiempo Parcial', 'Tiempo Parcial'),
    ]
    tipo_contratacion = models.CharField(max_length=50, choices=TIPO_CONTRATACION_CHOICES, default='Tiempo Completo')

    def __str__(self):
        return f"{self.usuario.username} - {self.cedula}"

class Administrador(models.Model):
    usuario = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    cedula = models.CharField(max_length=20, unique=True)
    telefono = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.usuario.username} - {self.cedula}"

class Inscripcion(models.Model):
    estudiante = models.ForeignKey(Estudiante, on_delete=models.CASCADE)
    periodo = models.ForeignKey(PeriodoAcademico, on_delete=models.CASCADE)
    fecha_inscripcion = models.DateTimeField(auto_now_add=True)

class DetalleInscripcion(models.Model):
    inscripcion = models.ForeignKey(Inscripcion, on_delete=models.CASCADE, related_name='detalles')
    asignatura = models.ForeignKey(Asignatura, on_delete=models.PROTECT)
    nota_final = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    estatus = models.CharField(max_length=20, default='CURSANDO')

class DocumentoCalificaciones(models.Model):
    estudiante = models.ForeignKey(Estudiante, on_delete=models.CASCADE, related_name='documentos_calificaciones')
    archivo = models.FileField(upload_to='calificaciones/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

class Pensum(models.Model):
    programa = models.ForeignKey(Programa, on_delete=models.CASCADE, related_name='pensums')
    archivo = models.FileField(upload_to='pensums/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

class Planificacion(models.Model):
    asignatura = models.ForeignKey(Asignatura, on_delete=models.CASCADE, related_name='planificaciones')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    archivo = models.FileField(upload_to='planificaciones/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
