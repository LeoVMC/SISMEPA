
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('gestion', '0021_remove_asignatura_docente_remove_estudiante_apellido_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='programa',
            options={'ordering': ['nombre_programa']},
        ),
    ]
