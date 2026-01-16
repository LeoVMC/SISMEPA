
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gestion', '0014_add_seccion_to_detalleinscripcion'),
    ]

    operations = [
        migrations.AddField(
            model_name='periodoacademico',
            name='inscripciones_activas',
            field=models.BooleanField(default=False, help_text='Indica si las inscripciones están abiertas para este período'),
        ),
    ]
