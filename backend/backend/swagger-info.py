from drf_yasg import openapi

swagger_info = openapi.Info(
    title="Your API Title",
    default_version="v1",
    description="Your API description",
    terms_of_service="https://your-terms-of-service-url.com",
    contact=openapi.Contact(email="your-email@example.com"),
    license=openapi.License(name="Your License"),
)
