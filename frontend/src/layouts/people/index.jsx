import React, { useEffect, useState } from "react";
import {
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input
} from 'reactstrap';

import { Container, Card, Title,NavLink, Text ,Button, TextInput } from "@mantine/core";

import { person_view, add_person, delete_person, getCookie } from '../../../src/api';
import AppSidebar from '../../components/appSidebar';

const PersonPage = () => {
  const [persons, setPersons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    church: getCookie('church')
  });
  const [deleteId, setDeleteId] = useState(null);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    fetchPersons();
  }, []);

  const fetchPersons = () => {
    person_view(getCookie('church'))
      .then((response) => {
        setPersons(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const toggleModal = () => {
    setModal(!modal);
    resetForm();
  };

  const toggleDeleteModal = (id = null) => {
    setDeleteId(id);
    setDeleteModal(!deleteModal);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    if (name === 'name') {
      setNameError('');
    } else if (name === 'email') {
      setEmailError('');
    }
  };

  const validateForm = () => {
    let isValid = true;
    if (!formData.name.trim()) {
      setNameError('Name is required.');
      isValid = false;
    }
    if (!formData.email.trim()) {
      setEmailError('Email is required.');
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setEmailError('Please enter a valid email address.');
        isValid = false;
      }
    }
    return isValid;
  };

  const handleAddPerson = () => {
    if (validateForm()) {
      add_person(formData)
        .then(() => {
          toggleModal();
          fetchPersons();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const handleDeletePerson = () => {
    if (!deleteId) return;
    delete_person(deleteId)
      .then(() => {
        toggleDeleteModal();
        fetchPersons();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      church: getCookie('church')
    });
    setNameError('');
    setEmailError('');
  };

  return (
    <div style={{ display: "flex" }}>
      <AppSidebar />
      <Container style={{paddingTop:"20px", width:"100%"}}>
        <h1>Persons</h1>
        <Button  variant="filled" color="#FFD700" style={{color:"#2E2E2E"}} onClick={toggleModal}>Add Person</Button>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {persons.map((person) => (
              <tr key={person.id}>
                <td>{person.name}</td>
                <td>{person.email}</td>
                <td>
                  <Button variant="outline" color="#2E2E2E"   onClick={() => toggleDeleteModal(person.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal isOpen={modal} toggle={toggleModal}>
          <ModalHeader toggle={toggleModal}>Add Person</ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label for="name">Name</Label>
              <Input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} />
              {nameError && <span style={{ color: 'red' }}>{nameError}</span>}
            </FormGroup>
            <FormGroup>
              <Label for="email">Email</Label>
              <Input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} />
              {emailError && <span style={{ color: 'red' }}>{emailError}</span>}
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button variant="filled" color="#FFD700" style={{color:"#2E2E2E"}} onClick={handleAddPerson}>Add</Button>{' '}
            <Button variant="outline" color="#2E2E2E" onClick={toggleModal}>Cancel</Button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={deleteModal} toggle={toggleDeleteModal}>
          <ModalHeader toggle={toggleDeleteModal}>Delete Person</ModalHeader>
          <ModalBody>
            Are you sure you want to delete this person?
          </ModalBody>
          <ModalFooter>
            <Button  variant="filled" color="#FFD700" style={{color:"#2E2E2E"}} onClick={handleDeletePerson}>Delete</Button>{' '}
            <Button  variant="outline" color="2E2E2E" onClick={toggleDeleteModal}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </Container>
    </div>
  );
};

export default PersonPage;
