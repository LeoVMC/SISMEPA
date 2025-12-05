import sys
sys.path.append('/app')
import os
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
