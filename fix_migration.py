import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sismepa.settings')
django.setup()

from django.contrib.auth.models import User, Group
from gestion.models import Docente, Administrador

def migrate_users():
    # Migrate Docentes
    try:
        docente_group = Group.objects.get(name='Docente')
        users = User.objects.filter(groups=docente_group)
        print(f"Found {users.count()} Docentes to migrate.")
        for u in users:
            # Check if exists (using related name or query)
            if not Docente.objects.filter(usuario=u).exists():
                cedula = u.username
                # Handle potential duplicate cedulas
                if Docente.objects.filter(cedula=cedula).exists():
                    cedula = f"{u.username}-DUP-{u.id}"
                
                Docente.objects.create(usuario=u, cedula=cedula, telefono='No registrado')
                print(f"Created Docente info for {u.username}")
            else:
                print(f"Docente info already exists for {u.username}")
    except Group.DoesNotExist:
        print("Group 'Docente' not found.")

    # Migrate Admins
    try:
        admin_group = Group.objects.get(name='Administrador')
        users = User.objects.filter(groups=admin_group)
        print(f"Found {users.count()} Admins to migrate.")
        for u in users:
            if not Administrador.objects.filter(usuario=u).exists():
                cedula = u.username
                if Administrador.objects.filter(cedula=cedula).exists():
                     cedula = f"{u.username}-DUP-{u.id}"

                Administrador.objects.create(usuario=u, cedula=cedula, telefono='No registrado')
                print(f"Created Admin info for {u.username}")
            else:
                print(f"Admin info already exists for {u.username}")
    except Group.DoesNotExist:
        print("Group 'Administrador' not found.")

if __name__ == '__main__':
    migrate_users()
