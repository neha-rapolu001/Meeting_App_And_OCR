from django.contrib import admin
from django.urls import path,include
from rest_framework.authtoken import views
from django.views.generic import TemplateView
from drf_yasg.views import get_schema_view
from drf_yasg import views as yasg_views
from drf_yasg import openapi
from django.conf.urls.static import static
from django.conf import settings


schema_view = get_schema_view(
    openapi.Info(
        title="Your API Title",
        default_version='v1',
        description="Your API Description",
    ),
    public=True,
)

urlpatterns = [
  path('admin/', admin.site.urls),
  path('', include('meeting.urls')),
  path('', include('person.urls')),
  #path('', include('meeting2.urls')),
  path('',include('tasks.urls')),
  #path('',include('schedule.urls')),
  #path('',include('scheduler.urls')),
  path('',include('quickstart.urls')),
  path('',include('church.urls')),
  path('',include('group.urls')),
  path('',include('requestuser.urls')),
  path('',include('subscription.urls')),
  path('',include('payment.urls')),
  path('api-token-auth', views.obtain_auth_token),
  path('openapi-schema/', schema_view.with_ui('swagger', cache_timeout=0), name='openapi-schema'),
  path('swagger/', TemplateView.as_view(
       template_name='swagger-ui.html',
       extra_context={'schema_url': 'openapi-schema'}
  ), name='swagger-ui'),

]

# Serve media files during development
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)