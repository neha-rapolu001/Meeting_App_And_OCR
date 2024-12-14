from django.urls import path
from rest_framework import routers
from .views import subscription

router = routers.DefaultRouter()


urlpatterns = [
    path('subscription/', subscription, name='subscription'),
    path('subscription/<int:sid>/', subscription, name='subscription')    
]
