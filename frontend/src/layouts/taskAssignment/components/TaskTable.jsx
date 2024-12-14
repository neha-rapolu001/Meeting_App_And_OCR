import React, { useEffect, useState } from "react";
import {
  Title,
  Badge,
  ScrollArea,
  Button,
  Modal,
  Loader,
  Table,
  TextInput,
  Autocomplete
} from "@mantine/core";
import CreateTaskModal from "../../../components/modals/CreateTaskModal";
import TaskInformationAndEditModal from "../../../components/modals/TaskInformationAndEditModal"; // Import your modal
import { tasks_view, getCookie, isSuperUser } from "../../../api"; // Ensure this is the correct path
import { IconSearch } from "@tabler/icons-react";

const TasksDueSoonTable = ({ mustGetTasks, setMustGetTasks }) => {
  const [dueSoonTasks, setDueSoonTasks] = useState([]);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTaskInformationAndEditModalOpen, setIsTaskInformationAndEditModalOpen] = useState(false);
  const [taskFetchTrigger, setTaskFetchTrigger] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskId, setTaskId] = useState();

  const toggleCreateTaskModal = () => {
    setIsCreateTaskModalOpen(!isCreateTaskModalOpen);
    setTaskFetchTrigger(!taskFetchTrigger);
  };

  const toggleEditTaskModal = () => {
    setIsTaskInformationAndEditModalOpen(!isTaskInformationAndEditModalOpen);
    setTaskFetchTrigger(!taskFetchTrigger);
  };

  const fetchTasksDueSoon = async () => {
    try {
      setIsLoading(true);
      const response = await tasks_view();
      const allTasks = response?.data.results || [];

      // Get user information from cookies
      const privilege = getCookie("priv");
      const church = getCookie("church");
      const userId = getCookie("user-id");

      let filteredTasks = [];

      // Filter tasks based on privilege level
      if (privilege == 1) {
        filteredTasks = allTasks; // Show tasks from all churches
      } else if (privilege == 2) {
        filteredTasks = allTasks.filter((task) => task.church.toString() === church); // Show tasks from a specific church
      } else if (privilege == 3) {
        filteredTasks = allTasks.filter((task) => task.created_by.toString() === userId); // Show tasks created by the logged-in user
      }

      // Filter tasks that are due soon (next 7 days)
      const today = new Date();
      const filteredDueSoonTasks = filteredTasks.filter((task) => {
        const dueDate = new Date(task.end_date);
        const daysUntilDue = (dueDate - today) / (1000 * 60 * 60 * 24);
        return daysUntilDue > 0 && daysUntilDue <= 7; // Tasks due within the next 7 days
      });

      setDueSoonTasks(filteredDueSoonTasks);
      setIsLoading(false);
      setMustGetTasks(true);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (taskFetchTrigger) {
      fetchTasksDueSoon();
      setTaskFetchTrigger(false); // Reset the internal state variable
    }
  }, [taskFetchTrigger]);

  const autocompleteData = dueSoonTasks.map((task) => ({
    value: task.id.toString(), // Use task ID to ensure uniqueness
    label: task.task_name, // Only display task name in the label
  }));

  useEffect(() => {
    if (searchQuery) {
      setFilteredTasks(
        dueSoonTasks.filter((task) =>
          task.task_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredTasks(dueSoonTasks); // Reset filter if search is cleared
    }
  }, [searchQuery, dueSoonTasks]);

  const onRowClick = async (task) => {
    console.log("Selected Task Data: ", task); // Log the task data
    if (!task) return; // Handle edge case where task might be undefined
    setTaskId(task.id);
    setSelectedTask(task);
    toggleEditTaskModal(selectedTask);
  };

  // Rows for the table
  const rows = filteredTasks.map((task) => (
    <Table.Tr key={task.id} onClick={() => onRowClick(task)} style={{ cursor: "pointer" }}>
      <Table.Td>{task.task_name || "Unnamed Task"}</Table.Td>
      <Table.Td>{task.end_date ? new Date(task.end_date).toLocaleDateString() : "N/A"}</Table.Td>
      <Table.Td>
      <Badge color={task.priority === "high" ? "red" : task.priority === "medium" ? "orange" : "green"}>
          {task.priority || "None"}
        </Badge>
      </Table.Td>
      <Table.Td>{task.is_completed ? "✔️" : "❌"}</Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      {/* Create Task Modal */}
        <CreateTaskModal
          isOpen={isCreateTaskModalOpen}
          toggle={toggleCreateTaskModal}
        />

      {/* Task Information and Edit Modal */}
      <TaskInformationAndEditModal
        id={taskId}
        task={selectedTask}
        isOpen={isTaskInformationAndEditModalOpen}
        toggle={toggleEditTaskModal}
      />


      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title order={4} style={{ color: "#4A4A4A", margin: 0 }}>
          Tasks Due Soon
        </Title>
        {/* Autocomplete Search */}
        <div style={{ display: "flex", alignItems: "center" }}>
        <Autocomplete
            value={searchQuery}
            onChange={setSearchQuery} // Update search query on change
            placeholder="Search tasks"
            icon={<IconSearch />}
            size="xs"
            data={autocompleteData} // Use task name only for autocomplete display
            getoptionLabel={(item) => item.label} // Display task name
            style={{ marginRight: "10px" }}
          />
          {!isSuperUser() && (
            <Button size="xs" color="#6776ab" onClick={toggleCreateTaskModal}>
              + Add Task
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : filteredTasks.length > 0 ? (
        <ScrollArea style={{ height: "540px"}}> {/* Scrollable area with fixed height */}
        <Table striped highlightOnHover withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Task Name</Table.Th>
              <Table.Th>Due Date</Table.Th>
              <Table.Th>Priority</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
        </ScrollArea>
      ) : (
        <p style={{ textAlign: "center" }}>No tasks due soon</p>
      )}
      <div style={{fontSize: "15px", color: "#888" }}>
        Tasks due in the next 7 days
      </div>
    </>
  );
};

export default TasksDueSoonTable;
