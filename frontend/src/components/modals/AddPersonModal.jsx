import React, { useState } from 'react';
import { Modal, TextInput, Button, Text } from '@mantine/core';
import { add_person } from '../../api';
import { getCookie } from '../../api.js';

const AddPersonModal = ({ opened, toggleModal, fetchPersons }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    church: getCookie('church'),
  });
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
    setValidationErrors((prevState) => ({ ...prevState, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required.';
    if (!formData.email.trim()) {
      errors.email = 'Email is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address.';
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    add_person(formData)
      .then(() => {
        toggleModal();
        fetchPersons();  // Re-fetch the list of persons after adding
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <Modal 
      opened={opened} 
      onClose={toggleModal} 
      title={<strong style={{fontSize:"20px"}}>Add New Person</strong>}
    >
      <div>
        <div style={{ marginBottom: "15px" }}>
          <TextInput
            label="Name"
            placeholder="Person Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={validationErrors.name}
            required
          />
        </div>
        <div>
          <TextInput
            label="Email"
            placeholder="Person Email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            error={validationErrors.email}
            required
          />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
          <Button variant="filled" color="blue" onClick={handleSubmit} style={{ marginRight: "10px" }}>
            Save
          </Button>
          <Button variant="outline" color="gray" onClick={toggleModal}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddPersonModal;
