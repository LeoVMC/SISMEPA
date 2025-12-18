"""
Script para poblar el pensum de Ingeniería de Telecomunicaciones.
Ejecutar desde la raíz del proyecto: python scripts/populate_telecom.py
"""
import os
import sys

# Agregar directorio raíz del proyecto al path (funciona desde cualquier ubicación)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
sys.path.insert(0, PROJECT_ROOT)

import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sismepa.settings")
django.setup()

from gestion.models import Programa, Asignatura
from django.db import transaction

def run():
    print("Starting Pensum Population for Ingeniería de Telecomunicaciones...")

    with transaction.atomic():
        # 1. Get or Create Program
        programa, created = Programa.objects.get_or_create(
            nombre_programa="Ingeniería de Telecomunicaciones",
            defaults={"duracion_anios": 5, "titulo_otorgado": "Ingeniero de Telecomunicaciones"}
        )
        if created:
            print("Created new program: Ingeniería de Telecomunicaciones")
        else:
            print("Found existing program: Ingeniería de Telecomunicaciones")
            # Optional: Clear existing subjects for this program to ensure clean state
            count, _ = Asignatura.objects.filter(programa=programa).delete()
            print(f"Cleared {count} existing subjects for update.")

        # 2. Define Data
        # Format: (Code, Name, UC, Semester, [Prereq_Codes])
        subjects_data = [
            # SEMESTRE I (23 UC)
            ("ADG-26123", "HOMBRE, SOCIEDAD Y TECNOLOGÍA", 3, 1, []),
            ("ADG-25132", "EDUCACIÓN AMBIENTAL", 2, 1, []),
            ("IDM-24113", "INGLÉS I", 3, 1, []),
            ("MAT-21212", "DIBUJO", 2, 1, []),
            ("MAT-21215", "MATEMÁTICA I", 5, 1, []),
            ("MAT-21524", "GEOMETRÍA ANALÍTICA", 4, 1, []),
            ("ADG-25131", "SEMINARIO I", 1, 1, []),
            ("DIN-21113", "DEFENSA INTEGRAL DE LA NACIÓN I", 3, 1, []),

            # SEMESTRE II (25 UC)
            ("QUF-23015", "FÍSICA I", 5, 2, ["MAT-21215", "MAT-21524"]),
            ("QUF-22014", "QUÍMICA GENERAL", 4, 2, []),
            ("IDM-24123", "INGLÉS II", 3, 2, ["IDM-24113"]),
            ("MAT-21114", "ÁLGEBRA LINEAL", 4, 2, ["MAT-21215", "MAT-21524"]),
            ("MAT-21225", "MATEMÁTICA II", 5, 2, ["MAT-21215", "MAT-21524"]),
            ("ADG-25141", "SEMINARIO II", 1, 2, ["ADG-25131"]),
            ("DIN-21123", "DEFENSA INTEGRAL DE LA NACIÓN II", 3, 2, ["DIN-21113"]),
            ("ACT-COM01", "ACTIVIDAD COMPLEMENTARIA (DEPORTIVA)", 0, 2, []),
            ("ACT-COM02", "ACTIVIDAD COMPLEMENTARIA (CULTURAL)", 0, 2, []),

            # SEMESTRE III (24 UC)
            ("QUF-23025", "FÍSICA II", 5, 3, ["QUF-23015", "MAT-21225"]),
            ("MAT-21414", "PROBABILIDADES Y ESTADÍSTICAS", 4, 3, ["MAT-21225"]),
            ("SYC-22113", "PROGRAMACIÓN", 3, 3, ["MAT-21114"]),
            ("MAT-21224", "TRANSFORMADAS INTEGRALES", 4, 3, ["MAT-21114"]),
            ("MAT-21235", "MATEMÁTICA III", 5, 3, ["MAT-21225"]),
            ("DIN-21133", "DEFENSA INTEGRAL DE LA NACIÓN III", 3, 3, ["DIN-21123"]),

            # SEMESTRE IV (27 UC)
            ("QUF-33013", "FÍSICA III", 3, 4, ["QUF-23025", "MAT-21235"]),
            ("TLC-31115", "REDES ELÉCTRICAS I", 5, 4, ["QUF-23025", "MAT-21235"]),
            ("ELN-35135", "SEÑALES Y SISTEMAS", 5, 4, ["MAT-21224"]),
            ("ELN-35114", "TEORÍA ELECTROMAGNÉTICA", 4, 4, ["MAT-21235"]),
            ("CJU-37314", "MARCO LEGAL PARA EL EJERCICIO DE LA INGENIERÍA", 4, 4, []),
            ("AGL-35410", "SEMINARIO DE TELECOMUNICACIONES I", 3, 4, []),
            ("DIN-31143", "DEFENSA INTEGRAL DE LA NACIÓN IV", 3, 4, ["DIN-21133"]),
            ("ACT-COM03", "ACTIVIDAD COMPLEMENTARIA (DEPORTIVA)", 0, 4, []),

            # SEMESTRE V (30 UC)
            ("TLC-31225", "ELECTRÓNICA I", 5, 5, ["QUF-33013"]),
            ("TLC-31125", "REDES ELÉCTRICAS II", 5, 5, ["TLC-31115"]),
            ("TLC-32125", "SISTEMAS DIGITALES", 5, 5, []), 
            ("TLC-35215", "COMUNICACIONES I", 5, 5, []),
            ("TLC-35314", "LÍNEAS DE TRANSMISIÓN", 4, 5, []),
            ("DIN-31153", "DEFENSA INTEGRAL DE LA NACIÓN V", 3, 5, ["DIN-31143"]),
            ("ADG-10820", "CÁTEDRA BOLIVARIANA I", 0, 5, []),
            ("ELE-NOTEC01-TLC", "ELECTIVA NO TÉCNICA", 3, 5, []),

            # SEMESTRE VI (32 UC)
            ("TLC-31235", "ELECTRÓNICA II", 5, 6, ["TLC-31225"]),
            ("ELN-32225", "MICROPROCESADORES", 5, 6, ["TLC-32125", "TLC-31225"]),
            ("TLC-31514", "INSTRUMENTACIÓN DE LAS COMUNICACIONES", 4, 6, ["TLC-35215"]),
            ("TLC-35225", "COMUNICACIONES II", 5, 6, ["TLC-35215"]),
            ("ELN-35325", "MICROONDAS", 5, 6, ["TLC-35314"]),
            ("SYC-32315", "COMPUTACIÓN AVANZADA", 5, 6, ["TLC-32125"]), 
            ("ADG-10821", "CÁTEDRA BOLIVARIANA II", 0, 6, []),
            ("ACT-COM04", "ACTIVIDAD COMPLEMENTARIA (CULTURAL)", 0, 6, []),
            ("DIN-31163", "DEFENSA INTEGRAL DE LA NACIÓN VI", 3, 6, ["DIN-31153"]),
            ("TAI-01-TLC", "TALLER DE SERVICIO COMUNITARIO", 0, 6, []),

            # SEMESTRE VII (30 UC)
            ("TLC-31325", "ELECTRÓNICA DE LAS COMUNICACIONES", 5, 7, ["TLC-31235", "TLC-35225"]),
            ("AGM-30314", "MANTENIMIENTO GENERAL", 4, 7, []),
            ("TLC-35414", "SISTEMAS DE COMUNICACIONES I", 4, 7, ["TLC-35225"]),
            ("ELN-35323", "COMUNICACIONES ÓPTICAS", 3, 7, ["TLC-35225"]),
            ("ELN-35344", "ANTENAS", 4, 7, ["ELN-35325"]),
            ("ADG-30214", "METODOLOGÍA DE LA INVESTIGACIÓN", 4, 7, []),
            ("DIN-31173", "DEFENSA INTEGRAL DE LA NACIÓN VII", 3, 7, ["DIN-31163"]),
            ("ELE-NOTEC02-TLC", "ELECTIVA NO TÉCNICA", 3, 7, []),
            ("PRO-01-TLC", "PROYECTO DE SERVICIO COMUNITARIO", 0, 7, []),

            # SEMESTRE VIII (24 UC)
            ("TLC-35455", "REDES DE TELECOMUNICACIONES", 5, 8, ["TLC-31325"]),
            ("AGL-35423", "SEMINARIO DE TELECOMUNICACIONES II", 3, 8, []),
            ("TLC-35424", "SISTEMAS DE COMUNICACIONES II", 4, 8, ["TLC-35414"]),
            ("TLC-31323", "TRANSMISIÓN DE DATOS", 3, 8, []),
            ("DIN-31183", "DEFENSA INTEGRAL DE LA NACIÓN VIII", 3, 8, ["DIN-31173"]),
            ("ELE-TEC01-TLC", "ELECTIVA TÉCNICA", 3, 8, []),
            ("ELE-TEC02-TLC", "ELECTIVA TÉCNICA", 3, 8, []),

            # SEMESTRE IX (10 UC)
            ("PSI-30010", "PASANTÍA || TRABAJO ESPECIAL DE GRADO", 10, 9, []), # Requires all previous credits
        ]

        # 3. Create Subjects
        created_subjects = {}
        for idx, (code, name, uc, sem, _) in enumerate(subjects_data, 1):
            if code == "TAI-01-TLC": code = "TAI-01" # Normalizing for frontend logic
            if code == "PRO-01-TLC": code = "PRO-01" # Normalizing for frontend logic
            if code.startswith("ELE-NOTEC") and "-TLC" in code: code = code.split("-TLC")[0] # Normalizing
            if code.startswith("ELE-TEC") and "-TLC" in code: code = code.split("-TLC")[0]
            
            subj = Asignatura.objects.create(
                nombre_asignatura=name,
                codigo=code,
                creditos=uc,
                semestre=sem,
                programa=programa,
                orden=idx
            )
            created_subjects[code] = subj
            print(f"Created {code}: {name}")

        # 4. Link Prerequisites
        print("Linking prerequisites...")
        for code, _, _, _, prereqs in subjects_data:
            if code == "TAI-01-TLC": code = "TAI-01"
            if code == "PRO-01-TLC": code = "PRO-01"
            if code.startswith("ELE-NOTEC") and "-TLC" in code: code = code.split("-TLC")[0]
            if code.startswith("ELE-TEC") and "-TLC" in code: code = code.split("-TLC")[0]
            
            if prereqs:
                target = created_subjects.get(code)
                if not target: continue
                
                for p_code in prereqs:
                    if p_code == "TAI-01-TLC": p_code = "TAI-01"
                    if p_code in created_subjects:
                        target.prelaciones.add(created_subjects[p_code])
                    else:
                        print(f"WARNING: Prerequisite {p_code} not found for {code}")

    print("Success! Telecom Pensum created.")

if __name__ == "__main__":
    run()
