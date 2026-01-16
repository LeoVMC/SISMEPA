
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gestion', '0016_add_partial_grades'),
    ]

    operations = [
        migrations.AddField(
            model_name='planificacion',
            name='codigo_especifico',
            field=models.CharField(blank=True, help_text='Código específico para electivas o pasantía/tesis', max_length=20, null=True),
        ),
    ]
