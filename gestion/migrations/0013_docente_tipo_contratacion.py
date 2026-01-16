
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gestion', '0012_administrador_docente'),
    ]

    operations = [
        migrations.AddField(
            model_name='docente',
            name='tipo_contratacion',
            field=models.CharField(choices=[('Tiempo Completo', 'Tiempo Completo'), ('Tiempo Parcial', 'Tiempo Parcial')], default='Tiempo Completo', max_length=50),
        ),
    ]
