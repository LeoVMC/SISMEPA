
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('gestion', '0010_alter_asignatura_codigo_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='asignatura',
            name='tutores_academicos',
        ),
        migrations.RemoveField(
            model_name='asignatura',
            name='tutores_comunitarios',
        ),
    ]
