from django.urls import path, include
from rest_framework import routers
from .views import schedule, ocr, edit_meeting, upload_image

router = routers.DefaultRouter()
# URLs for the meeting app.
# 'meeting/': Endpoint for CRUD operations on meeting objects.
urlpatterns = [
    path('meeting/', schedule, name='meeting'),
    path('meeting/<int:pk>', edit_meeting, name='edit'),
    path('meeting/ocr', ocr, name='ocr'),
    path('upload/', upload_image, name='upload_image'),
]

