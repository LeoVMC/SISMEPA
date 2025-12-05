import sys
sys.path.append('/app')
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sismepa.settings')
django.setup()

from gestion.models import Programa

def create_initial_data():
    if not Programa.objects.filter(nombre_programa="Ingeniería de Sistemas").exists():
        Programa.objects.create(
            nombre_programa="Ingeniería de Sistemas",
            titulo_otorgado="Ingeniero de Sistemas",
            duracion_anios=5
        )
        print("Programa 'Ingeniería de Sistemas' creado exitosamente.")
    else:
        print("El programa ya existe.")

if __name__ == "__main__":
    create_initial_data()
