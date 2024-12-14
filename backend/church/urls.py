from django.urls import path
from rest_framework import routers
from .views import church,edit_church, check_church_exists

router = routers.DefaultRouter()
# URLs for the meeting app.
# 'church/': Endpoint for CRUD operations on church objects.
urlpatterns = [
    path('church/', church, name='church'),
    path('edit-church/<int:id>', edit_church, name='editChurch'),
    path('church/check-exists/', check_church_exists, name='check_church_exists'),
]
