"""
Script para crear los períodos académicos iniciales.
Ejecutar con: python manage.py shell < scripts/create_periods.py
O manualmente: python manage.py shell y pegar el contenido.
"""
import django
django.setup()

from gestion.models import PeriodoAcademico
from datetime import date

periodos_data = [
    {
        'nombre_periodo': '1-2025',
        'fecha_inicio': date(2025, 5, 1),
        'fecha_fin': date(2025, 7, 31),
        'anio': 2025,
        'activo': False,
        'inscripciones_activas': False,
    },
    {
        'nombre_periodo': '2-2025',
        'fecha_inicio': date(2025, 10, 1),
        'fecha_fin': date(2026, 2, 28),
        'anio': 2025,
        'activo': True,  # Período actual activo
        'inscripciones_activas': False,  # Inscripciones cerradas por defecto
    },
    {
        'nombre_periodo': '1-2026',
        'fecha_inicio': date(2026, 5, 1),
        'fecha_fin': date(2026, 7, 31),
        'anio': 2026,
        'activo': False,
        'inscripciones_activas': False,
    },
]

for data in periodos_data:
    periodo, created = PeriodoAcademico.objects.update_or_create(
        nombre_periodo=data['nombre_periodo'],
        defaults=data
    )
    status = "Creado" if created else "Actualizado"
    print(f"{status}: {periodo.nombre_periodo} (Inscripciones: {'Abiertas' if periodo.inscripciones_activas else 'Cerradas'})")

print("\nPeríodos académicos configurados exitosamente.")
