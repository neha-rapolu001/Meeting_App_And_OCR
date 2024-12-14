import React, { useEffect, useState } from "react";
import { Card, Button, Table, Modal, TextInput, Title, Group, Text, Loader } from "@mantine/core";
import AppSidebar from "../../components/appSidebar";
import TopBar from "../../components/appTopBar";
import {
  get_church_data,
  subscription_view,
  get_users,
  edit_church,
  delete_church,
  delete_user,
  isSuperUser,
} from "../../../src/api";
import { useMediaQuery } from '@mantine/hooks';

const Subscribers = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [churchData, setChurchData] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editedUser, setEditedUser] = useState({ name: "" });
  const [editedIndex, setEditedIndex] = useState(null);
  const [churchNameError, setChurchNameError] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteChurchId, setDeleteChurchId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [churchToDelete, setChurchToDelete] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  const toggleEditModal = () => setEditModal(!editModal);
  const toggleDeleteModal = () => setDeleteModal(!deleteModal);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    if (isSmallScreen) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isSmallScreen]);

  useEffect(() => {
    setIsLoading(true);
    get_church_data()
      .then((response) => {
        console.log("Church data:", response.data); // Debug log
        return Promise.all(
          response.data.map((church) =>
            Promise.all([
              subscription_view(church.subscription),
              get_users(church.id),
            ])
              .then(([subscriptionRes, usersRes]) => {
                console.log("Subscription data:", subscriptionRes.data); // Debug log
                console.log("Users data:", usersRes.data); // Debug log
                if (usersRes.data.length > 0) {
                  return {
                    address: church.address,
                    church_email: church.address,
                    church_id: church.id,
                    church_name: church.name,
                    church_ph_no: church.ph_no,
                    subscription: church.subscription,
                    website: church.website,
                    count: subscriptionRes.data.find(
                      (item) => item.id === church.subscription
                    )?.count,
                    subscription_name: subscriptionRes.data.find(
                      (item) => item.id === church.subscription
                    )?.name,
                    admin_name:
                      usersRes.data[0].first_name +
                      " " +
                      usersRes.data[0].last_name,
                    admin_email: usersRes.data[0].email,
                    existing_user_count: usersRes.data.length,
                  };
                } else {
                  return null;
                }
              })
              .catch((error) => {
                console.error("Error processing church:", church, error);
              })
          )
        );
      })
      .then((churches) => {
        console.log("Processed churches:", churches); // Debug log
        setChurchData(churches.filter((church) => church !== null));
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching church data:", error);
        setIsLoading(false);
      });
  }, []);
  

  const handleEdit = (index) => {
    setEditedIndex(index);
    setEditedUser(churchData[index]);
    toggleEditModal();
  };

  const handleSaveEdit = () => {
    if (validateForm()) {
      edit_church(editedUser).then(() => {
        toggleEditModal();
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      });
    }
  };

  const handleDelete = (church) => {
    setChurchToDelete(church.church_id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    get_users(deleteChurchId)
      .then((response) => {
        Promise.all(
          response.data.map((user) => delete_user(user.id))
        ).then(() => {
          delete_church(deleteChurchId)
            .then(() => {
              setDeleteModalOpen(false);
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            })
            .catch((error) => {
              console.error("Error deleting church:", error);
            });
        });
      })
      .catch((error) => {
        console.error("Error fetching users for church:", error);
      });
  };


  const validateForm = () => {
    if (!editedUser.church_name) {
      setChurchNameError("Church name is required");
      return false;
    }
    setChurchNameError("");
    return true;
  };

  const rows = churchData.map((church, index) => (
    <Table.Tr key={church.church_id}>
      <Table.Td>{church.church_name}</Table.Td>
      <Table.Td>{church.admin_name}</Table.Td>
      <Table.Td>{church.subscription_name}</Table.Td>
      <Table.Td>{church.existing_user_count}</Table.Td>
      <Table.Td>{church.count}</Table.Td>
      <Table.Td>
        {!isSuperUser() && (
          <Button
            variant="light"
            color="#65729e"
            onClick={() => handleEdit(index)}
            style={{ marginRight: "10px" }}
          >
            Edit
          </Button>
        )}
        <Button
          variant="outline"
          color="red"
          onClick={() => handleDelete(church)}
        >
          Delete
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

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
              minWidth: "800px",
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
              <Title order={isSmallScreen ? 2 : 1} ml = {10} style={{ marginBottom: "20px" }}>
              Subscribers
            </Title>
            </div>
            {isLoading ? (
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <Loader size="xl" />
              </div>
            ) : (
              <Table striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Church Name</Table.Th>
                    <Table.Th>Admin Name</Table.Th>
                    <Table.Th>Subscription Type</Table.Th>
                    <Table.Th>Existing User Count</Table.Th>
                    <Table.Th>Total User Limit</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
              </Table>
            )}
          </Card>
        </div>
      </div>

      <Modal
        opened={editModal}
        onClose={toggleEditModal}
        title="Edit Church"
      >
        <TextInput
          label="Church Name"
          value={editedUser.church_name || ""}
          onChange={(e) =>
            setEditedUser((prev) => ({ ...prev, church_name: e.target.value }))
          }
          error={churchNameError}
        />
        <Button onClick={handleSaveEdit} style={{ marginTop: "20px" }}>
          Save
        </Button>
      </Modal>

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete User"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <Text size="md" weight={500} style={{ marginBottom: '1rem' }}>
          Are you sure you want to delete this user?
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

export default Subscribers;
