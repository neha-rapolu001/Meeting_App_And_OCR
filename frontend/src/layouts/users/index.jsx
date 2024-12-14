import React, { useEffect, useState } from "react";
import {
  Modal,
  TextInput,
  Button,
  Group,
  Select,
  FormLabel,
  Text,
  Title,
  Container,
  Paper,
  Table,
  Card,
  Loader, 
  ScrollArea
} from "@mantine/core";
import { get_users, delete_user, signup, update_user, get_church_data, getCookie, isSuperUser } from "../../api";
import AppSidebar from "../../components/appSidebar";
import TopBar from "../../components/appTopBar";
import { useMediaQuery } from '@mantine/hooks';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editedIndex, setEditedIndex] = useState(null);
  const [editedUser, setEditedUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    user_type: "",
    church: getCookie("church"),
  });
  const [newUser, setNewUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    user_type: "2",
    church: getCookie("church"),
    password: "",
  });
  const [approvalStatus, setApprovalStatus] = useState("");
  const [churchData, setChurchData] = useState([]);
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [userToDelete, setUserToDelete] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    fetchData();
  }, []);

  const toggleModal = () => setModal(!modal);
  const toggleAddModal = () => setAddModal(!addModal);
  const toggleEditModal = () => setEditModal(!editModal);

  const priorityLabels = {
    1: "Super-user",
    2: "Admin",
    3: "Leader",
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    if (isSmallScreen) {
      setIsSidebarOpen(false); // Close sidebar on small screens
    } else {
      setIsSidebarOpen(true); // Open sidebar on large screens
    }
  }, [isSmallScreen]);

  const fetchData = async () => {
    setIsLoading(true); // Show loading state
    try {
      // Fetch users
      const userResponse = await get_users(getCookie("church"));
      const users = userResponse.data;
  
      // Fetch church data
      const churchResponse = await get_church_data();
      const tempChurchData = churchResponse.data.reduce((acc, church) => {
        acc[church.id] = church.name;
        return acc;
      }, {});
  
      // Update states
      setUsers(users);
      setChurchData(tempChurchData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false); // Hide loading state
    }
  };

  const validateForm = (user) => {
    let isValid = true;
    if (!user.first_name) {
      setFirstNameError('First name is required');
      isValid = false;
    } else {
      setFirstNameError('');
    }
    if (!user.last_name) {
      setLastNameError('Last name is required');
      isValid = false;
    } else {
      setLastNameError('');
    }
    if (!user.email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(user.email)) {
      setEmailError('Invalid email format');
      isValid = false;
    } else {
      setEmailError('');
    }
    if (user.password !== undefined) {
      if (!user.password) {
        setPasswordError('Password is required');
        isValid = false;
      } else {
        setPasswordError('');
      }
    }
    return isValid;
  };

  const handleDeleteUser = (userId) => {
    delete_user(userId).then(() => {
      toggleModal();
      setTimeout(() => {
        window.location.reload();
      }, 100);
    });
  };

  const handleEdit = (index) => {
    setEditedIndex(index);
    setEditedUser({
      ...users[index],
      user_type: String(users[index].user_type), // Ensure user_type is a string
    });
    toggleEditModal();
  };

  const handleSaveEdit = () => {
    update_user(editedUser).then(() => {
      toggleEditModal();
      setTimeout(() => {
        window.location.reload();
      }, 100);
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddUser = () => {
    signup(newUser).then((response) => {
      if (response.status === 226) {
        alert(response.data.message);
      }
      toggleAddModal();
      setTimeout(() => {
        window.location.reload();
      }, 100);
    });
  };

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDelete = async () => {
    if (userToDelete) {
      try {
        await delete_user(userToDelete.id);
        fetchData();
        setDeleteModalOpen(false);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const rows = users.map((user, index) => (
    <Table.Tr key={index}>
      <Table.Td>{user.first_name + " " + user.last_name}</Table.Td>
      <Table.Td>{user.email}</Table.Td>
      <Table.Td>{priorityLabels[user.user_type]}</Table.Td>
      <Table.Td>{priorityLabels[user.user_type] === "Super-user" ? "-" : churchData[user.church]}</Table.Td>
      <Table.Td>
        <Button variant="light" color="blue" onClick={() => handleEdit(index)} style={{ marginRight: "5px" }}>
          Edit
        </Button>
        {user.email !== getCookie("user") && (
          <Button variant="outline" color="red" onClick={() => openDeleteModal(user)}>
            Delete
          </Button>
        )}
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
              <Title order={isSmallScreen ? 2 : 1} ml={10} mb={20}>
                Existing Users
              </Title>
              {!isSuperUser() && (
                <Button ml={10} mb={20} variant="filled" color="#65729e" onClick={toggleAddModal}>
                  Add New User
                </Button>
              )}
            </div>
            {isLoading ? (
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <Loader size="xl" />
              </div>
            ) : (
              <Table striped
                style={{
                  width: "100%", // Ensure the table spans the full card width
                  borderCollapse: "collapse", // Cleaner table layout
                }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Email</Table.Th>
                    <Table.Th>Privilege</Table.Th>
                    <Table.Th>Church</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
              </Table>
            )}
          </Card>

          {/* Modals */}
          <Modal opened={modal} onClose={toggleModal}>
            <Text>{approvalStatus === "added" ? "New user has been added." : "User has been deleted."}</Text>
            <Group position="right">
              <Button variant="light" onClick={toggleModal}>
                OK
              </Button>
            </Group>
          </Modal>

          <Modal 
            title = {<strong style={{fontSize: "20px"}}>Add New User</strong>} 
            opened={addModal} 
            onClose={toggleAddModal} 
            overlayProps={{
              backgroundOpacity: 0.55,
              blur: 3,
            }}
          >
            <TextInput
              label="First Name"
              value={newUser.first_name}
              onChange={handleAddInputChange}
              name="first_name"
              mb='1rem'
              error={firstNameError}
            />
            <TextInput
              label="Last Name"
              value={newUser.last_name}
              onChange={handleAddInputChange}
              name="last_name"
              mb='1rem'
              error={lastNameError}
            />
            <TextInput
              label="Email"
              value={newUser.email}
              onChange={handleAddInputChange}
              name="email"
              mb='1rem'
              error={emailError}
            />
            <Select
              label="Privilege"
              value={newUser.user_type}
              mb='1rem'
              onChange={(value) => handleAddInputChange({ target: { name: "user_type", value } })}
              data={[
                ...(isSuperUser() ? [{ value: "1", label: "Super-user" }] : []),
                { value: "2", label: "Admin" },
                { value: "3", label: "Leader" },
              ]}
            />
            <TextInput
              label="Password"
              type="password"
              value={newUser.password}
              onChange={handleAddInputChange}
              name="password"
              mb='1rem'
              error={passwordError}
            />
            <Group position="right">
              <Button variant="filled" onClick={handleAddUser}>
                Add User
              </Button>
              <Button variant="outline" color="gray" onClick={toggleAddModal}>
                Cancel
              </Button>
            </Group>
          </Modal>

          <Modal 
          title={<strong style={{ fontSize:"20px" }}> Edit User</strong>} 
          opened={editModal} 
          onClose={toggleEditModal}
          overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3,
          }}
          >
            <TextInput
              label="First Name"
              value={editedUser.first_name}
              onChange={handleInputChange}
              name="first_name"
              mb="1rem"
              error={firstNameError}
            />
            <TextInput
              label="Last Name"
              value={editedUser.last_name}
              onChange={handleInputChange}
              name="last_name"
              mb="1rem"
              error={lastNameError}
            />
            <TextInput
              label="Email"
              value={editedUser.email}
              onChange={handleInputChange}
              name="email"
              mb="1rem"
              error={emailError}
            />
            <Select
              label="Privilege"
              value={editedUser.user_type}
              mb="1rem"
              onChange={(value) => handleInputChange({ target: { name: "user_type", value } })}
              data={[
                ...(isSuperUser() ? [{ value: "1", label: "Super-user" }] : []),
                { value: "2", label: "Admin" },
                { value: "3", label: "Leader" },
              ]}
            />
            <Group position="right">
              <Button variant="filled" onClick={handleSaveEdit}>
                Save Changes
              </Button>
              <Button variant="outline" color="grey" onClick={toggleEditModal}>
                Cancel
              </Button>
            </Group>
          </Modal>
          {/* Delete Confirmation Modal */}
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
      </div>
    </div>
  );
};

export default Users;
