from django.db import models
from person.models import Person

class Group(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    persons = models.ManyToManyField('person.Person', blank=True)
    deleted = models.BooleanField(default=False)
