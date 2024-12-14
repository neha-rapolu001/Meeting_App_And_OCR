from rest_framework import viewsets
# from rest_framework.pagination import PageNumberPagination
from .models import Task
from .serializers import TaskSerializer
from rest_framework.decorators import api_view
from rest_framework import status
from django.http import HttpResponse
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

from rest_framework.pagination import PageNumberPagination

# Custom pagination class to retrieve all results at once
class AllResultsPagination(PageNumberPagination):
    page_size = 100000  # Set a large number to retrieve all results at once

class TaskViewSet(viewsets.ModelViewSet):
    # Queryset that retrieves all Task objects
    queryset = Task.objects.all()
    # Serializer class used for Task model
    serializer_class = TaskSerializer
    # Uncomment the following lines to use the default PageNumberPagination
    # pagination_class = PageNumberPagination
    # PAGE_SIZE = 100  # or any other value you want
    # Use custom pagination class to retrieve all results at once
    pagination_class = AllResultsPagination  # Use custom pagination class

    def my_view(request):
        # Create an HttpResponse object
        response = HttpResponse()
        # Set Access-Control-Allow-Origin header to allow requests from http://localhost:3000
        response['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        #response['Access-Control-Allow-Origin'] = 'https://meeting-app-and-ocr-two.vercel.app'
        return response

class EditTasks:
    @api_view(['PUT', 'DELETE'])
    def edit_or_delete_task(request, pk):
        try:
            task = Task.objects.get(id=pk,deleted=False)
        except Task.DoesNotExist:
            return HttpResponse({'message': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'PUT':  # Handle PUT request for editing
            serializer = TaskSerializer(task, data=request.data, partial=True)
            print(request.data)
            if serializer.is_valid():
                serializer.save()
                print("safe serialization")
                send_notifications(task)
                return HttpResponse({'message': 'Task edited.'}, status=status.HTTP_200_OK)
            return HttpResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif request.method == 'DELETE':  # Handle DELETE request for deletion
            task.deleted=True
            task.save()  # Delete the task
            return HttpResponse({'message': 'Task deleted.'}, status=status.HTTP_204_NO_CONTENT)

def send_notifications(task):

    print(task)
    selected_employees = task.employees.all()
    print(selected_employees)

    # Prepare the email content
    subject = 'You have a new task: ' + task.task_name
    html_message = render_to_string('assign_task.html', {'task': task, 'employees': selected_employees})
    #message = "Email automation working"

    # Get a list of email addresses of attendees
    employee_emails = [employee.email for employee in selected_employees]
    print(employee_emails)

    task_details = f"""
    You are have a new task assigned by {task.created_by}

    Task Title: {task.task_name}

    Due Date: {task.end_date}

    Priority: {task.priority}

    Description: {task.task_description}

    Assigned to: {', '.join([employee.name for employee in selected_employees])}
    """

    # Send emails to the attendees
    try:
        print("might be working")
        
        send_mail(subject, task_details, settings.EMAIL_HOST_USER, employee_emails, fail_silently=False, html_message=html_message)
    except Exception as e:
        print("An error occurred:", e)