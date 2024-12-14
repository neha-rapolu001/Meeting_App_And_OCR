from django.db import models
from church.models import Church
from quickstart.models import User
from meeting.models import Meeting

class Task(models.Model):
    id = models.AutoField(primary_key=True)
    task_name = models.CharField(max_length=255)
    employees = models.ManyToManyField('person.Person')
    start_date = models.DateField()
    end_date = models.DateField()
    deleted = models.BooleanField(default=False)
    is_completed = models.BooleanField(default=False)
    priority = models.CharField(max_length=255)
    task_description = models.CharField(max_length=500)
    meeting_id = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name='tasks', null=True, blank=True)
    meetings = models.ManyToManyField('meeting.Meeting', blank=True)
    meeting_task_id = models.PositiveIntegerField(unique=True, null=True, blank=True)
    created_by =models.ForeignKey(User, on_delete=models.CASCADE, related_name='taskuser')
    church=models.ForeignKey(Church, on_delete=models.CASCADE, related_name='taskchurch')

