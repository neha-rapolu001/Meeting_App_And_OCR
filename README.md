# Fall 2024 CS682
## Meeting Web App V4
### By Beulah John Kommalapudi; Likhith Charugundla; Neha Rapolu

Features Added in V4:
1. Document AI Integration: Improved OCR accuracy by training Document AI for better performance.
2. Google Cloud Storage: Used Google Cloud Storage buckets to store meeting notes images.
3. Meeting Model Updates: Added additional fields to the Meeting model for enhanced functionality.
4. Email Notification System: Implemented an email notification system for meetings and tasks to keep users informed.
5. UI Improvement: Revamped the entire UI using the Mantine library, ensuring it is responsive across devices.
6. Cloud Storage Integration: Leveraged Google Cloud for cloud storage solutions, ensuring efficient management of meeting-related data.
7. Authentication Improvements: Enhanced user authentication mechanisms for better security and access control.
    
### V3 - Sruthi Damera, Praveendhra, Hindu Medisetti
### V2 - Lucas Gustafson; Aravind Haridas; Vivek Kamisetty
### V1 - Nishanth Bandarupalli; Aryan Kilaru; Rishank Singh

Django backend (see backend/docs.txt)
React frontend (see frontend/docs.txt)

To run (development):

1. Pull repo.
2. From frontend dir:
    ```
    npm install
    ```
3. Optional: create and activate venv in backend dir.
4. From backend dir:
    ```
    pip install -r requirements.txt
    ```
5. Run migrations and populate database with dummy data - instructions for doing so can be found in populate.sql.
6. From frontend dir:
    ```
    npm start
    ```
7. From backend dir:
    ```
    python manage.py runserver
    ```
8. To log in, use user rounakb@umb.edu with password 123456 (from populate.sql) or create account.

Note: 

For OCR, install gcloud, authenticate and replace keys in the backend.
For Stripe, create a new account and use the developer API keys provided
For Database, either use sqlite3 or gcloud, according to requirement