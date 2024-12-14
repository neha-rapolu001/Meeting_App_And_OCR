from rest_framework import serializers
from .models import Church

class ChurchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Church
        fields = '__all__'

    def create(self, validated_data):
        church = Church.objects.createChurch(**validated_data)
        return church
