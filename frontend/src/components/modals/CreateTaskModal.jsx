import React, { useState, useEffect } from "react";
import { tasks_create, getCookie, person_view } from "../../api";
import { Button, TextInput, Switch, MultiSelect, Modal, Group, Text, Select, Title, Textarea } from "@mantine/core";
import AddPersonModal from "./AddPersonModal";

const CreateTaskModal = ({ isOpen, toggle }) => {
  const [formData, setFormData] = useState({
    task_name: '',
    task_description: '',
    employees: [],
    start_date: '',
    end_date: '',
    priority: '',
    created_by: getCookie("user-id"),
    church: getCookie("church"),
  });
  const [errors, setErrors] = useState({});
  const [people, setPeople] = useState([]); // List of persons for MultiSelect
  const [addPersonModalOpen, setAddPersonModalOpen] = useState(false);

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    const church = parseInt(getCookie("church"));
    try {
      const response = await person_view(church);
      setPeople(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '', // Clear any previous error for the changed input
    }));
  };

  const handleEmployeesChange = (selectedIds) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      employees: selectedIds.map(Number), // Update selected person IDs
    }));
  };

  const toggleNewPersonModal = () => {
    setAddPersonModalOpen(!addPersonModalOpen); // Toggle Add Person modal
  };

  const handleIsCompleted = (event) => {
    const { name, checked } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: checked,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '', // Clear any previous error for the changed input
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = {};

    // Validation for task name
    if (!formData.task_name.trim()) {
      validationErrors.task_name = 'Task name is required.';
    }
    if (!formData.task_description) {
      validationErrors.task_description = 'Task description is required' ;
    }
    // Validation for employee name
    if (!formData.employees.length) {
      validationErrors.employees = 'Employee(s) are required.';
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
      const response = await tasks_create(formData);
      console.log(response.data.message);
      toggle(); // Close the modal after creating the task
    } catch (error) {
      console.error("Error creating task: ", error);
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={toggle}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      title={<strong style={{fontSize:"20px"}}>Create Task</strong>}
      size="lg"
      padding="lg"
    >
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Task Name"
          placeholder="Enter task name"
          name="task_name"
          value={formData.task_name}
          onChange={handleChange}
          error={errors.task_name}
          size="md"
          style={{ marginBottom: '1rem' }}
          required
        />
        <Textarea
          label="Task Description"
          placeholder="Enter task description"
          name="task_description"
          value={formData.task_description}
          onChange={handleChange}
          error={errors.task_description}
          size="md"
          style={{ marginBottom: '1rem' }}
          required
          autosize
          minRows={4}
          maxRows={4}
        />
        <MultiSelect
          label="Employee(s)"
          data={people.map((person) => ({
            value: person.id?.toString(),
            label: person.name || "Unnamed Person",
          }))}
          value={formData.employees.map(String)}
          onChange={handleEmployeesChange}
          searchable
          placeholder="Select employee(s)"
          nothingFoundMessage={
            <>
              No matches found.{" "}
              <Button
                variant="outline"
                color="blue"
                size="xs"
                onClick={toggleNewPersonModal}
              >
                Add Person
              </Button>
            </>
          }
          clearable
          error={errors.employees}
          size="md"
          style={{ marginBottom: '1rem' }}
          required
        />
        <TextInput
          label="Start Date"
          placeholder="Select start date"
          name="start_date"
          type="date"
          value={formData.start_date}
          onChange={handleChange}
          error={errors.start_date}
          size="md"
          style={{ marginBottom: '1rem' }}
          required
        />
        <TextInput
          label="End Date"
          placeholder="Select end date"
          name="end_date"
          type="date"
          value={formData.end_date}
          onChange={handleChange}
          error={errors.end_date}
          size="md"
          style={{ marginBottom: '1rem' }}
          required
        />
        <Group position="apart" style={{ marginBottom: '1rem' }}>
          <Text weight={500} size="md" fw={500}>Is Completed</Text>
          <Switch
            name="is_completed"
            checked={formData.is_completed}
            onChange={handleIsCompleted}
            size="md"
          />
        </Group>

        {/* Dropdown for Task Priority */}
        <Select
          label="Task Priority"
          value={formData.priority}
          onChange={(value) => setFormData({ ...formData, priority: value })}
          data={[
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
          ]}
          error={errors.priority}
          placeholder="Select priority"
          size="md"
          style={{ marginBottom: '1rem' }}
          required
        />

        <Button
          fullWidth
          color="blue"
          type="submit"
          style={{ marginTop: '1rem' }}
          size="md" // Make the button bigger
        >
          Create Task and Notify
        </Button>
      </form>
      <Button
        variant="outline"
        color="red"
        onClick={toggle}
        fullWidth
        style={{ marginTop: '1rem' }}
        size="md"
      >
        Cancel
      </Button>
      <AddPersonModal
        opened={addPersonModalOpen}
        toggleModal={toggleNewPersonModal}
        fetchPersons={fetchPeople} // Ensure the list is updated after adding a new person
      />
    </Modal>
  );
};

export default CreateTaskModal;
