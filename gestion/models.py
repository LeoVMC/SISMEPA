from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


class Cliente(models.Model):
    nombre = models.CharField(max_length=200)
    email = models.EmailField(blank=True)
    direccion = models.CharField(max_length=300, blank=True)

    def __str__(self):
        return self.nombre


class Producto(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.nombre


class Pedido(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='pedidos')
    fecha = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"Pedido {self.id} - {self.cliente}"


class Example(models.Model):
    """Modelo mínimo para ejemplos rápidos."""
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre


# ---------- Modelos académicos integrados (Programa / Asignatura / Estudiante) ----------
class Programa(models.Model):
    # [cite: 65, 72, 75]
    nombre_programa = models.CharField(max_length=200)
    titulo_otorgado = models.CharField(max_length=200)
    duracion_anios = models.IntegerField()

    def __str__(self):
        return self.nombre_programa


class Asignatura(models.Model):
    # [cite: 86, 89, 90, 94]
    programa = models.ForeignKey(Programa, on_delete=models.CASCADE)
    nombre_asignatura = models.CharField(max_length=200)
    codigo = models.CharField(max_length=20, unique=True)
    creditos = models.IntegerField()
    semestre = models.IntegerField()
    # Auto-relación para manejar prelaciones (requisitos)
    prelaciones = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='es_requisito_de')

    def __str__(self):
        return f"{self.codigo} - {self.nombre_asignatura}"


class Estudiante(models.Model):
    # [cite: 64, 74, 77]
    usuario = models.OneToOneField(User, on_delete=models.CASCADE)
    programa = models.ForeignKey(Programa, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=100, blank=True)
    apellido = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    cedula = models.CharField(max_length=20, unique=True)
    telefono = models.CharField(max_length=20)
    fecha_ingreso = models.DateField(auto_now_add=True)

    def calcular_avance(self):
        # Especificación funcional: Cálculo automático del porcentaje [cite: 37]
        total_asignaturas = Asignatura.objects.filter(programa=self.programa).count()
        aprobadas = DetalleInscripcion.objects.filter(
            inscripcion__estudiante=self,
            nota_final__gte=10
        ).count()
        if total_asignaturas == 0:
            return 0
        porcentaje = (aprobadas / total_asignaturas) * 100

        # Alerta temprana: si el porcentaje está por debajo del umbral,
        # encolar tarea de envío de notificación (Huey si está configurado,
        # hilo en fallback). Esto previene bloqueos en `calcular_avance()`.
        try:
            from django.conf import settings
            threshold = getattr(settings, 'LOW_PERFORMANCE_THRESHOLD', 50)
            if porcentaje < threshold:
                try:
                    from .tasks import send_alert_task
                    to_email = getattr(self.usuario, 'email', None)
                    if to_email:
                        subject = 'Alerta de bajo rendimiento académico'
                        html_content = f"<p>Estimado/a {self.usuario.get_full_name() or self.usuario.username},</p><p>Se ha detectado un avance de <strong>{porcentaje:.1f}%</strong> en su programa. Por favor contacte con su asesor académico.</p>"
                        # enqueue or schedule; implementation decides best strategy
                        send_alert_task(to_email, subject, html_content)
                except Exception:
                    # Never propagate to caller — alerting is best-effort
                    pass
        except Exception:
            pass

        return porcentaje


class PeriodoAcademico(models.Model):
    # [cite: 99, 108]
    nombre_periodo = models.CharField(max_length=50)  # Ej: 2-2025
    anio = models.IntegerField(default=2025)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    activo = models.BooleanField(default=True)


class Inscripcion(models.Model):
    # [cite: 102]
    estudiante = models.ForeignKey(Estudiante, on_delete=models.CASCADE)
    periodo = models.ForeignKey(PeriodoAcademico, on_delete=models.CASCADE)
    fecha_inscripcion = models.DateTimeField(auto_now_add=True)


class DetalleInscripcion(models.Model):
    # [cite: 102, 115]
    inscripcion = models.ForeignKey(Inscripcion, on_delete=models.CASCADE, related_name='detalles')
    asignatura = models.ForeignKey(Asignatura, on_delete=models.PROTECT)
    nota_final = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    estatus = models.CharField(max_length=20, default='CURSANDO')  # Aprobado, Reprobado, Retirado

    def clean(self):
        # Validación de prelaciones antes de guardar [cite: 24, 34]
        requisitos = self.asignatura.prelaciones.all()
        historial = DetalleInscripcion.objects.filter(
            inscripcion__estudiante=self.inscripcion.estudiante,
            nota_final__gte=10
        ).values_list('asignatura_id', flat=True)

        for req in requisitos:
            if req.id not in historial:
                raise ValidationError(f"Prelación no cumplida: Falta aprobar {req.nombre_asignatura}")

    def save(self, *args, **kwargs):
        # Ejecutar validación antes de guardar
        self.full_clean()
        super().save(*args, **kwargs)


# ----- File upload models (pensum, planificación, documentos de calificaciones) -----
class Pensum(models.Model):
    programa = models.ForeignKey(Programa, on_delete=models.CASCADE, related_name='pensums')
    archivo = models.FileField(upload_to='pensums/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pensum {self.programa.nombre_programa} ({self.archivo.name})"


class Planificacion(models.Model):
    asignatura = models.ForeignKey(Asignatura, on_delete=models.CASCADE, related_name='planificaciones')
    archivo = models.FileField(upload_to='planificaciones/')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Planificacion {self.asignatura.codigo} - {self.archivo.name}"


class DocumentoCalificaciones(models.Model):
    estudiante = models.ForeignKey(Estudiante, on_delete=models.CASCADE, related_name='documentos_calificaciones')
    archivo = models.FileField(upload_to='calificaciones/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Calificaciones {self.estudiante.cedula} - {self.archivo.name}"

