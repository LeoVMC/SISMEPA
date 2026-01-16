
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gestion', '0019_horario'),
    ]

    operations = [
        migrations.AddField(
            model_name='detalleinscripcion',
            name='nota_reparacion',
            field=models.DecimalField(blank=True, decimal_places=2, help_text='Nota de reparación. Si se carga, reemplaza por completo la nota final.', max_digits=4, null=True),
        ),
    ]
