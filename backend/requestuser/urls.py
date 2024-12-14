from django.urls import path, include
from .views import get_requests, signup, login_view, logout_view, delete_user,approve_status_on_deny,approve_status_on_approve,restore_status
# from .views import TaskViewSet
from rest_framework import routers

router = routers.DefaultRouter()
# router.register('tasks', TaskViewSet)

urlpatterns = [
    path('signup-approve/', signup, name='signup'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('requests/<int:cid>', get_requests, name='requests'),
    path('deleterequest/<int:user_id>/', delete_user, name='requests'),
    path('approve_status_on_deny/<int:user_id>/', approve_status_on_deny, name='approve_status_on_deny'),
    path('approve_status_on_approve/<int:user_id>/', approve_status_on_approve, name='approve_status_on_approve'),
    path('restore_status/<int:user_id>/', restore_status, name='restore_status'),
    
    # path('', include(router.urls)),

]
