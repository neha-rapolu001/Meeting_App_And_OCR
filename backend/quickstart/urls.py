from django.urls import path, include
from .views import get_users, signup, login_view, logout_view, delete_user, update_user, check_email_exists
# from .views import TaskViewSet
from rest_framework import routers
from django.contrib.auth import views as auth_views


router = routers.DefaultRouter()
# router.register('tasks', TaskViewSet)

urlpatterns = [
    path('users/<int:cid>', get_users, name='users'),
    path('deleteuser/<int:user_id>/', delete_user, name='deleteuser'),
    path('updateuser/', update_user, name="updateuser"),
    path('signup/', signup, name='signup'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('signup/check-email/', check_email_exists, name='check_email_exists'),
    # path('', include(router.urls))
]