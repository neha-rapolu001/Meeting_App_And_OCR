from django.urls import path
from rest_framework import routers
from .views import person, delete_person, get_person

router = routers.DefaultRouter()
# URLs for the meeting app.
# 'meeting/': Endpoint for CRUD operations on meeting objects.
urlpatterns = [
    path('person/', person, name='person'),
    path('get_person/<int:id>', get_person, name="get_person"),
    path('person/<int:pid>', delete_person, name='delete_person')
]

