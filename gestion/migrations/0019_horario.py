
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gestion', '0018_useractivity'),
    ]

    operations = [
        migrations.CreateModel(
            name='Horario',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('dia', models.IntegerField(choices=[(1, 'Lunes'), (2, 'Martes'), (3, 'Miércoles'), (4, 'Jueves'), (5, 'Viernes'), (6, 'Sábado'), (7, 'Domingo')])),
                ('hora_inicio', models.TimeField()),
                ('hora_fin', models.TimeField()),
                ('aula', models.CharField(blank=True, max_length=50)),
                ('seccion', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='horarios', to='gestion.seccion')),
            ],
            options={
                'ordering': ['dia', 'hora_inicio'],
            },
        ),
    ]
