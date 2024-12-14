from django.db import models
from church.models import Church
from quickstart.models import User

# Represents a meeting entity for the 'meeting' app.
class Meeting(models.Model):
    # The primary key for the meeting.
    id = models.AutoField(primary_key=True)
    # The name of the meeting.
    name = models.CharField(max_length=255)
    # The type or category of the meeting.
    type = models.CharField(max_length=255)
    # The date of the meeting.
    date = models.DateField()
    # The time of the meeting.
    time = models.TimeField()
    # A field to store the list of attendees.
    attendees = models.ManyToManyField('person.Person', blank=True)
    # Agenda for meeting.
    agenda = models.TextField(default='')
    # Additional notes or details about the meeting.
    notes = models.TextField(default='')
    # An image for notes.
    notes_image = models.URLField(max_length=500, null=True, blank=True)
    objective = models.TextField(default='')
    questions = models.TextField(default='')
    action_steps = models.TextField(default='')
    # Tasks associated with this meeting.
    meeting_tasks = models.ManyToManyField('tasks.Task', blank=True)
    # Indicates if the meeting has been deleted.
    deleted = models.BooleanField(default=False)

    created_by =models.ForeignKey(User, on_delete=models.CASCADE, related_name='meetinguser')

    church=models.ForeignKey(Church, on_delete=models.CASCADE, related_name='meetingchurch')