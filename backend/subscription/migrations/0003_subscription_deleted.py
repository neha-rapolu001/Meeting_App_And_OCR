# Generated by Django 4.2.5 on 2024-05-14 21:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('subscription', '0002_alter_subscription_count'),
    ]

    operations = [
        migrations.AddField(
            model_name='subscription',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
    ]
