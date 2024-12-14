from django.db import models
from church.models import Church

class Payment(models.Model):
    payment_id = models.CharField(max_length=100)
    transaction_id = models.CharField(max_length=100)
    church = models.ForeignKey(Church, on_delete=models.CASCADE, null=True, blank = True)
    date = models.DateTimeField()
    amount = models.IntegerField()
    success = models.BooleanField()
    email = models.EmailField()
    deleted = models.BooleanField(default=False)