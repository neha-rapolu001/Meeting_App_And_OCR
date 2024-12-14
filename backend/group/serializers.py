from rest_framework import serializers
from .models import Group
# Serializer class for the Group model.
class GroupSerializer(serializers.ModelSerializer):
    # Specifies the metadata for the serializer, including the model and fields to include.
    class Meta:
        model = Group
        fields = '__all__'
