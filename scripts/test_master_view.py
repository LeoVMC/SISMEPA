import os
import sys
import django
from django.conf import settings

# Modify this to match a KNOWN Docente credentials from debug_docente output
# V-25432542 (ID: 11) is assigned to 'D1 (EDUCACIN AMBIENTAL)'
USERNAME = "V-25432542"
# We need the password. Debug output doesn't give it.
# Assuming default password if created by seed? 
# If not, let's create a temporary Docente user, assign a section, and test.

def setup_django():
     sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
     os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sismepa.settings')
     django.setup()

def create_test_docente_and_check():
    setup_django()
    from django.contrib.auth.models import User, Group
    from gestion.models import Seccion, Asignatura, Horario, Programa
    from rest_framework.test import APIClient
    from rest_framework.authtoken.models import Token
    
    # 1. Create Test Docente
    username = "test_docente_debug"
    password = "testpassword123"
    email = "testdoc@debug.com"
    
    user, created = User.objects.get_or_create(username=username, defaults={'email': email})
    user.set_password(password)
    user.save()
    
    # Add to Docente Group
    g_docente, _ = Group.objects.get_or_create(name='Docente')
    user.groups.add(g_docente)
    
    # Ensure NOT Admin
    g_admin = Group.objects.filter(name='Administrador').first()
    if g_admin:
        user.groups.remove(g_admin)
        
    print(f"Created Docente: {user.username} (ID: {user.id})")
    
    # 2. Assign Section
    # Find a section or create one
    asignatura = Asignatura.objects.first()
    if not asignatura:
        print("No assignments found to test.")
        return

    sec, _ = Seccion.objects.get_or_create(
        asignatura=asignatura,
        codigo_seccion="DEBUG-01",
        defaults={'docente': user}
    )
    sec.docente = user # Force assignment
    sec.save()
    print(f"Assigned Section: {sec}")
    
    # Create Horario
    # Delete existing
    Horario.objects.filter(seccion=sec).delete()
    import datetime
    h = Horario.objects.create(
        seccion=sec,
        dia=1,
        hora_inicio=datetime.time(7,0),
        hora_fin=datetime.time(7,45),
        aula="AULA-TEST"
    )
    print(f"Created Horario: {h}")
    
    # 3. Test Endpoint as Docente
    client = APIClient()
    client.force_authenticate(user=user)
    
    url = '/api/secciones/master-horario/'
    response = client.get(url)
    
    print("\n--- API Response for Docente ---")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Data Length: {len(data)}")
    if len(data) > 0:
        print("Sample Item:", data[0])
        print("✅ SUCCESS: Docente received schedule data.")
    else:
        print("❌ FAILURE: Docente received EMPTY list.")

    # 4. Test as Admin for comparison
    admin_user = User.objects.filter(is_superuser=True).first()
    if admin_user:
        client.force_authenticate(user=admin_user)
        resp_admin = client.get(url)
        print(f"\n--- API Response for Admin ---")
        print(f"Data Length: {len(resp_admin.json())}")
        
    # Cleanup
    # user.delete()
    # sec.delete()

if __name__ == "__main__":
    create_test_docente_and_check()
