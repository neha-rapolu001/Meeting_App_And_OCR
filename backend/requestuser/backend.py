from django.contrib.auth.backends import BaseBackend
from .models import RequestUser

class CustomAuthBackend(BaseBackend):
    def authenticate(request, email=None, password=None, **kwargs):
        print("++++++", request)
        print("++++++", email)
        print("++++++", password)
        
        try:
            user = RequestUser.objects.get(email=email)
            print("user status:", user.deny_status)
            if user.deny_status:  # Check if the user is marked as deleted or inactive
                return None
            if user.check_password(password):
                return user
        except RequestUser.DoesNotExist:
            return None
        