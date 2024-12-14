from rest_framework import serializers
from .models import Person
# Serializer class for the Meeting model.
class PersonSerializer(serializers.ModelSerializer):
    # Specifies the metadata for the serializer, including the model and fields to include.
    class Meta:
        model = Person
        fields = '__all__'
