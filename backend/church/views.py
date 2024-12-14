from .models import Church
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializers import ChurchSerializer
from payment.models import Payment
import payment.views as pv
"""
church() view responds to get requests by serving all
church objects in the database; responds to post request
by adding a new church to the database.
"""
@api_view(['GET', 'POST', 'PUT'])
def church(request):
    if request.method == 'GET':
        queryset = Church.objects.filter(deleted=False)
        serialized_queryset = [ChurchSerializer(church).data for church in queryset if not church.deleted]
        return Response(serialized_queryset, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        print(request.data)
        serializer = ChurchSerializer(data=request.data)
        if serializer.is_valid():
            church = serializer.save()
            print(request.data)
            payment_id =  request.data.get('payment_id')
            payment = Payment.objects.get(payment_id=payment_id)
            payment.church = church
            payment.save()
            return Response({'message': 'Church added.','id':int(church.id)}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT','DELETE'])
def edit_church(request,id):
    if request.method == 'PUT':
        try:
            church_id = id
            church = Church.objects.get(id=church_id, deleted=False)
        except Church.DoesNotExist:
            return Response({'message': 'Church not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ChurchSerializer(church, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Church updated successfully.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        try:
            church_id = id
            church = Church.objects.get(id=church_id, deleted=False)
            church.deleted = True
            church.save()
            return Response({'message': 'Church deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
        except Church.DoesNotExist:
            return Response({'message': 'Church not found.'}, status=status.HTTP_404_NOT_FOUND)
        
@api_view(['POST'])
def check_church_exists(request):
    church_name = request.data.get('churchName')
    print("church name to backend: ", church_name)
    if Church.objects.filter(name__iexact=church_name).exists():
        return Response({'exists': True})
    return Response({'exists': False})

