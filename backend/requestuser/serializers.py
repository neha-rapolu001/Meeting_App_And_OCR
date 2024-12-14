# myapp/serializers.py

from rest_framework import serializers
from .models import RequestUser
# from .models import Task

#Serialiser to create a user
class RequestUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestUser
        fields = '__all__'


    def create(self, validated_data):
        user = RequestUser.objects.create_user(**validated_data)
        return user
