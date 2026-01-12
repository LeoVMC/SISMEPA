from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
import logging

logger = logging.getLogger(__name__)

def send_notification_email(subject, message, recipient_list):
    """
    Función utilitaria para enviar correos usando la configuración de Django.
    """
    if not isinstance(recipient_list, list):
        recipient_list = [recipient_list]
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        logger.info(f"Correo enviado a {recipient_list}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Error enviando correo a {recipient_list}: {e}")
        return False

# --- Estudiantes ---

def notify_student_period_start(estudiante, periodo):
    """Notificar al estudiante que ha iniciado un nuevo periodo académico."""
    nombre = estudiante.usuario.get_full_name() or estudiante.usuario.username
    subject = f"Inicio del Periodo Académico {periodo.nombre_periodo} - SISMEPA"
    message = f"""Hola {nombre},

Te informamos que el periodo académico {periodo.nombre_periodo} ha iniciado.
Fecha de inicio: {periodo.fecha_inicio}
Fecha de fin: {periodo.fecha_fin}

Por favor ingresa al sistema para verificar tu inscripción.

Atentamente,
Administración SISMEPA
"""
    if estudiante.usuario.email:
        send_notification_email(subject, message, estudiante.usuario.email)

def notify_student_risk(estudiante, asignatura, nota_actual, nota_necesaria=None):
    """Notificar al estudiante riesgo de reprobar."""
    nombre = estudiante.usuario.get_full_name() or estudiante.usuario.username
    subject = f"Alerta de Rendimiento: {asignatura.nombre_asignatura}"
    
    extra_msg = ""
    if nota_necesaria is not None:
        extra_msg = f"\nPara aprobar con la nota mínima (10.00), necesitas obtener en tu próxima evaluación: {nota_necesaria:.2f} pts."

    message = f"""Hola {nombre},

Hemos detectado que tu rendimiento actual en la asignatura {asignatura.nombre_asignatura} presenta riesgo de reprobación.
Tu nota parcial acumulada/reciente es: {nota_actual:.2f}{extra_msg}

Te recomendamos contactar a tu docente o buscar asesoría académica.

Atentamente,
Sistema de Alerta Temprana - SISMEPA
"""
    if estudiante.usuario.email:
        send_notification_email(subject, message, estudiante.usuario.email)

def notify_student_failure(estudiante, asignatura, nota_final):
    """Notificar al estudiante que ha reprobado la asignatura."""
    nombre = estudiante.usuario.get_full_name() or estudiante.usuario.username
    subject = f"Notificación de Reprobación: {asignatura.nombre_asignatura}"
    message = f"""Hola {nombre},

Lamentamos informarte que has reprobado la asignatura {asignatura.nombre_asignatura}.
Tu nota definitiva es: {nota_final:.2f}

Deberás inscribir esta asignatura nuevamente en un próximo periodo.
Si consideras que hay un error, por favor contacta a Control de Estudios.

Atentamente,
Departamento de Evaluación - SISMEPA
"""
    if estudiante.usuario.email:
        send_notification_email(subject, message, estudiante.usuario.email)

# --- Docentes ---

def notify_docente_assignment(docente, seccion):
    """Notificar al docente de una nueva asignación."""
    nombre = docente.usuario.get_full_name() or docente.usuario.username
    subject = f"Nueva Asignación de Carga Académica - {seccion.asignatura.nombre_asignatura}"
    
    horarios = seccion.horarios.all()
    horario_txt = "\n".join([f"- {h.get_dia_display()} {h.hora_inicio.strftime('%H:%M')}-{h.hora_fin.strftime('%H:%M')} ({h.aula})" for h in horarios])
    
    message = f"""Hola Prof. {nombre},

Se le ha asignado una nueva sección para el periodo actual:

Asignatura: {seccion.asignatura.nombre_asignatura} ({seccion.asignatura.codigo})
Sección: {seccion.codigo_seccion}
Programa: {seccion.asignatura.programa.nombre_programa}

Horario:
{horario_txt if horario_txt else "Por definir"}

Por favor ingrese al sistema para gestionar su planificación.

Atentamente,
Coordinación Académica - SISMEPA
"""
    if docente.usuario.email:
        send_notification_email(subject, message, docente.usuario.email)

def notify_docente_period_end(docente, periodo):
    """Recordatorio para cargar notas al final del periodo."""
    nombre = docente.usuario.get_full_name() or docente.usuario.username
    subject = f"Cierre del Periodo {periodo.nombre_periodo} - Carga de Notas"
    message = f"""Estimado Prof. {nombre},

El periodo académico {periodo.nombre_periodo} está próximo a finalizar el {periodo.fecha_fin}.
Le recordamos que debe completar la carga de todas las calificaciones pendientes en el sistema antes de la fecha de cierre.

Atentamente,
Control de Estudios - SISMEPA
"""
    if docente.usuario.email:
        send_notification_email(subject, message, docente.usuario.email)

# --- Administradores ---

def notify_admin_period_status(admin_email, periodo, tipo="cierre"):
    """Notificar al administrador sobre estatus del periodo."""
    if tipo == "cierre":
        subject = f"Aviso de Cierre de Periodo: {periodo.nombre_periodo}"
        message = f"El periodo {periodo.nombre_periodo} finaliza el {periodo.fecha_fin}. Verifique los procesos de cierre."
    elif tipo == "inicio_proximo":
        subject = f"Próximo Periodo Académico"
        message = f"El periodo actual está por finalizar. Recuerde preparar la apertura del siguiente periodo académico."
    
    send_notification_email(subject, message, admin_email)
