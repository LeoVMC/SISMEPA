from django.core.management.base import BaseCommand
from django.utils import timezone
from gestion.models import PeriodoAcademico, Docente, Administrador, Estudiante, DetalleInscripcion
from gestion.notifications import notify_docente_period_end, notify_admin_period_status, send_notification_email
from datetime import timedelta

class Command(BaseCommand):
    help = 'Verifica y envía notificaciones automáticas (Cierre de periodo, alertas, etc)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--continuous',
            action='store_true',
            help='Ejecutar el comando en bucle infinito (modo servicio)',
        )
        parser.add_argument(
            '--interval',
            type=int,
            default=86400, # 24 horas por defecto
            help='Intervalo de espera en segundos para modo continuo (default: 86400)',
        )

    def handle(self, *args, **options):
        continuous = options['continuous']
        interval = options['interval']
        
        self.stdout.write(f"Iniciando servicio de notificaciones. Modo continuo: {continuous}")

        while True:
            self.check_notifications()
            
            if not continuous:
                break
            
            self.stdout.write(f"Dormitando por {interval} segundos...")
            import time
            time.sleep(interval)

    def check_notifications(self):
        self.stdout.write(f"[{timezone.now()}] Verificando notificaciones...")
        
        hoy = timezone.now().date()
        periodo_activo = PeriodoAcademico.objects.filter(activo=True).first()

        if not periodo_activo:
            self.stdout.write("No hay periodo activo.")
            return

        # 1. Verificar Cierre de Periodo (7 días antes o menos)
        dias_restantes = (periodo_activo.fecha_fin - hoy).days
        
        if 0 <= dias_restantes <= 7:
            self.stdout.write(f"Periodo próximo a cerrar. Días restantes: {dias_restantes}")
            
            # Notificar Docentes (Recordatorio de Carga)
            docentes = Docente.objects.all()
            count = 0
            for doc in docentes:
                notify_docente_period_end(doc, periodo_activo)
                count += 1
            self.stdout.write(f"Recordatorio enviado a {count} docentes.")

            # Notificar Administradores
            admins = Administrador.objects.all()
            for admin in admins:
                if admin.usuario.email:
                    notify_admin_period_status(admin.usuario.email, periodo_activo, "cierre")
                    notify_admin_period_status(admin.usuario.email, periodo_activo, "inicio_proximo")

        # 2. Verificar si todas las calificaciones están cargadas (solo si estamos cerca del cierre o ya cerró?)
        # Lo haremos general por ahora.
        pending_grades = DetalleInscripcion.objects.filter(
            inscripcion__periodo=periodo_activo, 
            nota_final__isnull=True
        ).exists()
        
        if not pending_grades:
            # Todas cargadas
            admins = Administrador.objects.all()
            for admin in admins:
                if admin.usuario.email:
                     send_notification_email(
                         f"Totalidad de Calificaciones Cargadas - {periodo_activo.nombre_periodo}",
                         f"Informamos que se han cargado el 100% de las calificaciones del periodo {periodo_activo.nombre_periodo}.",
                         admin.usuario.email
                     )
            self.stdout.write("Aviso de calificaciones completas enviado a administradores.")

        self.stdout.write("Verificación completada.")
