from django.urls import path
from rest_framework import routers
from .views import group

router = routers.DefaultRouter()
# URLs for the meeting app.
# 'group/': Endpoint for CRUD operations on group objects.
urlpatterns = [
    path('group/', group, name='group')
]

