import os
import sys
sys.path.append('/app')
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sismepa.settings')
django.setup()

from django.conf import settings
from rest_framework.test import APIClient
from django.contrib.auth.models import User

def test_api_filtering():
    print("--- Testing API Filtering ---")
    client = APIClient()
    
    # Authenticate as admin
    admin = User.objects.get(username='admin')
    client.force_authenticate(user=admin)
    
    # 1. Test Math I Filter
    print("Fetching plans for MAT-21215...")
    response = client.get('/api/planificaciones/', {'asignatura__codigo': 'MAT-21215'})
    if response.status_code == 200:
        data = response.json()
        print(f"Count: {len(data)}")
        for item in data:
            print(f" - ID: {item['id']}, Assignatura: {item['asignatura']}")
    else:
        print(f"Error: {response.status_code}")
        # Try to parse basic error from HTML
        content = response.content.decode('utf-8')
        if "Exception Value:" in content:
             print(content.split("Exception Value:")[1].split("</pre>")[0])
        else:
             print(content[:500])

if __name__ == '__main__':
    test_api_filtering()
