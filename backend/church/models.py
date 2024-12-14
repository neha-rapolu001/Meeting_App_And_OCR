from django.db import models
from subscription.models import Subscription

class ChurchManager(models.Manager):
    def createChurch(self, **kwargs):
        return self.create(**kwargs)

class Church(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, blank=True, null=True)
    address = models.CharField(max_length=200, blank=True, null=True)
    ph_no = models.CharField(max_length=10, blank=True, null=True)
    email = models.CharField(max_length=20, blank=True, null=True)
    website = models.CharField(max_length=30, blank=True, null=True)
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name='churchSubscription', blank=True, null=True)
    deleted = models.BooleanField(default=False)
    date_created = models.DateTimeField(auto_now_add=True)


    objects = ChurchManager()