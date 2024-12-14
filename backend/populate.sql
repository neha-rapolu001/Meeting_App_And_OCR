/*
    SQL script for populating db with dummy data.

    If you have no database binary (the db.sqlite3 file), create it by running migrations:

        python manage.py migrate

    This new binary will not contain the dummy data useful for playing around with the GUI,
    so to repopulate the meeting_meeting and tasks_task tables, as well as restore the
    rounakb@umb.edu/123456 login that we are used to using (though the signup function is
    working), run this SQL script as follows:

    1) Open db.sqlite3 in SQLite:

        sqlite3 db.sqlite3

       This will open a SQLite CLI.

    2) In SQLite CLI:

        .read populate.sql

    3) Exit SQLite (if you wish) with Ctrl-D or:

        .quit

    Instead of the 3 steps outlined above, you may prefer the following single command, which
    will populate the database without opening a SQLite CLI:

        cat populate.sql | sqlite3 db.sqlite3

    Regardless of which method you choose, some assumptions being made are:

    1) You are running macOS or Linux.

    2) Your working directory contains both db.sqlite3 and populate.sql (though you can of
       course adjust file paths where necessary if this is not the case).

    3) The name of the database binary is db.sqlite3.
*/

/*
INSERT INTO church_church
    (name, deleted, date_created)
VALUES
    ("alpha", 0, CURRENT_TIMESTAMP),
    ("beta", 0, CURRENT_TIMESTAMP),
    ("gama", 0, CURRENT_TIMESTAMP);
*/

INSERT INTO quickstart_user
    (id, password, email, first_name, last_name, is_active, user_type, church_id, deleted)
VALUES
    (1, "pbkdf2_sha256$600000$cvhsT13lWVScnb3irC2gPm$JsD4yXI/kcaFbAkJk/XdJHjtbbOP67pN2S1XuFPPs4M=", "rounakb@umb.edu", "Rounak", "Burman", 1, 1,null, 0);
 /*

INSERT INTO meeting_meeting
    (id, name, type, date, time, agenda, notes, deleted,created_by_id,church_id)
VALUES
    (1, "Project Review Meeting", "1 on 1", "2023-05-10", "15:00:00", "This meeting has no agenda", "Discussed progress on project deliverables", 0,1,1),
    (2, "Company Retreat", "Debrief", "2022-05-25", "08:00:00", "This meeting has no agenda", "Team building activities", 0,1,1),
    (3, "Product Launch Meeting", "Problem Solving", "2022-05-20", "16:00:00", "This meeting has no agenda", "Discuss product launch strategy", 0,1,1),
    (4, "Training Session", "Leadership Workshop", "2022-05-17", "09:00:00", "This meeting has no agenda", "Introduce company policies and procedures", 0,1,1);

*/
/*
INSERT INTO person_person
    (name, email, deleted)
VALUES
    ("Taylor ", "sruthidamera23@gmail.com", 0),
    ("Riccardo Brandon", "sruthidamera123@gmail.com", 0),
    ("Moses", "sruthidamera223@gmail.com", 0),
    ("KeN Burt", "sruthidamera323@gmail.com", 0);
*/
/*

INSERT INTO tasks_task
    (task_name, employee_name, start_date, end_date, is_completed, deleted, priority, task_description, meeting_id_id,created_by_id,church_id)
VALUES
    ("Task 1", "John Doe", "2023-04-05", "2023-04-15", 1, 0, "high", "This is task 1.", 1,1,1),
    ("Task 2", "Rishank Singh", "2023-04-03", "2023-04-22", 1, 0, "medium", "task 2 is the new task to complete task description.", 1,1,1),
    ("Task 3", "Sankalp Vaish", "2023-04-03", "2023-04-20", 0, 0, "Low", "Not available", 1,1,1),
    ("Task 4", "Rounak Burman", "2023-04-22", "2023-04-25", 0, 0, "high", "Not available", 1,1,1);

*/