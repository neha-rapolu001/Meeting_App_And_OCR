import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { meeting_view, getCookie } from '../../../api';
import { CssBaseline } from '@mui/material';
import { Global, css } from '@emotion/react';
import MeetingInformationModal from '../../../components/modals/MeetingInformationModal'; // Import the modal

const DateAndTodoList = () => {
  const [meetings, setMeetings] = useState([]);
  const [allMeetings, setAllMeetings] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState(null); // State for selected meeting
  const [isMeetingInfoModalOpen, setIsMeetingInfoModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        viewAllMeeting();
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const viewAllMeeting = async () => {
    const response = await meeting_view().catch((error) => {
      console.log(error);
    });
    setAllMeetings(response.data);
    const privilege = getCookie("priv");
    if (privilege == 1) {
      let wantedMeetingData = response.data;
      setMeetings(wantedMeetingData);
    } else if (privilege == 2) {
      const church = getCookie("church");
      let wantedMeetingData = [];
      let tempMeetingsData = response.data;
      for (let i = 0; i < tempMeetingsData.length; i++) {
        if (tempMeetingsData[i].church + "" === church) {
          wantedMeetingData.push(tempMeetingsData[i]);
        }
      }
      setMeetings(wantedMeetingData);
    } else if (privilege == 3) {
      const church = getCookie("church");
      const id = getCookie("user-id");
      let wantedMeetingData = [];
      let tempMeetingsData = response.data;
      for (let i = 0; i < tempMeetingsData.length; i++) {
        if (tempMeetingsData[i].created_by + "" === id + "") {
          wantedMeetingData.push(tempMeetingsData[i]);
        }
      }
      setMeetings(wantedMeetingData);
    }

    setIsLoading(false);
  };

  const localizer = momentLocalizer(moment);

  // Map your meeting data to match the expected format for react-big-calendar
  const events = meetings.map((meeting) => ({
    title: meeting.name,
    start: new Date(`${meeting.date}T${meeting.time}`), // Combine date and time
    end: moment(`${meeting.date}T${meeting.time}`).add(meeting.duration, 'hours').toDate(), // Calculate end time
    type: meeting.type, // Include the type property
    id: meeting.id, // Assuming each meeting has a unique 'id'
    ...meeting, // Spread all other meeting properties for easy access
  }));

  // Handle event selection
  const handleEventClick = (event) => {
    console.log('Selected Meeting:', event);  // Log the selected meeting data
    setSelectedMeeting(event); // Directly set the event as the selected meeting
    toggleMeetingInfoModal();
  };

  const toggleMeetingInfoModal = () => {
    setIsMeetingInfoModalOpen(!isMeetingInfoModalOpen);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
      <CssBaseline /> {/* Ensures global styles are applied */}
      <Global
        styles={css`
          .rbc-calendar {
            background-color: #ffffff;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          .rbc-toolbar {
            background-color: #f5f5f5;
            color: #333;
            border-bottom: 1px solid #ddd;
            padding: 10px;
          }
          .rbc-toolbar button {
            background-color: #f5f5f5;
            color: #333;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 5px 10px;
            transition: background-color 0.3s;
          }
          .rbc-toolbar button:hover {
            background-color: #0288d1;
            color: #fff;
          }
          .rbc-month-view,
          .rbc-time-view {
            background-color: #ffffff;
            padding: 20px;
          }
          .rbc-event {
            background-color: #0288d1;
            color: #fff;
            border-radius: 4px;
            border: 1px solid #0288d1;
            padding: 5px;
            transition: background-color 0.3s;
          }
          .rbc-event:hover {
            background-color: #0277bd;
          }
          .rbc-day-bg {
            background-color: #ffffff;
            height: 100px; /* Increased height for day boxes */
            padding: 5px;
          }
          .rbc-day-content {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .rbc-time-header {
            background-color: #f5f5f5;
            border-bottom: 1px solid #ddd;
          }
          .rbc-selected {
            background-color: #0288d1 !important;
            color: #fff !important;
            border: 1px solid #0277bd !important;
          }
          .rbc-today {
            background-color: #e1f5fe;
          }
          .rbc-date-cell {
            color: #333;
          }
        `}
      />
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ minHeight:'545px', maxHeight: '600px', width: '100%', overflow: 'auto', flex: 1 }}> {/* Full width and height with scrolling */}
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={handleEventClick} // Trigger modal on event click
          />
        </div>
      )}

      {/* Pass the selected meeting to the modal */}
      <MeetingInformationModal
        isOpen={isMeetingInfoModalOpen}
        toggle={toggleMeetingInfoModal}
        meeting={selectedMeeting}
      />
    </div>
  );
};

export default DateAndTodoList;
