
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('gestion', '0020_add_nota_reparacion'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='asignatura',
            name='docente',
        ),
        migrations.RemoveField(
            model_name='estudiante',
            name='apellido',
        ),
        migrations.RemoveField(
            model_name='estudiante',
            name='email',
        ),
        migrations.RemoveField(
            model_name='estudiante',
            name='nombre',
        ),
    ]
