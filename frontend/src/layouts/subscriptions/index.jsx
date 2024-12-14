import React, { useEffect, useState } from "react";
import { Card, Button, Table, Modal, TextInput, Title, Group, Text, Loader } from "@mantine/core";
import AppSidebar from "../../components/appSidebar";
import TopBar from "../../components/appTopBar";
import { get_subscriptions, add_subscription, update_subscription, delete_subscription } from "../../api";
import { useMediaQuery } from '@mantine/hooks';

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); // State for delete modal
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    price: "",
    count: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [subscriptionToDelete, setSubscriptionToDelete] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    if (isSmallScreen) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isSmallScreen]);

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const response = await get_subscriptions();
      setSubscriptions(response.data);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModal = (subscription = null) => {
    setModalOpen(!modalOpen);
    if (subscription) {
      setFormData({
        id: subscription.id,
        name: subscription.name,
        price: subscription.price.toString(),
        count: subscription.count.toString(),
      });
      setIsEditMode(true);
    } else {
      setFormData({ id: "", name: "", price: "", count: "" });
      setIsEditMode(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.price.trim() || isNaN(formData.price)) errors.price = "Price must be a number";
    if (!formData.count.trim() || isNaN(formData.count)) errors.count = "Count must be a number";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      if (isEditMode) {
        await update_subscription(formData.id, formData);
      } else {
        await add_subscription(formData);
      }
      toggleModal();
      fetchSubscriptions();
    } catch (error) {
      console.error("Error saving subscription:", error);
    }
  };

  const handleDelete = async () => {
    if (subscriptionToDelete) {
      try {
        await delete_subscription(subscriptionToDelete.id);
        setDeleteModalOpen(false);
        fetchSubscriptions();
      } catch (error) {
        console.error("Error deleting subscription:", error);
      }
    }
  };

  const openDeleteModal = (subscription) => {
    setSubscriptionToDelete(subscription);
    setDeleteModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'auto' }}>
      {/* TopBar */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
        <TopBar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>
        <div style={{ display: 'flex', flex: 1 }}>
          {/* Sidebar */}
          {isSidebarOpen && (
            <div
              style={{
                width: '0',
                backgroundColor: '#f4f4f4',
                height: '100vh',
                position: 'fixed', // Fixed for small screens, relative for large screens
                top: 0,
                left: 0,
                zIndex: 999, // Higher z-index for small screens
                transition: 'transform 0.3s ease', // Smooth open/close
              }}
            >
              <AppSidebar />
            </div>
          )}
        {/* Main Content */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop:"40px",
          }}
        >
          <Card
            style={{
              width: isSmallScreen ? "100%" : "80%",
              minWidth: "600px",
              maxWidth: "1400px",
              marginLeft: isSmallScreen? "0" : "170px",
              padding: "20px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <Title order={isSmallScreen ? 2 : 1} ml={10} mb={20}>
                Subscriptions
              </Title>
              <Button mb={20} variant="filled" color="#6776ab" onClick={() => toggleModal()}>
                Add Subscription
              </Button>
            </div>

            {/* Loading or Table */}
            {isLoading ? (
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <Loader size="xl" />
              </div>
            ) : (
              <Table striped style={{ width: "100%" }}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Price</Table.Th>
                    <Table.Th>Count</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {subscriptions.map((subscription) => (
                    <Table.Tr key={subscription.id}>
                      <Table.Td>{subscription.name}</Table.Td>
                      <Table.Td>${subscription.price}</Table.Td>
                      <Table.Td>{subscription.count}</Table.Td>
                      <Table.Td>
                        <Button
                          variant="light"
                          color="blue"
                          onClick={() => toggleModal(subscription)}
                          style={{ marginRight: "10px" }}
                        >
                          Edit
                        </Button>
                        <Button variant="outline" color="red" onClick={() => openDeleteModal(subscription)}>
                          Delete
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Card>
        </div>
      </div>

      {/* Modal for Add/Edit */}
      <Modal 
        opened={modalOpen} 
        onClose={() => toggleModal()} 
        title={isEditMode ? <strong style={{ fontSize:"20px"}}>Edit Subscription</strong> : <strong style={{ fontSize:"20px"}}>Add Subscription</strong>}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        >
        <div>
          <div style={{ marginBottom: "15px" }}>
            <TextInput
              label="Name"
              placeholder="Subscription Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={validationErrors.name}
              required
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <TextInput
              label="Price"
              placeholder="Subscription Price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              error={validationErrors.price}
              required
            />
          </div>
          <div>
            <TextInput
              label="Count"
              placeholder="Subscription Count"
              name="count"
              value={formData.count}
              onChange={handleInputChange}
              error={validationErrors.count}
              required
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
            <Button variant="filled" color="blue" onClick={handleSubmit} style={{ marginRight: "10px" }}>
              {isEditMode ? "Update" : "Add"}
            </Button>
            <Button variant="outline" color="gray" onClick={() => toggleModal()}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Subscription"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        size="sm"
        padding="lg"
      >
        <Text size="md" weight={500} style={{ marginBottom: '1rem' }}>
          Are you sure you want to delete this subscription?
        </Text>

        <Group position="apart">
          <Button color="red" onClick={handleDelete}>
            Yes
          </Button>
          <Button color="gray" onClick={() => setDeleteModalOpen(false)}>
            No
          </Button>
        </Group>
      </Modal>
    </div>
  );
};

export default SubscriptionsPage;
