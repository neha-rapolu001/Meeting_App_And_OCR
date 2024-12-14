import React, {useEffect, useState} from "react";
import { person_view, getCookie, tasks_view } from "../../api";
import { Modal, Text, Button, Group, Box } from "@mantine/core";

const MeetingInformationModal = ({ isOpen, toggle, meeting }) => {
  const [personMapping, setPersonMapping] = useState({});
  const [taskMapping, setTaskMapping] = useState({});

  useEffect(() => {
    if (isOpen) {
      person_view(getCookie("church"))
        .then((response) => {
          const mapping = {};
          response.data.forEach((person) => {
            mapping[person.id] = `${person.name}`;
          });
          setPersonMapping(mapping);
        })
        .catch((error) => console.error("Error fetching persons:", error));

      tasks_view()
        .then((response) => {
          const mapping = {};
          response.data.results.forEach((task) => {
            mapping[task.id] = task; // Store task details by ID
          });
          setTaskMapping(mapping);
        })
        .catch((error) => console.error("Error fetching tasks:", error));
    }
  }, [isOpen]);

  if (!meeting) return null;

  const attendeesNames = (meeting.attendees || [])
    .map((id) => personMapping[id] || `Unknown ID: ${id}`)
    .join(", ");

  const taskDetails = (meeting.meeting_tasks || [])
    .map((taskId) => {
      const task = taskMapping[taskId];
      if (task) {
        const employeeName = (task.employees || [])
          .map((employeeId) => personMapping[employeeId] || `Unknown ID: ${employeeId}`)
          .join(", ");
        return (
          <div key={task.id} style={{ marginBottom: "10px" }}>
            <div><strong>Task Name:</strong> {task.task_name || "N/A"}</div>
            <div><strong>Due Date:</strong> {task.end_date || "N/A"}</div>
            <div><strong>Assigned To:</strong> {employeeName}</div>
            <div><strong>Priority:</strong> {task.priority || "N/A"}</div>
            <div><strong>Description:</strong> {task.task_description || "N/A"}</div>
          </div>
        );
      }
    return null;
  });


  return (
    <Modal
      opened={isOpen}
      onClose={toggle}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      title={<strong style={{fontSize:"22px"}}>{meeting.name || "Meeting Details"}</strong>}
      size="lg"
      padding="lg"
    >
      <Text size="md" weight={500} style={{ marginBottom: "1rem" }}>
        <strong>Date:</strong> {meeting.date || "N/A"}
      </Text>
      <Text size="md" weight={500} style={{ marginBottom: "1rem" }}>
        <strong>Time:</strong> {meeting.time || "N/A"}
      </Text>
      <Text size="md" weight={500} style={{ marginBottom: "1rem" }}>
        <strong>Meeting Type:</strong> {meeting.type || "N/A"}
      </Text>
      <Text size="md" weight={500} style={{ marginBottom: "1rem" }}>
        <strong>Agenda:</strong> {meeting.agenda || "N/A"}
      </Text>
      <Text size="md" weight={500} style={{ marginBottom: "1rem" }}>
        <strong>Objective:</strong> {meeting.objective || "N/A"}
      </Text>
      <Text size="md" weight={500} style={{ marginBottom: "1rem" }}>
        <strong>Questions:</strong> {meeting.questions || "N/A"}
      </Text>
      <Text size="md" weight={500} style={{ marginBottom: "1rem" }}>
        <strong>People Invited:</strong> {attendeesNames}
      </Text>
      <Text size="md" weight={500} style={{ marginBottom: "1rem" }}>
        <strong>Meeting Notes:</strong> {meeting.notes || "N/A"}
      </Text>
      <Text size="md" weight={500} style={{ marginBottom: "1rem" }}>
        <strong>Tasks:</strong>
        {taskDetails.length > 0 ? taskDetails : " No tasks assigned."}
      </Text>

      <Group position="right">
        <Button color="blue" onClick={toggle}>
          Close
        </Button>
      </Group>
    </Modal>
  );
};

export default MeetingInformationModal;
