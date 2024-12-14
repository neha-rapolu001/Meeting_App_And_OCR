import React, { useEffect, useState } from "react";
import {

  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
  Form,
  FormFeedback
} from 'reactstrap';
import { Container, Card, Title,NavLink, Text ,Button, TextInput } from "@mantine/core";
import { get_subscriptions, add_subscription, update_subscription, delete_subscription } from '../../../src/api';
import AppSidebar from '../../components/appSidebar';

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    price: '',
    count: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = () => {
    get_subscriptions()
      .then((response) => {
        const updatedSubscriptions = response.data.map(subscription => ({
          ...subscription,
          count: subscription.count || 0
        }));
        setSubscriptions(updatedSubscriptions);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const toggleModal = (subscription = null) => {
    setModal(!modal);
    if (subscription) {
      setSelectedSubscription(subscription);
      setFormData({
        id: subscription.id,
        name: subscription.name,
        price: subscription.price.toString(),
        count: subscription.count.toString()
      });
      setIsEditMode(true);
    } else {
      setSelectedSubscription(null);
      setFormData({ id: '', name: '', price: '', count: '' });
      setIsEditMode(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    if (!formData.price.trim()) {
      errors.price = "Price is required";
    } else if (isNaN(formData.price)) {
      errors.price = "Price must be a number";
    }
    if (!formData.count.trim()) {
      errors.count = "Count is required";
    } else if (isNaN(formData.count)) {
      errors.count = "Count must be a number";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0; // Return true if there are no errors
  };

  const handleAddSubscription = (e) => {
    e.preventDefault();
    if (validateForm()) {
      add_subscription(formData)
        .then(() => {
          toggleModal();
          fetchSubscriptions();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const handleUpdateSubscription = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const { id, ...updatedData } = formData;
      update_subscription(id, updatedData)
        .then(() => {
          toggleModal();
          fetchSubscriptions();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const handleDeleteSubscription = (id) => {
    delete_subscription(id)
      .then(() => {
        fetchSubscriptions();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div style={{ display: "flex" }}>
      <AppSidebar />
      <div style={{position: "relative", left: "15%",width:"100%", height:"94vh"}} className="my-3">
                <Card className="my-card  my-card-height schedule-card" style={{width:"80%"}}>
        <h1 style={{textAlign:"center"}}>Subscriptions</h1>
        <Button variant="filled" color="#FFD700" style={{width:"300px", marginBottom:"30px", color:"#2E2E2E"}} onClick={() => toggleModal()}>Add Subscription</Button>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Count</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((subscription) => (
              <tr key={subscription.id}>
                <td>{subscription.name}</td>
                <td>${subscription.price}</td>
                <td>{subscription.count}</td>
                <td>
                  <Button variant="filled" color="#FFD700" style={{color:"#2E2E2E"}} onClick={() => toggleModal(subscription)}>Edit</Button>
                  <Button  style={{marginLeft:"5px"}} variant="outline" color="#2E2E2E" onClick={() => handleDeleteSubscription(subscription.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal style={{color:"black"}} isOpen={modal} toggle={toggleModal}>
          <ModalHeader toggle={() => toggleModal()}>{isEditMode ? 'Edit Subscription' : 'Add Subscription'}</ModalHeader>
          <ModalBody>
            <Form onSubmit={isEditMode ? handleUpdateSubscription : handleAddSubscription}>
              <FormGroup>
                <Label for="name">Name</Label>
                <Input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} invalid={!!validationErrors.name} />
                {validationErrors.name && <FormFeedback>{validationErrors.name}</FormFeedback>}
              </FormGroup>
              <FormGroup>
                <Label for="price">Price</Label>
                <Input type="text" name="price" id="price" value={formData.price} onChange={handleInputChange} invalid={!!validationErrors.price} />
                {validationErrors.price && <FormFeedback>{validationErrors.price}</FormFeedback>}
              </FormGroup>
              <FormGroup>
                <Label for="count">Count</Label>
                <Input type="number" name="count" id="count" value={formData.count} onChange={handleInputChange} invalid={!!validationErrors.count} />
                {validationErrors.count && <FormFeedback>{validationErrors.count}</FormFeedback>}
              </FormGroup>
              <Button variant="filled" color="#FFD700" style={{ color:"#2E2E2E"}}type="submit">{isEditMode ? 'Update' : 'Add'}</Button>{' '}
              <Button variant="outline" color="#2E2E2E" onClick={() => toggleModal()}>Cancel</Button>
            </Form>
          </ModalBody>
        </Modal>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionsPage;
