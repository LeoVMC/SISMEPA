from django.utils import timezone
from datetime import timedelta

class UpdateLastActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Guard clause: avoid processing if app registry not ready (though middleware usually runs after)
        # Import lazily to prevent circular dependencies
        from gestion.models import UserActivity
        
        # Solo para usuarios autenticados
        if request.user.is_authenticated:
            # Throttle: Actualizar solo si ha pasado más de 2 minutos o no existe registro
            now = timezone.now()
            
            # Obtener IP
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR')
            
            # Determinar dispositivo simple
            user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
            device_type = 'Mobile' if 'mobile' in user_agent or 'android' in user_agent or 'iphone' in user_agent else 'Desktop'

            # Optimización: Buscar o crear actividad
            should_update = True
            
            # Intentar obtener el objeto activity (relacion OneToOne)
            # Si no existe, se creará. Si existe, verificar tiempo.
            try:
                activity = request.user.activity
                if activity.last_activity > now - timedelta(minutes=2):
                    should_update = False
                
                if should_update:
                    activity.last_activity = now
                    activity.ip_address = ip
                    activity.device_type = device_type
                    activity.save(update_fields=['last_activity', 'ip_address', 'device_type'])
                    
            except UserActivity.DoesNotExist:
                UserActivity.objects.create(
                    user=request.user,
                    ip_address=ip,
                    device_type=device_type
                )
            except Exception:
                pass 

        return response
