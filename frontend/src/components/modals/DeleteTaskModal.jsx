/**
 * This component is the Delete task modal of the application. It contains form to create a task.
 * 
 * @params: {props}
 * 
 * 
 */

import React, { useState, useEffect } from "react";
import { Button, Form, FormGroup, Label, Input, Modal, ModalHeader, ModalBody, ModalFooter, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { tasks_create, tasks_delete, task_view } from "../../api";

const DeleteTaskModal = ({ isOpen, toggle, id, setMustGetTasks}) => {
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  // const [details, setDetails] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    viewSingleTask();
  }, []);

  const viewSingleTask = () => {
    
        // console.log(req);
        // const task = req.data;
        // console.log("task");
        // console.log(task);
        setTaskId(id.task_id);
        setTaskName(id.task_name);
        setTaskDescription(id.task_description);
        setEmployeeName(id.employee_name);
        setStartDate(id.start_date);
        setEndDate(id.end_date);
        setPriority(id.priority);
        setMeetingId(id.meeting_id);
        setIsCompleted(id.isCompleted);
        //  setDetails(id.detail);
      
      
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = {
        task_id: taskId,
        task_name: taskName,
        task_description: taskDescription,
        employee_name: employeeName ,
        is_completed: isCompleted,
        start_date: startDate,
        end_date: endDate,
        priority: priority,
        is_delete: true,
        meeting_id : meetingId,
        
        
        // detail: "abc",
    };
    const response = await tasks_delete(formData.task_id, formData)
      .catch((error) => {
        console.error("Error updating Tasks:", error);
      })
    console.log(response.data.message);
    toggle();
    // setMustGetTasks(true);
  };


  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Delete Modal</ModalHeader>
        <ModalBody>
          Are you Sure you want to delete this task?
        </ModalBody>
        <ModalFooter>
          <Button color="primary" type="submit" onClick={handleSubmit}>
            Yes
          </Button>{" "}
          <Button color="secondary" onClick={toggle}>
            No
          </Button>
        </ModalFooter>
    </Modal>
  );
};

export default DeleteTaskModal;
