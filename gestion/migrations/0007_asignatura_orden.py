
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gestion', '0006_seccion_remove_pedido_cliente_delete_example_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='asignatura',
            name='orden',
            field=models.IntegerField(default=0),
        ),
    ]
