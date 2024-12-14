from django.shortcuts import get_object_or_404
from .models import Subscription
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializers import SubscriptionSerializer

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def subscription(request, sid=None):
    if request.method == 'GET':
        # Handle GET request for listing subscriptions
        queryset = Subscription.objects.filter(deleted=False)
        serialized_queryset = SubscriptionSerializer(queryset, many=True).data
        return Response(serialized_queryset, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        # Handle POST request for creating a new subscription
        serializer = SubscriptionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Subscription added.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'PUT':
        # Handle PUT request for updating a subscription
        if sid is not None:
            subscription_instance = get_object_or_404(Subscription, pk=sid)
            serializer = SubscriptionSerializer(subscription_instance, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({'message': 'Subscription updated.'}, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Subscription ID is required for updating.'}, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        # Handle DELETE request for deleting a subscription
        if sid is not None:
            try:
                subscription = Subscription.objects.get(pk=sid,deleted=False)
            except Subscription.DoesNotExist:
                return Response({'message': 'Subscription not found'}, status=status.HTTP_404_NOT_FOUND)
            subscription.deleted=True
            subscription.save()
            return Response({'message': 'Subscription deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Subscription ID is required for deletion.'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'error': 'Invalid request method.'}, status=status.HTTP_400_BAD_REQUEST)