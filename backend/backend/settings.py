"""
Django settings for backend project.

Generated by 'django-admin startproject' using Django 4.1.7.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.1/ref/settings/
"""

from pathlib import Path
from drf_yasg import openapi
from google.oauth2 import service_account

import os
from dotenv import load_dotenv

load_dotenv()

import pymysql
pymysql.install_as_MySQLdb()

import ssl
ssl._create_default_https_context = ssl._create_unverified_context


# import ssl
# import certifi
# # Disable SSL certificate verification
# ssl_context = ssl.create_default_context(cafile=certifi.where())
# ssl_context.check_hostname = False
# ssl_context.verify_mode = ssl.CERT_NONE

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

GS_CREDENTIALS = service_account.Credentials.from_service_account_file(
   os.path.join(BASE_DIR, os.getenv('GCP_CREDENTIALS'))
)

# Google Cloud Storage configuration
DEFAULT_FILE_STORAGE = 'storages.backends.gcloud.GoogleCloudStorage'
GS_BUCKET_NAME = os.getenv('GCP_BUCKET_NAME')

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
EMAIL_PORT = 587
EMAIL_USE_TLS = True

ALLOWED_HOSTS = [
    'https://meeting-app-and-ocr-862a4.web.app',
    'localhost',
    '127.0.0.1',
    'localhost:3000',
    'https://meeting-app-and-ocr-two.vercel.app',
    '*'
]


STATIC_URL = '/static/'
#MEDIA_URL = '/media/'
# Media files URL
MEDIA_URL = os.getenv('GCP_MEDIA_URL')

STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
#MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'quickstart',
    #'schedule',
    #'scheduler',
    'meeting',
    'person',
    #'meeting2',
    'tasks',
    'corsheaders',
    'drf_yasg',
    'church',
    'subscription',
    'group',
    'requestuser',
    'payment',
    'django_apscheduler'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'templates',
            BASE_DIR / 'meeting/templates',
            BASE_DIR / 'tasks/templates',
            BASE_DIR / 'quickstart/templates',
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

SWAGGER_SETTINGS = {
    "DEFAULT_AUTO_SCHEMA_CLASS": "your_project.utils.CustomAutoSchema",
    "DEFAULT_INFO": "backend.swagger_info",
    'DEFAULT_API_URL': 'openapi-schema',
    'DEFAULT_API_TITLE': 'Your API Title',
    'DEFAULT_API_DESCRIPTION': 'Your API Description',
    'DEFAULT_API_VERSION': '1.0.0',
}


WSGI_APPLICATION = 'backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

'''
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'HOST': os.getenv('EMAIL_HOST_USER'),
        'PORT': os.getenv('DB_PORT'),
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
    }   
}
'''
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
    'DEFAULT_PARSER_CLASSES': (
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ),
}

# Set maximum size of request body to 5M
DATA_UPLOAD_MAX_MEMORY_SIZE = 10485760

# Password validation
# https://docs.djangoproject.com/en/4.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.1/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

# Default primary key field type
# https://docs.djangoproject.com/en/4.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10
}

CORS_ORIGIN_ALLOW_ALL = True

CORS_ALLOWED_ORIGINS = ['http://localhost:3000', 'https://meeting-app-and-ocr-862a4.web.app', 'https://meeting-app-and-ocr-two.vercel.app']

CSRF_TRUSTED_ORIGINS = ['http://localhost:3000', 'https://meeting-app-and-ocr-862a4.web.app', 'https://meeting-app-and-ocr-two.vercel.app']

CORS_ORIGIN_WHITELIST = [
    'http://localhost:3000',
    'https://meeting-app-and-ocr-862a4.web.app',
    'https://meeting-app-and-ocr-two.vercel.app'
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
