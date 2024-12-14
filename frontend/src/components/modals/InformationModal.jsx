import React, { useEffect, useState } from "react";
import { Button, Modal, Text, Group } from "@mantine/core";
import { getCookie, isLeader, isSuperUser, meeting_view, get_users, get_church_data} from "../../api";

const InformationModal = ({ isOpen, toggle, task }) => {
  const [meetingName, setMeetingName] = useState(null);
  const [userName, setUserName] = useState("");
  const [churchName, setChurchName] = useState(null);

  useEffect(() => {
    const fetchMeetingName = async () => {
      if (task?.meeting_id) {
        try {
          const response = await meeting_view(); // Fetch all meetings
          const meeting = response?.data?.find((m) => m.id === task.meeting_id);
          setMeetingName(meeting ? meeting.name : "Unknown Meeting");
        } catch (error) {
          console.error("Error fetching meeting name:", error);
          setMeetingName("Unknown Meeting");
        }
      }
    };

    const fetchUserName = async () => {
      try {
        const response = await get_users(getCookie("church"));
        const user = response?.data?.find((u) => u.id === task.created_by);
        setUserName(user ? user.first_name + " " + user.last_name: "Unknown User");
      } catch (error) {
        console.error("Error fetching user name:", error);
        setUserName("Unknown User");
      }
    };

    const fetchChurchName = async () => {
      try {
        const response = await get_church_data();
        const church = response?.data?.find((c) => c.id === task.church);
        setChurchName(church ? church.name : "Unknown Church");
      } catch (error) {
        console.error("Error fetching church name: ", error);
        setChurchName("Unknown Church");
      }
    }

    fetchMeetingName();
    fetchUserName();
    fetchChurchName();
  }, [task?.meeting_id], [task?.created_by], [task?.church]);

  return (
    <Modal
      opened={isOpen}
      onClose={toggle}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      title={<strong style={{fontSize: "22px"}}>{task?.task_name}</strong>}
      size="lg"
      padding="lg"
    >
      <Text size="md" weight={500} style={{ marginBottom: '1rem' }}>
        <strong>Task Description:</strong> {task?.task_description}
      </Text>
      <Text size="md" weight={500} style={{ marginBottom: '1rem' }}>
        <strong>Start Date:</strong> {task?.start_date}
      </Text>
      <Text size="md" weight={500} style={{ marginBottom: '1rem' }}>
        <strong>End Date:</strong> {task?.end_date}
      </Text>
      <Text size="md" weight={500} style={{ marginBottom: '1rem' }}>
        <strong>Priority:</strong> {task?.priority}
      </Text>
      <Text size="md" weight={500} style={{ marginBottom: '1rem' }}>
        <strong>Task Status:</strong> {task?.is_completed ? <span>Completed</span> : <span>Pending</span>}
      </Text>
      {task?.meeting_id &&(
      <Text size="md" weight={500} style={{ marginBottom: '1rem' }}>
        <strong>Meeting:</strong> {meetingName}
      </Text>
      )}
      {!isLeader() && (
        <Text size="md" weight={500} style={{ marginBottom: '1rem' }}>
          <strong>Created by:</strong> {userName}
        </Text>
      )}
      {isSuperUser() && (
        <Text size="md" weight={500} style={{ marginBottom: '1rem' }}>
          <strong>Church:</strong> {churchName}
        </Text>
      )}

      <Group position="right">
        <Button color="blue" onClick={toggle}>
          Close
        </Button>
      </Group>
    </Modal>
  );
};

export default InformationModal;
