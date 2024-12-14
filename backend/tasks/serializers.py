from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        # Specify the model to be serialized as Task
        model = Task
        # Include all fields from the Task model in the serialized representation
        fields = '__all__'
