# Generated by Django 4.2.5 on 2024-05-14 21:45

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0009_alter_task_meeting_id'),
    ]

    operations = [
        migrations.RenameField(
            model_name='task',
            old_name='is_delete',
            new_name='deleted',
        ),
    ]
