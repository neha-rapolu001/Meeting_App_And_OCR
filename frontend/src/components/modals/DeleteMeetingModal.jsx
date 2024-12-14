/**
 * This component is the delete meeting modal of the application.
 *
 * @params: {props}
 *
 *
 */

import {
  React,
  useState,
  useEffect
} from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { meeting_update } from "../../api";

const DeleteMeetingModal = (props) => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");
  const [attendees, setAttendees] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    viewSingleMeeting();
  // eslint-disable-next-line
  }, []);

  const viewSingleMeeting = () => {
        setId(props.meeting.id);
        setName(props.meeting.name);
        setType(props.meeting.type);
        setDate(props.meeting.date);
        setTime(props.meeting.time);
        setDuration(props.meeting.duration);
        setAttendees(props.meeting.attendees);
        setNotes(props.meeting.notes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      id: id,
      name: name,
      type: type,
      date: date,
      time: time,
      duration: duration,
      attendees: attendees,
      notes: notes,
      deleted: true
    };
    const response = await meeting_update(id, formData)
      .catch((error) => {
        console.error("Error updating meeting:", error);
      })
    console.log(response.data.message);
    props.toggle();
  };


  return (
    <Modal isOpen={props.isOpen} toggle={props.toggle}>
        <ModalBody>
          Are you sure you want to delete this meeting?
        </ModalBody>
        <ModalFooter>
          <Button color="success" type="submit" onClick={handleSubmit}>
            Yes
          </Button>{" "}
          <Button color="success" onClick={props.toggle}>
            No
          </Button>
        </ModalFooter>
    </Modal>
  );
};

export default DeleteMeetingModal;

