
from django.db import models

class Subscription(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    price = models.FloatField()
    count = models.IntegerField(default=1)
    deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name

