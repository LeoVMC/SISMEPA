
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gestion', '0008_asignatura_tutores'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='asignatura',
            name='tutores_academicos',
            field=models.ManyToManyField(blank=True, related_name='tutorias_academicas_asignadas', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='asignatura',
            name='tutores_comunitarios',
            field=models.ManyToManyField(blank=True, related_name='tutorias_comunitarias_asignadas', to=settings.AUTH_USER_MODEL),
        ),
    ]
