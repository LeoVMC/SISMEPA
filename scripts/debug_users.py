"""
Script para depurar usuarios y grupos.
Ejecutar desde la raíz del proyecto: python scripts/debug_users.py
"""
import os
import sys

# Agregar directorio raíz del proyecto al path (funciona desde cualquier ubicación)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
sys.path.insert(0, PROJECT_ROOT)

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sismepa.settings')
django.setup()

from django.contrib.auth.models import User, Group

def check_data():
    print("--- Groups ---")
    for g in Group.objects.all():
        print(f"Group: {g.name}")

    print("\n--- Users ---")
    for u in User.objects.all():
        groups = [g.name for g in u.groups.all()]
        print(f"User: {u.username}, Role: {groups}")

if __name__ == "__main__":
    check_data()
