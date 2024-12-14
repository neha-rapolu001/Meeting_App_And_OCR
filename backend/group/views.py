from .models import Group
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializers import GroupSerializer

"""
person() view responds to get requests by serving all
person objects in the database; responds to post request
by adding a new person to the database.
"""
@api_view(['GET', 'POST'])
def group(request):
    if request.method == 'GET':
        queryset = Group.objects.all()
        serialized_queryset = [GroupSerializer(group).data for group in queryset if not group.deleted]
        return Response(serialized_queryset, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        serializer = GroupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'group added.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

