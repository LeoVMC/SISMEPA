from django.utils import timezone
from datetime import timedelta

class UpdateLastActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        from gestion.models import UserActivity
        
        if request.user.is_authenticated:
            now = timezone.now()
            
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR')
            
            user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
            device_type = 'Mobile' if 'mobile' in user_agent or 'android' in user_agent or 'iphone' in user_agent else 'Desktop'

            should_update = True
            
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
