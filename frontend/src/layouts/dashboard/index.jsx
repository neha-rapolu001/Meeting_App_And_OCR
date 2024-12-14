import React, { useEffect, useState } from "react";
import { Card, Text, Title, Divider, Group, Grid, Table, Avatar, Badge, ScrollArea, Anchor  } from "@mantine/core";
import { useMediaQuery } from '@mantine/hooks';
import { useNavigate } from "react-router-dom";
import { tasks_view } from "../../api"; // Make sure your task API is correct
import AppSidebar from "../../components/appSidebar"; // Make sure AppSidebar is imported
import CssLoader from './components/CssLoader'; // Make sure you have a custom loader
import { getCookie } from "../../api"; // Make sure the getCookie function works
import { MdChecklist, MdEvent, MdPriorityHigh } from 'react-icons/md';
import TasksDueSoonTable from "../taskAssignment/components/TaskTable";
import DateAndTodoList from './components/DateAndTodoList';
import TopBar from "../../components/appTopBar";

const Dashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [activeTasks, setActiveTasks] = useState(0);
  const [AllTasks, setAllTasks] = useState("");
  const [weekTasks, setWeekTasks] = useState(0);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [highPriorityTasks, setHighPriorityTasks] = useState(0);
  const [dueSoonTasks, setDueSoonTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userFirstName, setUserFirstName] = useState("");
  const [mustGetTasks, setMustGetTasks] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    if (getCookie("user") == null && getCookie("priv") == null) {
      navigate('/');
    }

    const privUser = getCookie("priv");
    setUserFirstName(getCookie("first_name"));

    const timeout = setTimeout(() => {
      fetchTasks();

    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (mustGetTasks) {
      setUserFirstName(getCookie("first_name"));
      fetchTasks();
      setMustGetTasks(false);
    }
  }, [mustGetTasks]);  // Effect depends on mustGetTasks
  

  const fetchTasks = async () => {
    try {
      const response = await tasks_view();
      const allTasks = response.data.results;
  
      console.log("API Response:", allTasks);
  
      const privilege = getCookie("priv");
      const church = getCookie("church");
      const userId = getCookie("user-id");
      const today = new Date();
  
      console.log("Privilege:", privilege, "Church:", church, "User ID:", userId);
  
      let filteredTasks = [];
  
      // Filter tasks based on privilege
      if (privilege == 1) {
        filteredTasks = allTasks;
      } else if (privilege == 2) {
        filteredTasks = allTasks.filter(task => task.church.toString() === church);
      } else if (privilege == 3) {
        filteredTasks = allTasks.filter(task => task.created_by.toString() === userId);
      }
  
      console.log("Filtered Tasks:", filteredTasks);
  
      // Check if tasks have required properties
      if (filteredTasks.length > 0) {
        console.log("Sample Task:", filteredTasks[0]);
      }
  
      // Calculate metrics
      const activeTasksCount = filteredTasks.filter(task => !task.is_completed).length;
  
      const weekTasksCount = filteredTasks.filter(task => {
        const taskDate = new Date(task.end_date);
        const dateDiff = (taskDate - today) / (1000 * 3600 * 24);
        return dateDiff >= 0 && dateDiff <= 7;
      }).length;
  
      const highPriorityTasksCount = filteredTasks.filter(task => task.priority === "high").length;
  
      const dueSoonTasks = filteredTasks.filter(task => {
        const taskDate = new Date(task.end_date);
        const dateDiff = (taskDate - today) / (1000 * 3600 * 24);
        return dateDiff >= 0 && dateDiff <= 3;
      });
  
      // Set state
      setTasks(filteredTasks);
      setActiveTasks(activeTasksCount);
      setWeekTasks(weekTasksCount);
      setHighPriorityTasks(highPriorityTasksCount);
      setDueSoonTasks(dueSoonTasks);

      setMustGetTasks(false);
  
      setIsLoading(false);
  
      console.log("Active Tasks:", activeTasksCount);
      console.log("Tasks Due This Week:", weekTasksCount);
      console.log("High Priority Tasks:", highPriorityTasksCount);
      console.log("Tasks Due Soon:", dueSoonTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setIsLoading(false);
    }
  };
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    if (isSmallScreen) {
      setIsSidebarOpen(false); // Close sidebar on small screens
    } else {
      setIsSidebarOpen(true); // Open sidebar on large screens
    }
  }, [isSmallScreen]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'auto' }}>
      {/* TopBar */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
        <TopBar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      {isLoading ? (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '80px' }}>
          <CssLoader />
        </div>
      ) : (
        <div style={{ display: 'flex', flex: 1 }}>
          {/* Sidebar */}
          {isSidebarOpen && (
            <div
              style={{
                width: '150px',
                backgroundColor: '#f4f4f4',
                height: '100vh',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 999, // Higher z-index for small screens
                transition: 'transform 0.3s ease', // Smooth open/close
              }}
            >
              <AppSidebar />
            </div>
          )}

      {/* Main Content */}
      <div style={{ flex: 1, padding: "2rem", marginTop:'45px', marginLeft: isSidebarOpen ? "150px" : "0px", }}>
        <Grid gutter="md" style={{ padding: 0 }}>
          {/* Active Tasks Card */}
          <Grid.Col span={{ xs: '12', sm: '4', md: '4', lg: '4' }}>
            <Card shadow="lg" style={{ backgroundColor: "#6776ab", padding: "20px", borderRadius: "8px", minHeight: "200px" }}>
              <Group position="center" style={{ marginBottom: "1rem", flexDirection: "column", alignItems: "center" }}>
                <MdChecklist size={60} color="#e6e6e8" style={{ marginBottom: "10px" }} />
                <Title order={4} style={{ color: "#e6e6e8", textAlign: "center" }}>Active Tasks</Title>
              </Group>
              <Text size="xl" color="#e6e6e8" weight={700} align="center">
                {activeTasks}
              </Text>
            </Card>
          </Grid.Col>

          {/* Tasks Due This Week Card */}
          <Grid.Col span={{ xs: '12', sm: '4', md: '4', lg: '4' }}>
            <Card shadow="lg" style={{ backgroundColor: "#6776ab", padding: "20px", borderRadius: "8px", minHeight: "200px" }}>
              <Group position="center" style={{ marginBottom: "1rem", flexDirection: "column", alignItems: "center" }}>
                <MdEvent size={60} color="#e6e6e8" style={{ marginBottom: "10px" }} />
                <Title order={4} style={{ color: "#e6e6e8", textAlign: "center" }}>Tasks Due This Week</Title>
              </Group>
              <Text size="xl" color="#e6e6e8" weight={700} align="center">
                {weekTasks}
              </Text>
            </Card>
          </Grid.Col>

          {/* High Priority Tasks Card */}
          <Grid.Col span={{ xs: '12', sm: '4', md: '4', lg: '4' }}>
            <Card shadow="lg" style={{ backgroundColor: "#6776ab", padding: "20px", borderRadius: "8px", minHeight: "200px" }}>
              <Group position="center" style={{ marginBottom: "1rem", flexDirection: "column", alignItems: "center" }}>
                <MdPriorityHigh size={60} color="#e6e6e8" style={{ marginBottom: "10px" }} />
                <Title order={4} style={{ color: "#e6e6e8", textAlign: "center" }}>High Priority Tasks</Title>
              </Group>
              <Text size="xl" color="#e6e6e8" weight={700} align="center">
                {highPriorityTasks}
              </Text>
            </Card>
          </Grid.Col>

          {/* Tasks Due Soon Table */}
          <Grid.Col span={{ xs: '12', sm: '12', md: '5', lg: '4' }}>
            <Card shadow="lg" style={{ padding: "20px", borderRadius: "8px", minHeight: "650px", backgroundColor: "#f2f4fa" }}>
              <TasksDueSoonTable mustGetTasks={mustGetTasks} setMustGetTasks={setMustGetTasks} />
            </Card>
          </Grid.Col>

          {/* Calendar Section */}
          <Grid.Col span={{ xs: '12', sm: '12', md: '7', lg: '8' }}>
            <Card shadow="lg" style={{ padding: "20px", borderRadius: "8px", minHeight: "650px", backgroundColor: "#f2f4fa" }}>
              <Title order={4} style={{ marginLeft: "20px", marginBottom: "0", color: "#4A4A4A" }}>
                Calendar
              </Title>
              <DateAndTodoList />
            </Card>
          </Grid.Col>
        </Grid>
      </div>
    </div>
  )}
</div>

  );
}

export default Dashboard;