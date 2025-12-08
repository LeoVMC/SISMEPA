import os
import django
import sys

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pkgutil
import importlib.util

if not hasattr(pkgutil, 'find_loader'):
    def find_loader(fullname):
        if "." in fullname:
            # This is a simplification for the specific use case
            try:
                return importlib.util.find_spec(fullname)
            except:
                return None
        try:
            return importlib.util.find_spec(fullname)
        except:
            return None
    pkgutil.find_loader = find_loader

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sismepa.settings')
django.setup()

from django.contrib.auth import get_user_model

def create_superuser():
    User = get_user_model()
    username = 'admin'
    email = 'admin@example.com'
    password = 'master123456'

    if not User.objects.filter(username=username).exists():
        print(f"Creating superuser: {username}")
        User.objects.create_superuser(username=username, email=email, password=password)
        print("Superuser created successfully.")
    else:
        print(f"Superuser {username} already exists. Resetting password.")
        u = User.objects.get(username=username)
        u.set_password(password)
        u.save()
        print("Password reset successfully.")

if __name__ == "__main__":
    create_superuser()
