import traceback
from .models import Meeting
from rest_framework import generics, viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, parser_classes
from .serializers import MeetingSerializer
from django.core.mail import send_mail
from django.template.loader import render_to_string
#Imports for Doogle Doc AI
from google.cloud import documentai
from google.api_core.client_options import ClientOptions
from PIL import Image
import json
from dateutil import parser
from datetime import datetime
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from rest_framework.parsers import MultiPartParser, FormParser
from google.cloud import storage
import uuid
import os
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

def upload_to_bucket(file, file_name=None):
    try:
        print("Uploading file to bucket:", file.name)  # Debug log
        client = storage.Client()
        bucket = client.bucket('meeting-app-and-ocr.appspot.com')  # Replace with your bucket name
        blob = bucket.blob(file_name or file.name)

        # Use `upload_from_file` for file-like objects
        blob.upload_from_file(file, content_type=file.content_type)
        print("File successfully uploaded. URL:", blob.public_url)  # Debug log
        return blob.public_url  # Return the public URL of the file
    except Exception as e:
        print("Error uploading file:", e)  # Debug log
        raise serializers.ValidationError(f"File upload failed: {str(e)}")



@api_view(['GET', 'POST'])
def schedule(request):
    if request.method == 'GET':
        queryset = Meeting.objects.all()
        serialized_queryset = [MeetingSerializer(member).data for member in queryset if not member.deleted]
        #print(serialized_queryset)
        return Response(serialized_queryset, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        if 'notes_image' in request.FILES:
            try:
                file_url = upload_to_bucket(request.FILES['notes_image'])  # Upload the file
                request.data['notes_image'] = file_url  # Add the URL to the data for saving
            except ValidationError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        serializer = MeetingSerializer(data=request.data)
        print()
        print()
        print(request.data)
        print()
        print()
        if serializer.is_valid():
            meeting = serializer.save()
            send_notifications(meeting)
            #print(meeting)
            return Response({'message': 'Meeting created.'}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def edit_meeting(request, pk):
    try:
        meeting = Meeting.objects.get(id=pk)
    except Meeting.DoesNotExist:
        return Response({'error': 'Meeting not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Handle file uploads
    if 'notes_image' in request.FILES:
        try:
            file_url = upload_to_bucket(request.FILES['notes_image'])  # Upload the file
            request.data['notes_image'] = file_url  # Add the URL to the data for saving
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    serializer = MeetingSerializer(meeting, data=request.data, partial=True)


    print()
    print()
    print("Request Data:", request.data)
    print("Request Files:")
    for field_name, file_obj in request.FILES.items():
        print(f"Field Name: {field_name}, File: {file_obj}, File Name: {file_obj.name}, Content Type: {file_obj.content_type}, Size: {file_obj.size}")
    print()
    print()

    if serializer.is_valid():
        serializer.save()
        #print(meeting)
        send_notifications(meeting)
        return Response({'message': 'Meeting edited successfully.'}, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@csrf_exempt
def upload_image(request):
    if 'image' not in request.FILES:
        return Response({'error': 'No image file provided'}, status=400)

    image = request.FILES['image']
    try:
        # Upload the image to the bucket
        image_url = upload_to_bucket(image)
        return Response({'url': image_url}, status=200)
    except serializers.ValidationError as e:
        return Response({'error': str(e)}, status=500)
    except Exception as e:
        return Response({'error': 'Unexpected error occurred: ' + str(e)}, status=500)


@api_view(['POST'])
def ocr(request):
    # Currently just returning text
    data_dict = request.data['image_binary']
    int_list = []
    for i in range(len(data_dict)):
        int_list.append(int(data_dict[str(i)]))
    # gv_api_response = _handwriting_to_text(bytes(int_list))
    
    #response_dict = _handwriting_to_text(bytes(int_list))
    response_dict = _retrieve_data_document_ai(bytes(int_list))
    print(response_dict)

    # return Response({'text': gv_api_response.full_text_annotation.text}, status=status.HTTP_200_OK)
    return Response(response_dict, status=status.HTTP_200_OK)

def _retrieve_data_document_ai(image_data):
    try: 
        PROJECT_ID = "721441340271"          #
        LOCATION = "us"                    # These are configurations for specific to Google Doc AI API
        PROCESSOR_ID = "c3f655fbfcc8bb26"   #
        MIME_TYPE= "image/jpeg"            
        docai_client = documentai.DocumentProcessorServiceClient(client_options=ClientOptions(api_endpoint=f"{LOCATION}-documentai.googleapis.com"))
        RESOURCE_NAME = docai_client.processor_path(PROJECT_ID, LOCATION, PROCESSOR_ID)   
        raw_document = documentai.RawDocument(content=image_data, mime_type=MIME_TYPE)
        request = documentai.ProcessRequest(name=RESOURCE_NAME, raw_document=raw_document)
        result = docai_client.process_document(request=request)
        document_object = result.document
        name_date = ""
        agenda = ""
        people = ""
        questions = ""
        objective = ""
        notes = ""
        action_steps = ""
        date =""
        for obj in document_object.entities:
            match obj.type_:
                case "notes": notes = obj.mention_text  
                case "Action_Steps": action_steps = obj.mention_text
                case "People_Invited": people = obj.mention_text
                case "Date": date = obj.mention_text
                case "Agenda": agenda =obj.mention_text
                case "Questions": questions = obj.mention_text
                case "Objective": objective = obj.mention_text
                case "Date_name": name_date = obj.mention_text

        for obj in document_object.entities:
            print(f"Type: {obj.type_}, Mention: {obj.mention_text}") #Here it is printing correct output


        date_string=parse_date(name_date)
        response_dict = {
            'name_date': name_date,
            'agenda': agenda,
            'people': people,
            'questions': questions,
            'objective': objective,
            'notes': notes,
            'action_steps': action_steps,
            'date':date_string
        }
        meeting_type=extract_MeetingType(response_dict)
        response_dict['meeting_type'] = meeting_type

        print('\n\n\n')
        print(f"Meeting Date: {response_dict.get('date')}")
        print("Agenda:")
        print(response_dict.get('agenda', 'No agenda available').replace('\n', '\n- '))

        print("\nPeople Invited:")
        for person in response_dict.get('people', '').split('\n'):
            print(f"- {person}")

        print("\nObjective:")
        print(response_dict.get('objective', 'No objective set'))

        print("\nQuestions:")
        for question in response_dict.get('questions', '').split('\n'):
            print(f"- {question}")

        print("\nNotes:")
        for note in response_dict.get('notes', '').split('\n'):
            print(f"- {note}")

        print("\nAction Steps:")
        for action_step in response_dict.get('action_steps', '').split('\n'):
            print(f"- {action_step}")

        print(action_steps)

        print('\n\n\n')
        
        #print('Direct data from ocr\n', response_dict)#But here it is messing it up

        return response_dict
    
    except:
        traceback.print_exc()

def extract_MeetingType(response_dict):
    Meeting_types=[
    "1 on 1",
    "Delegation",
    "Leadership Pipeline",
    "Personal Growth",
    "Debrief",
    "Goal Setting",
    "Leadership Workshop",
    "Problem Solving"]
    data_text = ' '.join(response_dict.values())
    tfidf_vectorizer = TfidfVectorizer()
    data_tfidf = tfidf_vectorizer.fit_transform([data_text])
    content_types_tfidf = tfidf_vectorizer.transform(Meeting_types)
    similarity_scores = cosine_similarity(data_tfidf, content_types_tfidf)
    closest_content_type_index = similarity_scores.argmax()
    return closest_content_type_index

    
    
def _handwriting_to_text(image_data):
    """
    Pulled/adapted from Google Vision docs.
    Detect handwriting in image and return
    OCR details, including text transcription.
    """
    try:
        # This import is in function scope moreso for development/human reasons than
        # for production/execution reasons. While some interesting discussion is
        # available on the pros/cons of function scope imports, the author's chief
        # concerns are 1) avoiding annoying errors if other developers choose not to
        # install this package, and 2) making it virtually impossible to forget to
        # remove the import if a future developer changes the OCR API.
        from google.cloud import vision
        from google.cloud.vision_v1.types.image_annotator import EntityAnnotation

        client = vision.ImageAnnotatorClient()

        image = vision.Image(content=image_data)

        response = client.document_text_detection(image=image)
        ta = response.text_annotations
        # Write full OCR response text to terminal.
        print(response.full_text_annotation.text)

        bounding_vertices = EntityAnnotation.to_dict(ta[0])['bounding_poly']['vertices']

        # Vertices in list ordered clockwise from upper left - assume rectangular bounds.
        v0 = bounding_vertices[0]
        v1 = bounding_vertices[1]
        # v2 = bounding_vertices[2]
        # v3 = bounding_vertices[3]

        # Second column begins just right of center.
        x_col_divider = (v0['x'] + v1['x']) * 9 // 20

        # Left column of meeting book page
        name_date_y_start = None
        agenda_y_start = None
        people_y_start = None
        questions_y_start = None

        # Right column of meeting book page
        objective_y_start = None
        notes_y_start = None
        action_steps_y_start = None

        # Use words on meeting book page as markers.
        for i in range(1, len(ta)):
            word_dict = EntityAnnotation.to_dict(ta[i])
            description = word_dict['description']
            y = word_dict['bounding_poly']['vertices'][0]['y']
            if name_date_y_start == None and 'Name' in description:
                name_date_y_start = y
            elif agenda_y_start == None and 'Agenda' in description:
                agenda_y_start = y
            elif people_y_start == None and 'People' in description:
                people_y_start = y
            elif questions_y_start == None and 'Questions' in description:
                questions_y_start = y
            elif objective_y_start == None and 'Objective' in description:
                objective_y_start = y
            elif notes_y_start == None and 'Notes' in description:
                notes_y_start = y
            elif action_steps_y_start == None and 'Action' in description:
                action_steps_y_start = y

        name_date = ''
        agenda = ''
        people = ''
        questions = ''
        objective = ''
        notes = ''
        action_steps = ''

        for i in range(1, len(ta)):
            word_dict = EntityAnnotation.to_dict(ta[i])
            description = word_dict['description']
            x = word_dict['bounding_poly']['vertices'][0]['x']
            y = word_dict['bounding_poly']['vertices'][0]['y']

            # Eliminate additional printed text.
            invited = 'Invited' in description
            productive = 'Productive' in description
            pastor = 'Pastor' in description
            steps = 'Steps' in description
            date = 'Date' in description and x > x_col_divider
            if invited or productive or pastor or steps or date:
                continue

            if y < agenda_y_start and y > name_date_y_start and x < x_col_divider:
                name_date += description + ' '
            elif y < people_y_start and y > agenda_y_start and x < x_col_divider:
                agenda += description + ' '
            elif y < questions_y_start and y > people_y_start and x < x_col_divider:
                people += description + ' '
            elif y > questions_y_start and x < x_col_divider:
                questions += description + ' '
            elif y < notes_y_start and y > objective_y_start and x >= x_col_divider:
                objective += description + ' '
            elif y < action_steps_y_start and y > notes_y_start and x >= x_col_divider:
                notes += description + ' '
            elif y > action_steps_y_start and x >= x_col_divider:
                action_steps += description + ' '

        # Strip out troublesome final character.
        name_date = name_date[:-1]
        agenda = agenda[:-1]
        people = people[:-1]
        questions = questions[:-1]
        objective = objective[:-1]
        notes = notes[:-1]
        action_steps = action_steps[:-1]

        # Write to terminal for debugging.
        print(name_date)
        print(agenda)
        print(people)
        print(questions)
        print(objective)
        print(notes)
        print(action_steps)

        if response.error.message:
            raise Exception(
                "{}\nFor more info on error messages, check: "
                "https://cloud.google.com/apis/design/errors".format(response.error.message)
            )


        date_string=parse_date(name_date)
        response_dict = {
            'name_date': name_date,
            'agenda': agenda,
            'people': people,
            'questions': questions,
            'objective': objective,
            'notes': notes,
            'action_steps': action_steps,
            'date': date_string
        }

        return response_dict
    except:
        traceback.print_exc()
    finally:
        return "na"



def parse_date(date_str):
    try:
        # Attempt to parse the date string
        parsed_date = parser.parse(date_str, fuzzy=True)
        return parsed_date.strftime('%Y-%m-%d')
    except ValueError:
        # If parsing fails, try adding the next possible year
        try:
            # Add the current year to the date string and parse again
            current_year = datetime.now().year
            date_with_current_year = date_str + f', {current_year}'
            parsed_date = parser.parse(date_with_current_year, fuzzy=True)
            return parsed_date.strftime('%Y-%m-%d')
        except ValueError:
            # If parsing still fails, return None indicating failure
            return None
"""
Send notifications to emails of people
invited to meeting.
"""
def send_notifications(meeting):

    selected_attendees = meeting.attendees.all()
    print(selected_attendees)

    subject = 'Meeting Invitation: ' + meeting.name

    # Get a list of email addresses of attendees
    attendee_emails = [attendee.email for attendee in selected_attendees]
    print(attendee_emails)

    meeting_details = f"""
    You are invited to a meeting by {meeting.created_by}

    Meeting Name: {meeting.name}

    Date: {meeting.date}

    Time: {meeting.time}

    Agenda: {meeting.agenda}

    Objective: {meeting.objective}

    Notes: {meeting.notes}

    Attendees: {', '.join([attendee.name for attendee in selected_attendees])}
    """

    html_message = render_to_string('meeting_invitation.html', {'meeting': meeting, 'attendees': selected_attendees})

    try:
        print("might be working")
        
        send_mail(subject, meeting_details, settings.EMAIL_HOST_USER, attendee_emails, fail_silently=False, html_message=html_message)
    except Exception as e:
        print("An error occurred:", e)
