from django.contrib.auth.backends import BaseBackend
from .models import User

class CustomAuthBackend(BaseBackend):
    def authenticate(request, email=None, password=None, **kwargs):
        print("++++++", request)
        print("++++++", email)
        print("++++++", password)
        try:
            user = User.objects.get(email=email)
            if user.deleted:
                return None
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            return None