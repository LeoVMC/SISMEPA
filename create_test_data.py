from django.contrib.auth.models import User
from gestion.models import Programa, Asignatura, Estudiante, PeriodoAcademico, Inscripcion, DetalleInscripcion

u, created = User.objects.get_or_create(username='testuser', defaults={'first_name':'Test','last_name':'User','email':'test@example.com'})
prog, _ = Programa.objects.get_or_create(nombre_programa='Ingenieria', titulo_otorgado='Ingeniero', duracion_anios=5)
asigns = []
for i in range(1,6):
    a, _ = Asignatura.objects.get_or_create(programa=prog, codigo=f'IENG{i:03d}', nombre_asignatura=f'Asignatura {i}', creditos=3, semestre=((i-1)//1)+1)
    asigns.append(a)

est, _ = Estudiante.objects.get_or_create(usuario=u, defaults={'programa':prog, 'cedula':'V-123456', 'telefono':'0000'})
periodo,_ = PeriodoAcademico.objects.get_or_create(nombre_periodo='2-2025', fecha_inicio='2025-08-01', fecha_fin='2025-12-31')
insc,_ = Inscripcion.objects.get_or_create(estudiante=est, periodo=periodo)

for idx,a in enumerate(asigns, start=1):
    nota = 12.00 if idx<=3 else None
    DetalleInscripcion.objects.get_or_create(inscripcion=insc, asignatura=a, defaults={'nota_final':nota, 'estatus':'APROBADO' if nota else 'CURSANDO'})

print('Datos creados')
