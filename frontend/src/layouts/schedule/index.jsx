import React, { useEffect, useState } from "react";
import {
  Container,
  Title,
  Card,
  Button,
  Text,
  Select,
  Loader,
  TextInput,
  CloseButton,
  Burger
} from "@mantine/core"; // Added Burger for responsiveness
import { Row, Col } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mantine/hooks"; // For media query handling
import { getCookie, meeting_view, get_church_data, isSuperUser, person_view, tasks_view } from "../../api";
import AppSidebar from "../../components/appSidebar";
import MeetingCard from "./components/MeetingCard";
import TopBar from "../../components/appTopBar";

const Schedule = () => {
  const [meetings, setMeetings] = useState([]);
  const [allMeetings, setAllMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [churchDropdownOptions, setChurchDropdownOptions] = useState([]);
  const [selectedChurchDropdownOption, setSelectedChurchDropdownOption] = useState(null);
  const [mustGetMeetings, setMustGetMeetings] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [personMapping, setPersonMapping] = useState({});
  const [taskMapping, setTaskMapping] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar toggle state

  const isSmallScreen = useMediaQuery("(max-width: 768px)"); // Check for small screens
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  useEffect(() => {
    if (isSmallScreen) {
      setIsSidebarOpen(false); // Close sidebar on small screens
    } else {
      setIsSidebarOpen(true); // Open sidebar on large screens
    }
  }, [isSmallScreen]);

  // Fetch meetings and church data
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await meeting_view();
        const privilege = getCookie("priv");

        const filterMeetings = (meeting) => {
          if (privilege === "1" && meeting.church.toString() === selectedChurchDropdownOption) return true;
          if (privilege === "2" && meeting.church.toString() === getCookie("church")) return true;
          if (privilege === "3" && meeting.created_by.toString() === getCookie("user-id")) return true;
          return false;
        };

        setAllMeetings(response?.data || []);
        setMeetings(response?.data.filter(filterMeetings) || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
        setMustGetMeetings(false);
      }
    };

    const fetchChurchDropdownData = async () => {
      try {
        const response = await get_church_data();
        setChurchDropdownOptions(
          response.data.map((church) => ({
            value: church.id.toString(),
            label: church.name,
          }))
        );
      } catch (error) {
        console.error(error);
      }
    };

    if (mustGetMeetings) fetchMeetings();
    fetchChurchDropdownData();
  }, [mustGetMeetings, selectedChurchDropdownOption]);

  const newMeeting = () => {
    navigate("/schedule/meeting", { state: { meeting: null, clearForm: true } });
  };

  const onChurchDropdownOptionChange = (value) => {
    setSelectedChurchDropdownOption(value);
    setMeetings(allMeetings.filter((meeting) => meeting.church.toString() === value));
  };

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const response = await person_view(getCookie("church"));
        const mapping = {};
        response.data.forEach((person) => {
          mapping[person.id] = person.name; // Create a mapping of person ID to name
        });
        setPersonMapping(mapping); // Save the mapping to state
      } catch (error) {
        console.error("Error fetching persons:", error);
      }
    };

    const fetchTasks = async () => {
      try {
        const response = await tasks_view();
        const mapping = {};
        response.data.results.forEach((task) => {
          mapping[task.id] = task;
        });
        setTaskMapping(mapping);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchPersons();
    fetchTasks();
  }, []);

  useEffect(() => {
    const filteredMeetings = allMeetings.filter((meeting) => {
      const searchText = searchQuery.toLowerCase();

      const attendees = (meeting.attendees || [])
        .map((id) => personMapping[id]?.toLowerCase() || "")
        .join(" ");

      const tasks = (meeting.meeting_tasks || [])
        .map((id) => {
          const task = taskMapping[id] || {};
          return [
            task.task_name?.toLowerCase() || "",
            task.priority?.toLowerCase() || "",
          ].join(" ");
        })
        .join(" ");

      const employees = (meeting.employees || [])
        .map((id) => personMapping[id]?.toLowerCase() || "")
        .join(" ");

      return (
        meeting.name.toLowerCase().includes(searchText) ||
        meeting.type.toLowerCase().includes(searchText) ||
        meeting.date.toLowerCase().includes(searchText) ||
        meeting.time.toLowerCase().includes(searchText) ||
        meeting.notes?.toLowerCase().includes(searchText) ||
        meeting.questions.toLowerCase().includes(searchText) ||
        meeting.agenda?.toLowerCase().includes(searchText) ||
        meeting.action_steps.toLowerCase().includes(searchText) ||
        meeting.objective?.toLowerCase().includes(searchText) ||
        attendees.includes(searchText) ||
        tasks.includes(searchText) ||
        employees.includes(searchText)
      );
    });

    setMeetings(filteredMeetings);
  }, [searchQuery, allMeetings, personMapping, taskMapping]);

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
                Meetings
              </Title>

              {/* Search and Buttons */}
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
                  placeholder="Search meetings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.currentTarget.value)}
                  style={{ width: isSmallScreen ? "100%" : "250px" }}
                  rightSection={
                    <CloseButton aria-label="Clear input" onClick={() => setSearchQuery("")} />
                  }
                />
                {getCookie("priv") === "1" && (
                  <Select
                    variant="filled"
                    color="#65729e"
                    data={churchDropdownOptions}
                    value={selectedChurchDropdownOption}
                    onChange={onChurchDropdownOptionChange}
                    placeholder="Select a church"
                  />
                )}
                {!isSuperUser() && (
                  <Button
                    variant="filled"
                    color="#6776ab"
                    onClick={newMeeting}
                    style={{ color: "white", fontWeight: "bold" }}
                  >
                    Add Meeting
                  </Button>
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
                  {meetings.map((meeting) => (
                    <Col key={meeting.id} span={{xs:'12', sm:'8', md:'4', lg:'4'}} 
                      style={{
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <MeetingCard
                        meeting={meeting}
                        mustGetMeetings={mustGetMeetings}
                        setMustGetMeetings={setMustGetMeetings}
                      />
                    </Col>
                  ))}
                </Row>
              )}
            </Text>
          </Card>
        </div>
      </div>
    </div>
    
  );
};

export default Schedule;