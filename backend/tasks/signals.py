
from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from .models import Task
from .views import send_notifications

@receiver(m2m_changed, sender=Task.employees.through)
def notify_task_employees(sender, instance, action, **kwargs):
    if action == "post_add":  # Trigger after employees are added
        print(f"Task updated with employees: {instance.task_name}")
        send_notifications(instance)

