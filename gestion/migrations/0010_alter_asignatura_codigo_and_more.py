
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gestion', '0009_asignatura_tutores_academicos_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='asignatura',
            name='codigo',
            field=models.CharField(max_length=20),
        ),
        migrations.AlterUniqueTogether(
            name='asignatura',
            unique_together={('codigo', 'programa')},
        ),
    ]
