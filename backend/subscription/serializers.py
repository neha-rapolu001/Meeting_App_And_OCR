from rest_framework import serializers
from .models import Subscription
# Serializer class for the Meeting model.
class SubscriptionSerializer(serializers.ModelSerializer):
    # Specifies the metadata for the serializer, including the model and fields to include.
    class Meta:
        model = Subscription
        fields = '__all__'