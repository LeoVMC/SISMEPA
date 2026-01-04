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
    inscripciones_activas = models.BooleanField(default=False, help_text="Indica si las inscripciones están abiertas para este período")
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

    def get_uc_periodo_actual(self):
        """Calcula las UC inscritas en el período activo."""
        from django.apps import apps
        from django.db.models import Sum
        DetalleInscripcion = apps.get_model('gestion', 'DetalleInscripcion')
        PeriodoAcademico = apps.get_model('gestion', 'PeriodoAcademico')
        
        periodo = PeriodoAcademico.objects.filter(activo=True).first()
        if not periodo:
            return 0
            
        total = DetalleInscripcion.objects.filter(
            inscripcion__estudiante=self,
            inscripcion__periodo=periodo
        ).aggregate(t=Sum('asignatura__creditos'))['t']
        
        return total or 0


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
    seccion = models.ForeignKey(Seccion, on_delete=models.SET_NULL, null=True, blank=True, related_name='estudiantes_inscritos')
    
    # Notas parciales (escala 1-20)
    nota1 = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    nota2 = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    nota3 = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    nota4 = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    
    nota_final = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    estatus = models.CharField(max_length=20, default='CURSANDO')

    def calcular_nota_final(self):
        """Calcula la nota final como promedio de las 4 notas parciales."""
        notas = [n for n in [self.nota1, self.nota2, self.nota3, self.nota4] if n is not None]
        if len(notas) == 4:
            from decimal import Decimal
            self.nota_final = sum(notas) / Decimal(4)
            # Determinar estatus basado en nota final
            self.estatus = 'APROBADO' if self.nota_final >= 10 else 'REPROBADO'
        return self.nota_final

    def save(self, *args, **kwargs):
        # Recalcular nota final antes de guardar si hay notas parciales
        if any([self.nota1, self.nota2, self.nota3, self.nota4]):
            self.calcular_nota_final()
        super().save(*args, **kwargs)


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
    codigo_especifico = models.CharField(max_length=20, null=True, blank=True, help_text="Código específico para electivas o pasantía/tesis")
    uploaded_at = models.DateTimeField(auto_now_add=True)


class UserActivity(models.Model):
    """Registra la última actividad de un usuario para monitoreo en línea."""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activity')
    last_activity = models.DateTimeField(auto_now=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    device_type = models.CharField(max_length=50, default='Desktop') # 'Desktop', 'Mobile'

    def __str__(self):
        return f"{self.user.username} - {self.last_activity}"


class Horario(models.Model):
    """Horario de clases de una sección."""
    seccion = models.ForeignKey(Seccion, on_delete=models.CASCADE, related_name='horarios')
    DIA_CHOICES = [
        (1, 'Lunes'),
        (2, 'Martes'),
        (3, 'Miércoles'),
        (4, 'Jueves'),
        (5, 'Viernes'),
        (6, 'Sábado'),
        (7, 'Domingo'),
    ]
    dia = models.IntegerField(choices=DIA_CHOICES)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    aula = models.CharField(max_length=50, blank=True)

    class Meta:
        ordering = ['dia', 'hora_inicio']

    def __str__(self):
        return f"{self.get_dia_display()} {self.hora_inicio}-{self.hora_fin} ({self.aula})"
