
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gestion', '0015_add_inscripciones_activas'),
    ]

    operations = [
        migrations.AddField(
            model_name='detalleinscripcion',
            name='nota1',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=4, null=True),
        ),
        migrations.AddField(
            model_name='detalleinscripcion',
            name='nota2',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=4, null=True),
        ),
        migrations.AddField(
            model_name='detalleinscripcion',
            name='nota3',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=4, null=True),
        ),
        migrations.AddField(
            model_name='detalleinscripcion',
            name='nota4',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=4, null=True),
        ),
    ]
