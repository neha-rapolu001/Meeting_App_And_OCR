import React, { useState, useEffect } from "react";
import { Button, Modal, Text, Group } from "@mantine/core";
import { tasks_delete } from "../../api";

const DeleteTaskModal = ({ isOpen, toggle, id, setMustGetTasks }) => {
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    viewSingleTask();
  }, [id]);

  const viewSingleTask = () => {
    setTaskId(id?.id);
    setTaskName(id?.task_name);
    setTaskDescription(id?.task_description);
    setEmployeeName(id?.employee_name);
    setStartDate(id?.start_date);
    setEndDate(id?.end_date);
    setPriority(id?.priority);
    setMeetingId(id?.meeting_id);
    setIsCompleted(id?.isCompleted);
  };

  const handleSubmit = async () => {
    const formData = {
      task_id: taskId,
      task_name: taskName,
      task_description: taskDescription,
      employee_name: employeeName,
      is_completed: isCompleted,
      start_date: startDate,
      end_date: endDate,
      priority: priority,
      is_delete: true,
      meeting_id: meetingId,
    };

    try {
      const response = await tasks_delete(formData.task_id, formData);
      console.log(response.data.message);
      toggle(); // Close the modal after the task is deleted
      // setMustGetTasks(true); // Optionally trigger a re-fetch of tasks
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={toggle}
      title="Delete Task"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      size="sm"
      padding="lg"
    >
      <Text size="md" weight={500} style={{ marginBottom: '1rem' }}>
        Are you sure you want to delete this task?
      </Text>

      <Group position="apart">
        <Button color="red" onClick={handleSubmit}>
          Yes
        </Button>
        <Button color="gray" onClick={toggle}>
          No
        </Button>
      </Group>
    </Modal>
  );
};

export default DeleteTaskModal;
