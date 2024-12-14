import React, { useEffect, useState } from "react";

import { Container, Title, Card, Button, NavLink, Text } from "@mantine/core";
import ReactDOM from 'react-dom';
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';
import AppSidebar from "../../components/appSidebar";
import { tasks_view, getCookie, get_church_data} from "../../api";


const TaskCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mustGetTasks, setMustGetTasks] = useState(true);
  const [churchData, setChurchData] = useState([]);

  useEffect(() => {
    get_church_data()
      .then((req) => {
        const Data = req.data;
        let tempData = [];
        Data.forEach(x => {
          tempData.push({
            "id": x.id,
            "name": x.name
          })
        });
        setChurchData(tempData);
      })
      .catch((error) => {
        console.log(error);
      });
    viewAllTasks();
  }, [mustGetTasks]);

  const viewAllTasks = async () => {
    const response = await tasks_view().catch((error) => {
      console.log(error)
    });
    console.log(response.data.results);
    setIsLoading(false);
    const privilege = getCookie("priv");
    if (privilege == 1) {
      setTasks(response.data.results)
    } else if (privilege == 2) {
      const church = getCookie("church");
      let wantedTaskData = [];
      let tempTasksData = response.data.results;
      for (let i = 0; i < tempTasksData.length; i++) {
        if (tempTasksData[i].church + "" === church) {
          wantedTaskData.push(tempTasksData[i]);
        }
      }
      setTasks(wantedTaskData)
    } else if (privilege == 3) {
      const church = getCookie("church");
      const id = getCookie("user-id");
      let wantedTaskData = [];
      let tempTasksData = response.data.results;
      for (let i = 0; i < tempTasksData.length; i++) {
        if (tempTasksData[i].created_by + "" === id + "") {
          wantedTaskData.push(tempTasksData[i]);
        }
      }
      setTasks(wantedTaskData)
    }
  }

  const tileContent = ({ date, view }) => {
    const tasksForDate = getTasksForDate(date, tasks);
    const isSelectedDate = date.toDateString() === selectedDate.toDateString();
    if (tasksForDate.length > 0) {
      return (
        <div style={{
          width: '80%',
          height: '80%',
          padding: '10px',
          position: 'relative',
        }}>
          {tasksForDate.map((task, index) => (
            <div key={index}>
              <span style={{
                backgroundColor: '#FFD700', // Yellowish background color
                borderRadius: '5px',
                padding: '5px',
              }}>
                {task.task_name}
              </span>
            </div>
          ))}
        </div>
      );
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const getTasksForDate = (date, tasks) => {
    return tasks.filter((task) => {
      return date.toISOString().split('T')[0] === task.end_date;
    });
  };

  const selectedTasks = getTasksForDate(selectedDate, tasks);

  const getChurchName = (churchId) => {
    for (const church of churchData) {
      if (church.id === churchId) {
        return church.name;
      }
    }
    return "Unknown";
  }

  return (
    <div style={{ display: "flex" }}>
      <AppSidebar />
      <div style={{position: "relative", left: "15%",width:"100%",height:"94vh"}} className="my-3">
      <Card className="my-card  my-card-height schedule-card" style={{width:"80%"}}>
          <div className="full-screen-calendar">
            <h1 style={{ textAlign: 'left', paddingLeft: '380px' }}>Task Calendar</h1>
            <div className="calendar-wrapper">
              <Calendar
                value={selectedDate}
                className="custom-calendar"
                onClickDay={handleDateClick}
                tileContent={tileContent}
              />
              {selectedDate && (
                <div>
                  <hr style={{ border: 'none', borderTop: '1px solid #ccc', margin: '20px 0' }}></hr>
                  <div style={{ backgroundColor: '#FFD700', padding: '20px', borderRadius: '8px' }}> {/* Yellowish background */}
                    <h4> Tasks for {selectedDate.toISOString().split('T')[0]}</h4>
                    <table style={{ borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid black' }}>
                          <th style={{ borderBottom: '1px solid black', padding: '8px' }}>Task Name</th>
                          <th style={{ borderBottom: '1px solid black', padding: '8px' }}>Employee Name</th>
                          {getCookie("priv") && <th style={{ borderBottom: '1px solid black', padding: '8px' }}>Church</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTasks.map((task, index) => (
                          <tr key={index}>
                            <td style={{ padding: '8px' }}>{task.task_name}</td>
                            <td style={{ padding: '8px' }}>{task.employee_name}</td>
                            {getCookie("priv") && <td style={{ padding: '8px' }}>{getChurchName(task.church)}</td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TaskCalendar;