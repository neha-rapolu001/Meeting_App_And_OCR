import React, { useEffect, useState } from "react";
import { Row, Col } from "reactstrap";
import { Grid, Flex, Card, Title, Button, Text, Select, Loader, TextInput, CloseButton } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import { isSuperUser, getCookie, tasks_view, get_church_data } from "../../api";
import AppSidebar from "../../components/appSidebar";
import TaskCard from "./components/TaskCard";
import CreateTaskModal from "../../components/modals/CreateTaskModal";
import TopBar from "../../components/appTopBar";

const Task = () => {
  const navigate = useNavigate();
  const [allTasks, setAllTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [displayedTasks, setDisplayedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [mustGetTasks, setMustGetTasks] = useState(true);
  const [churchDropdownOptions, setChurchDropdownOptions] = useState([]);
  const [selectedChurchDropdownOption, setSelectedChurchDropdownOption] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar toggle state
  const isSmallScreen = useMediaQuery("(max-width: 768px)");

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  useEffect(() => {
    if (isSmallScreen) {
      setIsSidebarOpen(false); // Close sidebar on small screens
    } else {
      setIsSidebarOpen(true); // Open sidebar on large screens
    }
  }, [isSmallScreen]);

  const toggleCreateTaskModal = () => {
    setIsCreateTaskModalOpen((prev) => !prev);
    setMustGetTasks(true);
  };

  useEffect(() => {
    if (mustGetTasks) fetchTasks();
    fetchChurchDropdownData();
  }, [mustGetTasks]);

  useEffect(() => {
    let filteredTasks = tasks;

    if (getCookie("priv") === "1" && selectedChurchDropdownOption) {
      filteredTasks = filteredTasks.filter(
        (task) => task.church.toString() === selectedChurchDropdownOption
      );
    }

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filteredTasks = filteredTasks.filter(
        (task) =>
          task.task_name.toLowerCase().includes(lowercasedQuery) ||
          task.task_description.toLowerCase().includes(lowercasedQuery) ||
          task.priority.toLowerCase().includes(lowercasedQuery) ||
          task.employees.some((employee) =>
            employee.name?.toLowerCase().includes(lowercasedQuery)
          )
      );
    }

    setDisplayedTasks(filteredTasks);
  }, [tasks, searchQuery, selectedChurchDropdownOption]);

  const fetchTasks = async () => {
    try {
      const response = await tasks_view();
      const allTasks = response?.data.results || [];
      setAllTasks(allTasks);

      const privilege = getCookie("priv");
      let filteredTasks = allTasks;

      if (privilege === "1" && selectedChurchDropdownOption) {
        filteredTasks = allTasks.filter(
          (task) => task.church.toString() === selectedChurchDropdownOption
        );
      } else if (privilege === "2") {
        const churchId = getCookie("church");
        filteredTasks = allTasks.filter(
          (task) => task.church.toString() === churchId
        );
      } else if (privilege === "3") {
        const userId = getCookie("user-id");
        filteredTasks = allTasks.filter(
          (task) => task.created_by.toString() === userId
        );
      }

      setTasks(filteredTasks);
      setDisplayedTasks(filteredTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
      setMustGetTasks(false);
    }
  };

  const fetchChurchDropdownData = async () => {
    try {
      const response = await get_church_data();
      const churchData = response?.data || [];
      setChurchDropdownOptions(
        churchData.map((church) => ({
          value: church.id.toString(),
          label: church.name,
        }))
      );
    } catch (error) {
      console.error("Error fetching church data:", error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'auto' }}>
      {/* TopBar */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
        <TopBar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

        <div style={{ display: 'flex', flex: 1 }}>
          {/* Sidebar */}
          {isSidebarOpen && (
            <div
              style={{
                width: '150px',
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


          <div
            style={{
              flex: 1,
              overflow: "auto",
              backgroundColor: "#f5f5f5",
              marginTop: "40px",
              marginLeft: isSidebarOpen ? "150px" : "0px",
            }}
          >
          <Card style={{ minHeight: "calc(100vh - 32px)" }}>
          <div
              style={{
                display: "flex",
                flexDirection: isSmallScreen ? "column" : "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "26px",
              }}
            >
              {/* Title */}
              <Title

                style={{
                  fontSize: isSmallScreen ? "28px" : "40px",
                  fontWeight: "bold",
                  textAlign: isSmallScreen ? "center" : "left",
                }}
              >
                Tasks
              </Title>
              <div
                style={{
                  display: "flex",
                  flexDirection: isSmallScreen ? "column" : "row",
                  gap: "16px",
                  alignItems: "center",
                  marginTop: isSmallScreen ? "16px" : "0",
                }}
              >
                <TextInput
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: isSmallScreen ? "100%" : "250px" }}
                  rightSection={
                    <CloseButton
                      aria-label="Clear input"
                      onClick={() => setSearchQuery('')}
                    />
                  }
                />
                {getCookie("priv") === "1" && (
                  <Select
                    variant="filled"
                    color="#65729e"
                    data={churchDropdownOptions}
                    value={selectedChurchDropdownOption}
                    onChange={(value) => setSelectedChurchDropdownOption(value)}
                    placeholder="Select a church"
                  />
                )}
                {!isSuperUser() && (
                  <Button variant="filled" color="#6776ab" onClick={toggleCreateTaskModal}>Add Task</Button>
                )}
              </div>
            </div>

            <Text>
              {isLoading ? (
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <Loader size="xl" />
                </div>
              ) : (
                <Row>
                  {displayedTasks.map((task) => (
                    <Col key={task.id} span={{xs:'12', sm:'8', md:'4', lg:'4'}} 
                      style={{
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <TaskCard task={task} setMustGetTasks={setMustGetTasks} />
                    </Col>
                  ))}
                </Row>
              )}
            </Text>
          </Card>
        </div>
      </div>

      <CreateTaskModal isOpen={isCreateTaskModalOpen} toggle={toggleCreateTaskModal} />
    </div>
  );
};

export default Task;
