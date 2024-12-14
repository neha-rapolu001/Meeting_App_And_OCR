import React, { useState, useEffect } from "react";
import {

  Form,
  FormGroup,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { tasks_update } from "../../api";
import { Container, Title, Card, Button, NavLink, Text, TextInput, Switch } from "@mantine/core";
import { idID } from "@mui/material/locale";

const EditTaskModal = ({ isOpen, toggle, id }) => {
  const [formData, setFormData] = useState({
    task_name: '',
    task_description: '',
    employee_name: '',
    start_date: '',
    end_date: '',
    priority: '',
    meeting_id: '',
    is_completed: '',
    task_id: '',
    created_by: '',
    church: '',
    is_delete: '',
    meetings: ''
  });
  const [errors, setErrors] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    viewSingleTask();
  }, []);

  const viewSingleTask = () => {
    setFormData(id);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value
    }));
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: '' // Clear any previous error for the changed input
    }));
  };

  const handleIsCompleted = (event) => {
    const { name, checked } = event.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: checked
    }));
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: '' // Clear any previous error for the changed input
    }));
  };

  const handlePriorityChange = (e) => {
    const selectedPriority = e.target.value;
    setFormData(prevFormData => ({
      ...prevFormData,
      priority: selectedPriority
    }));
    setErrors(prevErrors => ({
      ...prevErrors,
      priority: '' // Clear any previous error for the changed input
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = {};

    // Validation for task name
    if (!formData.task_name.trim()) {
      validationErrors.task_name = 'Task name is required.';
    }

    // Validation for employee name
    if (!formData.employee_name.trim()) {
      validationErrors.employee_name = 'Employee name is required.';
    }

    // Validation for start date
    if (!formData.start_date) {
      validationErrors.start_date = 'Start date is required.';
    }

    // Validation for end date
    if (!formData.end_date) {
      validationErrors.end_date = 'End date is required.';
    }

    // Validation for priority
    if (!formData.priority) {
      validationErrors.priority = 'Priority is required.';
    }

    // If there are validation errors, set them in the state and return
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // If no validation errors, proceed with submitting the form
    try {
      const response = await tasks_update(formData.task_id, formData);
      console.log(response.data.message);
      toggle();
    } catch (error) {
      console.error("Error updating tasks: ", error);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Edit Task</ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          <FormGroup>
            
            <Label style={{color:"black"}}for="task_name">Task Name *</Label>
            <TextInput
              type="text"
              name="task_name"
              id="task_name"
              value={formData.task_name}
              onChange={handleChange}
            />
            {errors.task_name && <div className="text-danger">{errors.task_name}</div>}
          </FormGroup>
          <FormGroup>
            <Label for="task_description">Task Description</Label>
            <TextInput
              type="textarea"
              name="task_description"
              id="task_description"
              placeholder="Enter task description"
              value={formData.task_description}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="employee_name">Employee Name*</Label>
            <TextInput
              type="text"
              name="employee_name"
              id="employee_name"
              value={formData.employee_name}
              onChange={handleChange}
            />
            {errors.employee_name && <div className="text-danger">{errors.employee_name}</div>}
          </FormGroup>
          <FormGroup>
            <Label for="start_date">Start Date*</Label>
            <TextInput
              type="date"
              name="start_date"
              id="start_date"
              value={formData.start_date}
              onChange={handleChange}
            />
            {errors.start_date && <div className="text-danger">{errors.start_date}</div>}
          </FormGroup>
          <FormGroup>
            
            <Label for="end_date">End Date*</Label>
            <TextInput
              type="date"
              name="end_date"
              id="end_date"
              value={formData.end_date}
              onChange={handleChange}
            />
            {errors.end_date && <div className="text-danger">{errors.end_date}</div>}
          </FormGroup>
          <FormGroup>
            <Label for="is_completed">Is completed</Label>
            <Switch
              name="is_completed"
              onChange={handleIsCompleted}
              checked={formData.is_completed}
            />
          </FormGroup>
          <FormGroup>
            <Label for="taskPriority">Task Priority*</Label>
            <Dropdown isOpen={dropdownOpen} value={formData.priority} toggle={toggleDropdown} >
              <DropdownToggle caret>
                {formData.priority ? formData.priority : "Select priority"}
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
            {errors.priority && <div className="text-danger">{errors.priority}</div>}
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button variant="filled" color="rgba(90, 211, 250, 1)" type="submit">
            Save Task
          </Button>{" "}
          <Button  variant="filled" color="rgba(214, 66, 66, 1)"onClick={toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default EditTaskModal;
