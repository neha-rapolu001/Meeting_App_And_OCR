import React, { useEffect, useState } from "react";
import {Row, Col} from "reactstrap";
import { Container, Title, Card, Table, Grid } from "@mantine/core";
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';
import AppSidebar from "../../components/appSidebar";
import TopBar from "../../components/appTopBar";
import { tasks_view, getCookie, get_church_data } from "../../api";
import InformationModal from "../../components/modals/InformationModal";
import { useMediaQuery } from '@mantine/hooks';

const TaskCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mustGetTasks, setMustGetTasks] = useState(true);
  const [churchData, setChurchData] = useState([]);
  const [taskId, setTaskId] = useState();
  const [isInformationModalOpen, setIsInformationModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  const backgroundColor = selectedDate ? "#b0bce8" : "#b0bce8"; // Blue for non-selected days
  const priorityColors = {
    high: 'red',
    medium: 'orange',
    low: 'green'
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    if (isSmallScreen) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isSmallScreen]);

  useEffect(() => {
    get_church_data()
      .then((req) => {
        const Data = req.data;
        let tempData = [];
        Data.forEach(x => {
          tempData.push({
            "id": x.id,
            "name": x.name
          });
        });
        setChurchData(tempData);
      })
      .catch((error) => console.log(error));
    viewAllTasks();
  }, [mustGetTasks]);

  const viewAllTasks = async () => {
    const response = await tasks_view().catch((error) => console.log(error));
    setIsLoading(false);
    const privilege = getCookie("priv");
    const church = getCookie("church");
    const id = getCookie("user-id");
    const tempTasks = response?.data?.results || [];

    let filteredTasks = [];
    if (privilege === "1") {
      filteredTasks = tempTasks;
    } else if (privilege === "2") {
      filteredTasks = tempTasks.filter(task => task.church + "" === church);
    } else if (privilege === "3") {
      filteredTasks = tempTasks.filter(task => task.created_by + "" === id + "");
    }
    setTasks(filteredTasks);
  };

  const tileContent = ({ date }) => {
    const tasksForDate = getTasksForDate(date, tasks);
    const isSelectedDate = date.toDateString() === selectedDate.toDateString();
  
    if (tasksForDate.length > 0) {
      return (
        <div style={{
          borderRadius: "5px",
          padding: "5px",
        }}>
          {tasksForDate.map((task, index) => {
            // Set background color based on task priority
            const taskColor = priorityColors[task.priority] || 'gray'; // Default to gray if no priority
            return (
              <div key={index} style={{
                backgroundColor: taskColor, // Background color based on task priority
                color: "white",  // White text for contrast
                borderRadius: "3px",
                margin: "2px 0", // Space between tasks
                padding: "3px 5px",
              }}>
                {task.task_name}
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const getTasksForDate = (date, tasks) => {
    return tasks.filter((task) => date.toISOString().split('T')[0] === task.end_date);
  };

  const selectedTasks = getTasksForDate(selectedDate, tasks);

  const getChurchName = (churchId) => {
    const church = churchData.find(church => church.id === churchId);
    return church ? church.name : "Unknown";
  };

  const toggleInformationModal = () => {
    setIsInformationModalOpen(!isInformationModalOpen);
  };

  const onTaskClick = (task) => {
    setTaskId(task.id);
    setSelectedTask(task);
    console.log("Selectec task:", selectedTask);
    toggleInformationModal();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: isSmallScreen ? 'auto' : 'hidden' }}>
      {/* TopBar */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
        <TopBar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>
        <div style={{ display: 'flex', flex: 1 }}>
          {/* Sidebar */}
          {isSidebarOpen && (
            <div
              style={{
                width: '0',
                backgroundColor: '#f4f4f4',
                height: '100vh',
                position: 'fixed', // Fixed for small screens, relative for large screens
                top: 0,
                left: 0,
                zIndex: 999, // Higher z-index for small screens
                transition: 'transform 0.3s ease', // Smooth open/close
              }}
            >
              <AppSidebar />
            </div>
          )}
        <div style={{ position: "relative", left: isSmallScreen ? "5%" : "15%", width: isSmallScreen ? "auto" : "100%", height: isSmallScreen ? "auto" : "94vh", overflowY:isSmallScreen ? 'auto' : 'hidden' }} className="my-3">
        <InformationModal
          id={taskId}
          edit_task="null"
          task={selectedTask || {}}
          isOpen={isInformationModalOpen}
          toggle={toggleInformationModal}
        />
         
          <Card className="my-card my-card-height schedule-card" style={{ width: isSmallScreen ?  "auto" : "80%"}}>
          <Title ml={isSmallScreen? 40 : 60} mb={30} mt = {60} order={1}>Task Calendar</Title>
            <div className={isSmallScreen ? "none" : "calendar-wrapper"}>
              <Calendar
                value={selectedDate}
                className="custom-calendar"
                onClickDay={handleDateClick}
                tileContent={tileContent}
              />
              {selectedDate && (
                <div >
                  <hr style={{ border: 'none', borderTop: '1px solid #ccc', margin: '20px 0', width: isSmallScreen ? "80%" : "100%" }} />
                  <div style={{ backgroundColor: "#b0bce8", padding: '20px', borderRadius: '8px', width: isSmallScreen ? "80%" : "100%"}}>
                    <Title order={4} color="white">
                      Tasks for {selectedDate.toISOString().split('T')[0]}
                    </Title>
                    <Table highlightOnHover style={{ marginTop: '10px'}}>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Task Name</Table.Th>
                          <Table.Th>Employee Name</Table.Th>
                          {getCookie("priv") && <Table.Th>Church</Table.Th>}
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {selectedTasks.map((task, index) => (
                          <Table.Tr key={index} onClick={() => onTaskClick(task)}>
                            <Table.Td>{task.task_name}</Table.Td>
                            <Table.Td>{task.employee_name}</Table.Td>
                            {getCookie("priv") && <Table.Td>{getChurchName(task.church)}</Table.Td>}
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </div>
                </div>
              )}
              </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskCalendar;
