
from gestion.models import Programa, Asignatura
from django.db import transaction

def run():
    print("Starting Pensum Recreation for Ingeniería de Sistemas (Strict Order & Full Names)...")

    with transaction.atomic():
        # 1. Get or Create Program
        programa, created = Programa.objects.get_or_create(
            nombre_programa="Ingeniería de Sistemas",
            defaults={"duracion_anios": 5, "titulo_otorgado": "Ingeniero de Sistemas"}
        )
        if created:
            print("Created new program: Ingeniería de Sistemas")
        else:
            print("Found existing program: Ingeniería de Sistemas")

        # 2. Delete existing subjects
        deleted_count, _ = Asignatura.objects.filter(programa=programa).delete()
        print(f"Deleted {deleted_count} existing subjects.")

        # 3. Define Data
        # Format: (Code, Name, UC, Semester, [Prereq_Codes])
        # Order reflects the vertical position in the flowchart columns
        subjects_data = [
            # SEMESTRE I
            ("MAT-21215", "MATEMÁTICA I", 5, 1, []),
            ("MAT-21524", "GEOMETRÍA ANALÍTICA", 4, 1, []),
            ("ADG-25123", "HOMBRE, SOCIEDAD, CIENCIA Y TECNOLOGÍA", 3, 1, []), # Full Name Updated
            ("MAT-21212", "DIBUJO", 2, 1, []),
            ("ADG-25132", "EDUCACIÓN AMBIENTAL", 2, 1, []),
            ("IDM-24113", "INGLÉS I", 3, 1, []),
            ("ACT-CULT01", "ACTIVIDAD COMPLEMENTARIA (CULTURAL)", 0, 1, []),
            ("ADG-25131", "SEMINARIO I", 1, 1, []),
            ("DIN-21113", "DEFENSA INTEGRAL DE LA NACIÓN I", 3, 1, []),

            # SEMESTRE II
            ("MAT-21225", "MATEMÁTICA II", 5, 2, ["MAT-21215", "MAT-21524"]),
            ("QUF-23015", "FÍSICA I", 5, 2, ["MAT-21215", "MAT-21524"]),
            ("ACT-DEP01", "ACTIVIDAD COMPLEMENTARIA (DEPORTIVA)", 0, 2, []),
            ("MAT-21114", "ÁLGEBRA LINEAL", 4, 2, ["MAT-21215", "MAT-21524"]),
            ("QUF-22014", "QUÍMICA GENERAL", 4, 2, []),
            ("IDM-24123", "INGLÉS II", 3, 2, ["IDM-24113"]),
            ("ACT-CULT02", "ACTIVIDAD COMPLEMENTARIA (CULTURAL)", 0, 2, []),
            ("ADG-25141", "SEMINARIO II", 1, 2, ["ADG-25131"]),
            ("DIN-21123", "DEFENSA INTEGRAL DE LA NACIÓN II", 3, 2, ["DIN-21113"]),

            # SEMESTRE III
            ("MAT-21235", "MATEMÁTICA III", 5, 3, ["MAT-21225"]),
            ("QUF-23025", "FÍSICA II", 5, 3, ["QUF-23015", "MAT-21225"]),
            ("MAT-21414", "PROBABILIDAD Y ESTADÍSTICA", 4, 3, ["MAT-21225"]),
            ("SYC-22113", "PROGRAMACIÓN", 3, 3, ["MAT-21114"]),
            ("AGG-22313", "SISTEMAS ADMINISTRATIVOS", 4, 3, []),
            ("DIN-21133", "DEFENSA INTEGRAL DE LA NACIÓN III", 3, 3, ["DIN-21123"]),

            # SEMESTRE IV
            ("MAT-31714", "CÁLCULO NUMÉRICO", 4, 4, ["MAT-21235"]),
            ("SYC-32114", "TEORÍA DE LOS SISTEMAS", 4, 4, []),
            ("MAT-31214", "LÓGICA MATEMÁTICA", 4, 4, ["MAT-21114"]),
            ("ACT-DEP02", "ACTIVIDAD COMPLEMENTARIA (DEPORTIVA)", 0, 4, []),
            ("SYC-32225", "LENGUAJE DE PROGRAMACIÓN I", 5, 4, ["SYC-22113"]),
            ("SYC-32414", "PROCESAMIENTO DE DATOS", 4, 4, ["SYC-22113"]),
            ("AGL-30214", "SISTEMAS DE PRODUCCIÓN", 4, 4, ["AGG-22313"]),
            ("DIN-31143", "DEFENSA INTEGRAL DE LA NACIÓN IV", 3, 4, ["DIN-21133"]),

            # SEMESTRE V
            ("MAT-30925", "INVESTIGACIÓN DE OPERACIONES", 5, 5, ["MAT-31714"]),
            ("MAT-31104", "TEORÍA DE GRAFOS", 4, 5, ["MAT-31214", "MAT-21414"]), # Logic + Prob
            ("SYC-32514", "ANÁLISIS DE SISTEMAS", 4, 5, ["SYC-32114"]), # Arrow from Teoria
            ("ELN-30514", "CIRCUITOS LÓGICOS", 4, 5, ["MAT-31214"]),
            ("SYC-32614", "BASES DE DATOS", 4, 5, ["SYC-32114", "SYC-32414"]), # Teoria + Procesamiento
            ("SYC-32235", "LENGUAJE DE PROGRAMACIÓN II", 5, 5, ["SYC-32225"]),
            ("CAT-BOL01", "CÁTEDRA BOLIVARIANA I", 0, 5, []),
            ("DIN-31153", "DEFENSA INTEGRAL DE LA NACIÓN V", 3, 5, ["DIN-31143"]),

            # SEMESTRE VI
            ("MAT-30935", "OPTIMIZACIÓN NO LINEAL", 5, 6, ["MAT-30925"]),
            ("MAT-31414", "PROCESOS ESTOCÁSTICOS", 4, 6, ["MAT-30925", "MAT-31104"]),
            ("SYC-32524", "DISEÑO DE SISTEMAS", 4, 6, ["SYC-32514"]),
            ("SYC-30525", "ARQUITECTURA DEL COMPUTADOR", 5, 6, ["ELN-30514"]),
            ("SYC-30834", "SISTEMAS OPERATIVOS", 4, 6, []),
            ("SYC-32245", "LENGUAJE DE PROGRAMACIÓN III", 5, 6, ["SYC-32235"]),
            ("CAT-BOL02", "CÁTEDRA BOLIVARIANA II", 0, 6, []),
            ("DIN-31163", "DEFENSA INTEGRAL DE LA NACIÓN VI", 3, 6, ["DIN-31153"]),

             # SEMESTRE VII
            ("MAT-30945", "SIMULACIÓN Y MODELOS", 5, 7, ["MAT-30935", "MAT-31414"]),
            ("ADG-30214", "METODOLOGÍA DE LA INVESTIGACIÓN", 4, 7, []),
            ("SYC-32714", "IMPLANTACIÓN DE SISTEMAS", 4, 7, ["SYC-32524"]),
            ("ADG-30224", "GERENCIA DE LA INFORMÁTICA", 4, 7, []),
            ("SYC-31644", "REDES", 4, 7, ["SYC-30834"]),
            ("TAI-01", "TALLER DE SERVICIO COMUNITARIO", 0, 7, []),
            ("ELE-TEC01", "ELECTIVA TÉCNICA", 3, 7, []),
            ("ELE-NOTEC01", "ELECTIVA NO TÉCNICA", 3, 7, []),
            ("DIN-31173", "DEFENSA INTEGRAL DE LA NACIÓN VII", 3, 7, ["DIN-31163"]),

            # SEMESTRE VIII
            ("MAT-31314", "TEORÍA DE DECISIONES", 4, 8, ["MAT-30945"]),
            ("CJU-37314", "MARCO LEGAL PARA EL EJERCICIO DE LA INGENIERÍA", 4, 8, []), # Full Name Updated
            ("SYC-32814", "AUDITORÍA DE SISTEMAS", 4, 8, ["SYC-32714"]),
            ("TTC-31154", "TELEPROCESOS", 4, 8, ["SYC-31644"]),
            ("PRO-01", "PROYECTO DE SERVICIO COMUNITARIO", 0, 8, ["TAI-01"]),
            ("ELE-TEC02", "ELECTIVA TÉCNICA", 3, 8, []),
            ("ELE-NOTEC02", "ELECTIVA NO TÉCNICA", 3, 8, []),
            ("DIN-31183", "DEFENSA INTEGRAL DE LA NACIÓN VIII", 3, 8, ["DIN-31173"]),

            # SEMESTRE IX
            ("PSI-30010", "PASANTÍA || TRABAJO ESPECIAL DE GRADO", 10, 9, []), # Requires all previous credits
        ]

        # 4. Insert Subjects
        created_subjects = {}
        for idx, (code, name, uc, sem, _) in enumerate(subjects_data, 1):
            subj = Asignatura.objects.create(
                nombre_asignatura=name,
                codigo=code,
                creditos=uc,
                semestre=sem,
                programa=programa,
                orden=idx # Setting explicit order
            )
            created_subjects[code] = subj
            print(f"Created {code}: {name} (Order: {idx})")

        # 5. Link Prerequisites
        print("Linking prerequisites...")
        for code, _, _, _, prereqs in subjects_data:
            if prereqs:
                target = created_subjects[code]
                
                for p_code in prereqs:
                    if p_code in created_subjects:
                        target.prelaciones.add(created_subjects[p_code])
                    else:
                        print(f"WARNING: Prerequisite {p_code} not found for {code}")

    print("Success! Pensum recreated with correct names and order.")
