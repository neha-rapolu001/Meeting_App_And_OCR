from django.apps import AppConfig


class TasksConfig(AppConfig):
    # Set the default auto-generated field for models in the app to 'django.db.models.BigAutoField'
    default_auto_field = 'django.db.models.BigAutoField'
    # Specify the name of the Django app that this configuration belongs to as 'tasks'
    name = 'tasks'

    def ready(self):
        import tasks.signals 
        print("Signals are connected!")