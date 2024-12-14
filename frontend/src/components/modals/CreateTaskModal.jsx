/**
 * This component is the Create task modal of the application. It contains form to create a task.
 *
 * @params: {props}
 *
 *
 */

import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { tasks_create, getCookie } from "../../api";

const CreateTaskModal = ({ isOpen, toggle }) => {
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [showError, setShowError] = useState(false);


  useEffect( () => {
    setShowError(false);
  }, [isOpen, toggle]);

  // Toggle the dropdown state
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Handle changes to the priority dropdown
  const handlePriorityChange = (e) => {
    setPriority(e.target.value);
  };

  const validate = () => {
    const errors = {};

    if (!taskName) {
      errors.taskName = "Task name is required";
    }

    if (!employeeName) {
      errors.employeeName = "Employee name is required";
    }

    if (!startDate) {
      errors.startDate = "Start date is required";
    }

    if (!endDate) {
      errors.endDate = "End date is required";
    }

    if (!priority) {
      errors.priority = "Priority is required";
    }

    setErrors(errors);
    setShowError(Object.keys(errors).length !== 0);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) {
      setShowError(true);
      return;
    }

    const formData = {
      task_name: taskName,
      employee_name: employeeName,
      start_date: startDate,
      end_date: endDate,
      task_description: taskDescription,
      priority: priority,
      meeting_id: null,
      created_by:getCookie("user-id"),
      church:getCookie("church")
    };

    // Send the form data to the API using fetch or axios
    tasks_create(formData)
      // .then((response) => response.json())
      .then((data) => {
        console.log("Task created:", data);
        toggle(); // Close the modal
      })
      .catch((error) => {
        console.error("Error creating task:", error);
      });
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Create Task</ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          {/* <FormGroup>
            <Label for="taskName">Task Name</Label>
            <Input
              type="text"
              name="taskName"
              id="taskName"
              value={taskName}
              onChange={(event) => setTaskName(event.target.value)}
            />
          </FormGroup> */}
           <FormGroup>
            <Label for="taskName">Task Name*</Label>
            <Input
              type="text"
              name="taskName"
              id="taskName"
              value={taskName}
              onChange={(event) => setTaskName(event.target.value)}
              invalid={showError}
            />
            <div className="invalid-feedback" style={{display: showError ? "block" : "none"}}>{errors.taskName}</div>
          </FormGroup>
          <FormGroup>
            <Label for="taskDescription">Task Description</Label>
            <Input
              type="textarea"
              name="taskDescription"
              id="taskDescription"
              placeholder="Enter task description"
              value={taskDescription}
              onChange={(event) => setTaskDescription(event.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="employeeName">Employee Name*</Label>
            <Input
              type="text"
              name="employeeName"
              id="employeeName"
              value={employeeName}
              onChange={(event) => setEmployeeName(event.target.value)}
              invalid={showError}
              />
              <div className="invalid-feedback" style={{display: showError ? "block" : "none"}}>{errors.employeeName}</div>
          </FormGroup>
          <FormGroup>
            <Label for="startDate">Start Date*</Label>
            <Input
              type="date"
              name="startDate"
              id="startDate"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              invalid={showError}
              />
              <div className="invalid-feedback" style={{display: showError ? "block" : "none"}}>{errors.startDate}</div>
          </FormGroup>
          <FormGroup>
            <Label for="endDate">End Date*</Label>
            <Input
              type="date"
              name="endDate"
              id="endDate"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              invalid={showError}
              />
              <div className="invalid-feedback" style={{display: showError ? "block" : "none"}}>{errors.endDate}</div>
          </FormGroup>
          <FormGroup>
            <Label for="taskPriority">Task Priority*</Label>
            <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
              <DropdownToggle caret>
                {priority ? priority : "Select priority"}
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem value="low" onClick={handlePriorityChange}>
                  Low
                </DropdownItem>
                <DropdownItem value="medium" onClick={handlePriorityChange}>
                  Medium
                </DropdownItem>
                <DropdownItem value="high" onClick={handlePriorityChange}>
                  High
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <div className="invalid-feedback" style={{display: showError ? "block" : "none"}}>{errors.priority}</div>
          </FormGroup>

          <FormGroup></FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" type="submit">
            Create Task
          </Button>{" "}
          <Button color="secondary" onClick={toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default CreateTaskModal;
