# Generated by Django 4.2.5 on 2024-03-22 01:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('requestuser', '0002_alter_requestuser_church_alter_requestuser_password'),
    ]

    operations = [
        migrations.AlterField(
            model_name='requestuser',
            name='password',
            field=models.CharField(max_length=200),
        ),
    ]