# from django.db import models
# Create your models here.

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from church.models import Church

class UserManager(BaseUserManager):
    def create_user(self, email, first_name, last_name,user_type,church,password=None):
        if not email:
            raise ValueError('Users must have an email address')

        user = self.model(
            email=self.normalize_email(email),
            first_name=first_name,
            last_name=last_name,
            church=church,
            user_type=user_type,
            password=password
        )

        user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name, last_name, password,user_type,**extra_fields):
        user = self.create_user(
            email=self.normalize_email(email),
            first_name=first_name,
            last_name=last_name,
            password=password,
            user_type=user_type
        )
        user.is_admin = True
        user.save(using=self._db)
        return user
    
    def create_admin(self, email, first_name, last_name, password,user_type,church):
        user = self.create_user(
            email=self.normalize_email(email),
            first_name=first_name,
            last_name=last_name,
            password=password,
            user_type=2,
            church_id=church
        )
        user.is_admin = True
        user.save(using=self._db)
        return user
    
    def create_leader(self, email, first_name, last_name, password,user_type,church):
        user = self.create_user(
            email=self.normalize_email(email),
            first_name=first_name,
            last_name=last_name,
            password=password,
            user_type=3,
            church=church
        )
        user.is_admin = True
        user.save(using=self._db)
        return user

class RequestUser(AbstractBaseUser):
    email = models.EmailField(verbose_name='email address', max_length=255, unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    is_active = models.BooleanField(default=True)
    user_type = models.IntegerField(default=3)
    church = models.ForeignKey(Church, on_delete=models.CASCADE,blank=True)

    Approval_superuser = models.BooleanField(default=False)
    deny_status = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True,blank=True, null = True)
    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    @property
    def is_staff(self):
        return self.is_admin


    # Model for task table - legacy ?? I don't think this needs to be here
    class Task(models.Model):
        id = models.AutoField(primary_key=True)
        task_name = models.CharField(max_length=100)
        person_name = models.CharField(max_length=100)
        task_start_date = models.DateField()
        task_end_date = models.DateField()
        STATUS_CHOICES = [
            ('todo', 'To Do'),
            ('inprogress', 'In Progress'),
            ('done', 'Done'),
        ]
        status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')

