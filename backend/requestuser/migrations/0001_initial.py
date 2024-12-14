# Generated by Django 4.2.5 on 2024-03-21 17:31

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('church', '0002_alter_church_id'),
    ]

    operations = [
        migrations.CreateModel(
            name='Task',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('task_name', models.CharField(max_length=100)),
                ('person_name', models.CharField(max_length=100)),
                ('task_start_date', models.DateField()),
                ('task_end_date', models.DateField()),
                ('status', models.CharField(choices=[('todo', 'To Do'), ('inprogress', 'In Progress'), ('done', 'Done')], default='todo', max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='RequestUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('email', models.EmailField(max_length=255, unique=True, verbose_name='email address')),
                ('first_name', models.CharField(max_length=30)),
                ('last_name', models.CharField(max_length=30)),
                ('is_active', models.BooleanField(default=True)),
                ('user_type', models.IntegerField(default=3)),
                ('church', models.ForeignKey(blank=True, on_delete=django.db.models.deletion.CASCADE, to='church.church')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
