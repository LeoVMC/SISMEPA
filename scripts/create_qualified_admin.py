import os
import django
import sys

# Setup Django environment
sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sismepa.settings')
django.setup()

from django.contrib.auth.models import User, Group
from gestion.models import Administrador

def create_admin_user():
    # 1. Asegurar grupo
    grupo, created = Group.objects.get_or_create(name='Administrador')
    if created:
        print("Grupo 'Administrador' creado.")
    else:
        print("Grupo 'Administrador' ya existe.")

    # Variables
    target_username = 'V-10000000'
    old_username = '10000000'
    password = 'admin'
    email = 'admin@sismepa.com'
    cedula = '10000000'

    # Limpieza: Borrar usuario antiguo si existe para liberar la cédula
    if User.objects.filter(username=old_username).exists():
        print(f"Eliminando usuario antiguo {old_username} para liberar cédula...")
        try:
            User.objects.filter(username=old_username).delete()
            print("Usuario antiguo eliminado.")
        except Exception as e:
            print(f"Error borrando usuario antiguo: {e}")

    # Borrar también el usuario destino si existe para recrearlo limpio (opcional, set_password es mejor si ya existe)
    # Pero aquí mantenemos set_password
    if User.objects.filter(username=target_username).exists():
        user = User.objects.get(username=target_username)
        print(f"Usuario {target_username} ya existe. Actualizando contraseña y permisos...")
        user.set_password(password)
    else:
        user = User.objects.create_user(username=target_username, email=email, password=password)
        print(f"Usuario {target_username} creado.")

    user.first_name = 'Administrador'
    user.last_name = 'Principal'
    user.is_staff = True
    user.is_superuser = True
    user.save()

    # 3. Asignar grupo
    user.groups.add(grupo)
    print(f"Usuario agregado al grupo 'Administrador'.")

    # 4. Crear perfil
    # Usar get_or_create. Si existe otro admin con la misma cédula (no debiera tras borrar old_username), fallará
    admin_profile, created = Administrador.objects.get_or_create(
        usuario=user, 
        defaults={'cedula': cedula, 'telefono': '0412-0000000'}
    )
    if created:
        print("Perfil de Administrador creado.")
    else:
        print("Perfil de Administrador ya existía.")
        admin_profile.cedula = cedula
        admin_profile.save()

    print("\n" + "="*50)
    print("CREACIÓN DE USUARIO ADMINISTRADOR COMPLETADA")
    print("="*50)
    print(f"Usuario:    {target_username}")
    print(f"Contraseña: {password}")
    print("="*50)

if __name__ == '__main__':
    create_admin_user()
