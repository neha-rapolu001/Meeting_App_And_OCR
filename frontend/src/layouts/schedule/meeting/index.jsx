/**
 * Source for the Meeting component. This component consists mostly of
 * a very large meeting form, which is used to create/edit meetings.
 */
import {
  React,
  useState,
  useRef,
  useEffect
} from 'react';
import {
  Row,
  Col,
  Form,
  FormGroup,
  Label,
} from 'reactstrap';
import { useMediaQuery } from "@mantine/hooks";
import {  Radio,Container,Title,Button, Card,  NavLink, Text,TextInput, Textarea, MultiSelect, Group, Select, Modal } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import IconButton from "@mui/material/IconButton";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import CircularProgress from "@mui/material/IconButton";
import RemoveCircleOutlineOutlinedIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import ClearIcon from '@mui/icons-material/Clear';
import ExposureOutlinedIcon from "@mui/icons-material/ExposureOutlined";
import TopBar from "../../../components/appTopBar/index.jsx";
import AddPersonModal from "../../../components/modals/AddPersonModal";

import {
  meeting_create,
  meeting_ocr,
  meeting_update,
  person_view,
  tasks_create,
  tasks_view,
  getCookie,
  isSuperUser,
  add_person,
  tasks_update,
  uploadImage
} from '../../../api.js';
import AppSidebar from "../../../components/appSidebar/index.jsx";
import InvitePeopleModal from "../../../components/modals/InvitePeopleModal.js";

const Meeting = (props) => {

  //To handle the modal popup//
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

  // Function to handle opening the modal and setting the uploaded image URL
  const handleImageClick = (imageUrl) => {
    setUploadedImageUrl(imageUrl);
    console.log("Uploaded Image Url:", uploadedImageUrl);
    setModalOpen(true);
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  }
  // Function to handle closing the modal
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  
  const customTheme = {
    bgcolor: "FFFBE6",
    primary: "#FFE658F1",
    secondary: "#2E2E2E",
    text: "#000",
  };

  const [meetingId, setId] = useState("");
  const [name, setName] = useState("");
  const [agenda, setAgenda] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("");
  const [objective,setObjective] = useState(""); //objective  is to store the object data
  const [questions ,setQuestions]=useState("") ; //questions is to store the question data
  // attendeeIds is a list of person ids
  const [attendeeIds, setAttendeeIds] = useState([]);
  // attendees is a list of person objects
  const [attendees, setAttendees] = useState([]);
  const [teams, setTeams] = useState("");
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState(null);
  const [actionSteps,setActionSteps] = useState("");
  const [meetingTasks, setMeetingTasks] = useState([]);
  const [notesImage, setNotesImage] = useState(null);
  const [displayImage, setDisplayImage] = useState('');
  const [isLoading,setIsLoading]=useState(false);
  const [persons, setPersons] = useState([]);
  const [addPersonModalOpen, setAddPersonModalOpen] = useState(false);
  const [meetingTaskId, setMeetingTaskId] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar toggle state
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  useEffect(() => {
    if (isSmallScreen) {
      setIsSidebarOpen(false); // Close sidebar on small screens
    } else {
      setIsSidebarOpen(true); // Open sidebar on large screens
    }
  }, [isSmallScreen]);

  // imageSrc contains image data to be processed and sent
  // with meeting_ocr request.
  const [imageSrc, setImageSrc] = useState("");
  //console.log(imageSrc,"uploaded image")
  // crop is an object used in cropping image.
  const [crop, setCrop] = useState({
    unit: "%", // Can be 'px' or '%'
    x: 25,
    y: 25,
    width: 50,
    height: 50
  });
  /*
   * "First" scan state means ready to select an image. When not in
   * first scanstate, we are in "second" scan state, meaning ready to
   * either send OCR request or cancel (go back to first state).
   */
  const [isInFirstScanState, setIsInFirstScanState] = useState(true);
  /*
   * Arrays typeSync and typeStrings for synchronizing type state with form.
   */
  const [typeSync, setTypeSync] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false
  ]);
  const [typeStrings, setTypeStrings] = useState([
    "1 on 1",
    "Delegation",
    "Leadership Pipeline",
    "Personal Growth",
    "Debrief",
    "Goal Setting",
    "Leadership Workshop",
    "Problem Solving"
  ]);
  // people holds all person objects
  const [people, setPeople] = useState([]);
  const [isInvitePeopleModalOpen, setIsInvitePeopleModalOpen] = useState(false);

  const navigate = useNavigate();
  const { state } = useLocation();
  // imageRef allows component to keep a reference to
  // the image element in the DOM (used in cropping)
  const imageRef = useRef(null);

  useEffect(() => {
    console.log("State Object:", state);
    
    fetchPeople();
    if (state.clearForm) {
      setId('');
      handleClearForm();
    } else {
  
      setId(state.meeting.id);
      setName(state.meeting.name);
      setAgenda(state.meeting.agenda);
      setDate(state.meeting.date);
      setTime(state.meeting.time);
      setType(state.meeting.type);
      const updatedTypeSync = [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ];
      updatedTypeSync[typeStrings.indexOf(state.meeting.type)] = true;
      setTypeSync(updatedTypeSync);
      setNotes(state.meeting.notes);
      setNotesImage(state.meeting.notes_image);
      
      setActionSteps(state.meeting.action_steps);
      setQuestions(state.meeting.questions);
      setObjective(state.meeting.objective);
      setAttendeeIds(state.meeting.attendees);
      //setNotesImage(state.meeting.notes_image);
      setImageUrl(state.meeting.notes_image);
      setDisplayImage(state.meeting.notes_image);
      console.log("Display Image: ",displayImage);
      //console.log("Image: ",state.meeting.notes_image);
      //console.log("http://localhost:8000/",notesImage);
      if (state.meeting?.notes_image) {
        const imagePath = state.meeting.notes_image.trim(); // Ensure no extra spaces
        const constructedUrl = imagePath;
        console.log("Constructed URL:", constructedUrl);
    
        setDisplayImage(constructedUrl); // Update display image
        fetch(constructedUrl)
          .then((res) => res.blob())
          .then((blob) => {
            const fileName = imagePath.split("/").pop(); // Extract the file name
            const file = new File([blob], fileName, { type: blob.type });
            setNotesImage(file); // Set as File object
          })
          .catch((err) => {
            console.error("Error converting image path to File:", err);
          });
        console.log("State Update Triggered:");
        console.log("Display Image URL:", constructedUrl);
        console.log("Type of notes image:", typeof(notesImage));
      } else {
        console.log("No valid image path provided.");
        setDisplayImage(""); // Clear the display image
      }
      const attendeesArray = [];
      const attendeeIdsArray = [];
      let persons = [];
      // fetch all meetings then push those who are attendees
      // of this meeting to attendeesArray
      person_view(getCookie("church"))
        .then((res) => {
          persons = res.data;
        })
        .then(() => {
          for (const person of persons) {
            if (state.meeting.attendees.indexOf(person.id) > -1) {
              attendeesArray.push(person);
              attendeeIdsArray.push(person.id);
            }
          }
        })
        .then(() => {
          setAttendees(attendeesArray);
          setAttendeeIds(attendeeIdsArray);
        })
        .catch((error) => {
          console.log(error);
        });
      const meetingTasksArray = [];
      let tasks = [];
      // fetch all tasks then push those which belong to this
      // meeting to meetingTasksArray
      tasks_view()
        .then((res) => {
          tasks = res.data.results;
        })
        .then(() => {
          for (const task of tasks) {
            if (state.meeting.meeting_tasks.indexOf(task.id) > -1) {
              meetingTasksArray.push(task);
            }
          }
        })
        .then(() => {
          setMeetingTasks(meetingTasksArray);
        })
        .catch((error) => {
          console.log(error);
        });

        
    }
    
  }, [state]);

  const handleNameChange = (e) => setName(e.target.value);
  const handleAgendaChange = (e) => setAgenda(e.target.value);
  const handleDateChange = (e) => setDate(e.target.value);
  const handleTimeChange = (e) => setTime(e.target.value);
  const handleTypeChange = (e) => {
    
    const value = e.target.value;
    const updatedTypeSync = [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false
    ];
    updatedTypeSync[value] = true;
    setTypeSync(updatedTypeSync);
    setType(typeStrings[value]);
  }
  const handleObjective = (e)=>{
    setObjective(e.target.value);
  }

  const handleQuestions = (e) =>{
    setQuestions(e.target.value)
  }

  const handleTeamsChange = (e) => setTeams(e.target.value);
  const handleNotesChange = (e) => {
    for (let i = 0; i < people.length; i++) {
      console.log("people :"+people[i].id);
    }
    
    setNotes(e.target.value);
  }
  //const handleNotesChange = (e) => setNotes(e.target.value);
  const handleActionSteps = (e) => setActionSteps(e.target.value);


  const handleMeetingTasksChange = (index, name, value) => {
    const updatedMeetingTasks = [...meetingTasks];
  
    // Update the specific task's property
    updatedMeetingTasks[index] = {
      ...updatedMeetingTasks[index],
      [name]: value,
    };
  
    // Debugging output (optional)
    console.log("Updated Meeting Tasks:", updatedMeetingTasks);
  
    setMeetingTasks(updatedMeetingTasks);
  };
  
  const handleAttendeeChange = (selectedIds) => {
    // Sync the selected IDs and corresponding attendees
    const updatedAttendees = people.filter(person => selectedIds.includes(person.id));
    setAttendeeIds(selectedIds);
    setAttendees(updatedAttendees);
  };

  function showError(elementId, errorMessage) {
    const errorElement = document.getElementById(elementId);
    errorElement.innerText = errorMessage;
    errorElement.style.display = 'block';
  }


// Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  var anyError = false;
  const errorFields = document.querySelectorAll('.error-message');
  errorFields.forEach(field => field.innerText = '');

  if (!name) {
      showError('nameError', 'Name field is required.');
      anyError = true;
  }
  if (!type) {
      showError('typeError', 'Type field is required.');
      anyError = true;
  }
  if (!date) {
    showError('dateError', 'Date field is required.');
    anyError = true;
  }
  if (!time) {
    showError('timeError', 'Time field is required.');
    anyError = true;
  }
  if (!agenda) {
    showError('agendaError', 'Agenda field is required.');
    anyError = true;
  }
  if (!notes) {
    showError('noteError', 'Meeting Notes field is required.');
    anyError = true;
  }
  if (!questions) {
    showError('questionError', 'Questions field is required.');
    anyError = true;
  }
  if (!actionSteps) {
    showError('actionStepsError', 'Action Steps field is required.');
    anyError = true;
  }
  if (!objective) {
    showError('objectiveError', 'Objective field is required.');
    anyError = true;
  }
  if(anyError) {
      alert("Required fields are missing! Please check and try again!");
      return;
  }

  const meeting = {
    name: name,
    type: type,
    date: date,
    time: time,
    attendees: attendeeIds,
    agenda: agenda,
    notes: notes,
    notes_image: imageUrl || null,
    questions: questions,
    action_steps : actionSteps,
    objective: objective,
    meeting_tasks: [] // Prepare to hold task IDs
  };

  console.log("Image URL : ", notesImage);
  console.log("Image URL (new): ", imageUrl);

  const submitMeeting = () => {
    let updatedMeeting = { ...meeting };
    updatedMeeting["created_by"] = getCookie("user-id");
    updatedMeeting["church"] = getCookie("church");
    if (meetingId === "") {
      meeting_create(updatedMeeting)
        .then(() => {
          navigate("/schedule");
        })
        .catch((error) => {
          console.error("Error creating meeting:", error);
        });
    } else {
      meeting_update(meetingId, updatedMeeting)
        .then(() => {
          console.log(updatedMeeting);
          navigate("/schedule");
        })
        .catch((error) => {
          console.log(updatedMeeting);
          console.error("Error updating meeting:", error);
        });
    }
  };

  let counter = meetingTasks.length;

  const checkSubmitMeeting = () => {
    if (--counter <= 0) {
      submitMeeting();
    }
  };

  if (counter === 0) {
    submitMeeting();
  }

  for (const meetingTask of meetingTasks) {
    let tempTask = { ...meetingTask };
    tempTask["created_by"] = getCookie("user-id");
    tempTask["church"] = getCookie("church");
    tempTask["meeting_id"] = meetingId || null;

    // Check if the task has an ID (existing task)
    if (tempTask.id) {
      // Update the existing task
      tasks_update(tempTask.id, tempTask)
        .then(() => {
          meeting.meeting_tasks.push(tempTask.id); // Ensure the task is included in the meeting's task list
          checkSubmitMeeting();
        })
        .catch((error) => {
          console.error("Error updating task:", error);
        });
    } else {
      // Create a new task
      tasks_create(tempTask)
        .then((res) => {
          meeting.meeting_tasks.push(res.data.id); // Add the new task ID to the meeting's task list
        })
        .then(() => {
          checkSubmitMeeting();
        })
        .catch((error) => {
          console.error("Error creating task:", error);
        });
    }
  }
};



  const handleClearForm = () => {
    setName("");
    setAgenda("");
    setDate("");
    setTime("");
    setType("");
    setTypeSync([
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false
    ]);
    setAttendeeIds([]);
    setAttendees([]);
    setTeams("");
    setNotes("");
    setNotesImage(null);
    setActionSteps("");
    setQuestions("");
    setObjective("");
    setMeetingTasks([]);
  };

  const addMeetingTask = () => {
    const meetingTask = {
      task_name: "",
      employee_name: "",
      start_date: "1970-01-01",
      end_date: "",
      task_description: "",
      priority: "",
      meeting_id: "1",
    }
    let updatedMeetingTasks = meetingTasks.slice();
    updatedMeetingTasks.push(meetingTask);
    setMeetingTasks(updatedMeetingTasks);
  }

  const removeMeetingTask = (e) => {
    const meetingTaskIndex = meetingTasks.indexOf(e.target.getAttribute("task"));
    const updatedMeetingTasks = [...meetingTasks];
    updatedMeetingTasks.splice(meetingTaskIndex, 1);
    setMeetingTasks(updatedMeetingTasks);
  }

  const toggleInvitePeopleModal = () => {
    setIsInvitePeopleModalOpen(!isInvitePeopleModalOpen);
  }

  const fetchPeopleAndToggleModal = async () => {
    const church=parseInt(getCookie("church"));
    const response =
      await person_view(church)
      .then((res) => {
        setPeople(res.data);
      })
      .then(() => {
        toggleInvitePeopleModal();
      })
      .catch((error) => {
        console.log(error)
      });
  }

  const fetchPeople= async () => {
    const church= parseInt(getCookie("church"));
    const response =
      await person_view(church)
      .then((res) => {
        setPeople(res.data);
      })
      .catch((error) => {
        console.log(error)
      });
  }

  /*
   * Closure to pass to InvitePeopleModal and
   * from there to NameCard.
   */
  const invitePerson = (person) => {
    if (!attendeeIds.includes(person.id)) {
      const updatedAttendeeIds = [person.id];
    const updatedAttendees = [...attendees,person];
    setAttendeeIds(updatedAttendeeIds);
    setAttendees(updatedAttendees);
    
    }

  }
  /*
   * Closure to pass to InvitePeopleModal and
   * from there to NameCard.
   */
  const uninvitePerson = (person) => {
    if (attendeeIds.includes(person.id)) {
      const updatedAttendeeIds = [...attendeeIds];
      const updatedAttendees = [...attendees];
      const index = updatedAttendeeIds.indexOf(person.id);
      updatedAttendeeIds.splice(index, 1);
      updatedAttendees.splice(index, 1);
      setAttendeeIds(updatedAttendeeIds);
      setAttendees(updatedAttendees);
    }
  }

  /*
   * Load a different local file for OCR.
   */
  const onImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setUploadedImageUrl(reader.result);
      }
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  const handleScanFromPhotoClick = async () => {
    imageRef.current.click();
    toggleScanState();
  }

  /*
   * Get binary array representation of cropped image then
   * send POST request to meeting view that makes call to
   * OCR api. Currently logs response text in console.
   */
  const handleOCRRequest = async () => {
    console.log("came to handleOCR");
    
    const imgElem = document.getElementById("img-elem")
    const croppedImageCanvas = document.createElement("canvas");
    // Resize and crop the image before sending it for OCR
    const croppedWidth = crop.width * imgElem.naturalWidth / 100;
    const croppedHeight = crop.height * imgElem.naturalHeight / 100;
    croppedImageCanvas.width = croppedWidth;
    croppedImageCanvas.height = croppedHeight;
    const croppedImageContext = croppedImageCanvas.getContext("2d");
    croppedImageContext.drawImage(
      imgElem,
      crop.x * imgElem.naturalWidth / 100,
      crop.y * imgElem.naturalHeight / 100,
      croppedWidth,
      croppedHeight,
      0,
      0,
      croppedWidth,
      croppedHeight
    );

    const croppedImage = await new Promise(
      (resolve, reject) => {
        croppedImageCanvas.toBlob(
          blob => {resolve(blob);},
          "image/jpeg"
        );
      }
    );

    const reader = new FileReader();
    reader.onload = async () => {
      setIsLoading(true);
      const response = await meeting_ocr({image_binary : new Uint8Array(reader.result)}).then(setIsLoading(false) )
        .catch((error) => {
          console.log(error);
        });

      setName(response.data.name_date);
      setAgenda(response.data.agenda);
      setDate(response.data.date);
      setTime(response.data.time || '10:00');
      setNotes(response.data.notes);
      setObjective(response.data.objective);
      setQuestions(response.data.questions);
      setActionSteps(response.data.action_steps);

      let peopleArray = response.data.people.split(',');
      peopleArray = peopleArray.map(name => name.trim());
      
      let elementsToAdd = [];
      let updatedAttendeeIds =[];
      let updatedAttendees=[];
      for (let i = 0; i < peopleArray.length; i++) {
        let currentElement = peopleArray[i];
        for (let j = 0; j < people.length; j++) {
          let otherElement = people[j].name;

          if (otherElement && otherElement.toLowerCase().includes(currentElement.toLowerCase()) ) {

            if (!attendeeIds.includes(people[j].id)) {
              updatedAttendeeIds.push(people[j].id);
              updatedAttendees.push(people[j]);
            }
            }
        }
      }


      let dupAttendees=[...attendees];
      let dupAttendeeIds=[...attendeeIds];
      dupAttendees.push(...updatedAttendees);
      dupAttendeeIds.push(...updatedAttendeeIds);
      setAttendeeIds(dupAttendeeIds);
      setAttendees(dupAttendees);

      const updatedTypeSync = [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ];
      updatedTypeSync[response.data.meeting_type] = true;
      setTypeSync(updatedTypeSync);
      setType(typeStrings[response.data.meeting_type]);

    }
    
    reader.readAsArrayBuffer(croppedImage);
    toggleScanState();
    setIsLoading(false);
  }


  /*
   * In first scan state (isInFirstScanState is true), display
   * "Scan Meeting From Photo" button. In second scan state
   * (isInFirstScanState is false), show "Process Image" and
   * "Cancel" buttongs.
   */
  const toggleScanState = () => {
    setIsInFirstScanState(!isInFirstScanState);
  }

  const handleBackClick = () => {
    navigate("/schedule");
  };

  const handlePersonAdded = () => {
    // Fetch updated list of people (you may need to modify this based on your actual data fetching logic)
    fetchPeople();
  };

  const toggleNewPersonModal = () => {
    setAddPersonModalOpen(!addPersonModalOpen);
  };

  const handleImageUpload =  async (e) => {
    const file = e.target.files[0];
    console.log("File: ", file); // This will show the selected file

    if (file) {
        setNotesImage(file); // Asynchronously updates notesImage
        console.log("Setting notesImage...", notesImage);

        const reader = new FileReader();
        reader.onload = () => {
            setDisplayImage(reader.result); // Base64 string for preview
        };
        const url = await uploadImage(file); // Upload image and get URL
        setImageUrl(url.data.url);
        reader.readAsDataURL(file);
    }
};


  const clearImage = () => {
    setDisplayImage('');
    setNotesImage(null);
  }

  const openImageModal = () => setImageModalOpen(true);
  const closeImageModal = () => setImageModalOpen(false);

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
              width: '0px',
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
    <div style={{ flex: 1, overflowY: "auto" }}>
      <InvitePeopleModal
        isOpen={isInvitePeopleModalOpen}
        toggle={toggleInvitePeopleModal}
        people={people}
        attendeeIds={attendeeIds}
        invite={invitePerson}
        uninvite={uninvitePerson}
      />

      {/* Add Person Modal */}
      <AddPersonModal
        opened={addPersonModalOpen}
        toggleModal={toggleNewPersonModal}
        fetchPersons={fetchPeople}  // Ensure the list is updated after adding a new person
      />

      <Container className="layout-container" style={{
          maxWidth: "1200px", // Increase this value to widen the container
          width: isSmallScreen ? "auto" : "80%", // Ensures the layout adapts to screen size
          margin: "0 auto", // Centers the container
          padding: "20px", // Adjust padding if needed
          marginLeft: isSidebarOpen ? "150px" : "0px",
        }}>
        <Card className="outer-card" style={{padding:"50px"}}>
        <div style={{ display: "flex", alignItems: isSmallScreen ? "auto" : "center", justifyContent: "space-between", marginBottom: "20px"}}>
        {!isSmallScreen && (
          <Button
            variant="outline"
            color = "#65729e"
            onClick={handleBackClick}
            style={{ marginBottom: "0", marginLeft: isSmallScreen ? "0px" : "auto" }}
          >
            Back
          </Button>
        )}
          <Title order={isSmallScreen ? 2 : 1} ta = "center" flex= "1">
            Meeting Details
          </Title>
        </div>
        {isSmallScreen && (
        <Button
            variant="outline"
            color = "#65729e"
            onClick={handleBackClick}
            style={{ maxWidth: "75px", marginBottom: "0", marginLeft: isSmallScreen ? "0px" : "auto" }}
          >
            Back
          </Button>
          )}
          <Card.Section>
            <Card style={{maxWidth: "100%", position: "relative", padding:"50px"}} className="my-card">
              <Card.Section className="my-card-body">
                <Row style={{left:isSmallScreen ? '0' : '20px', position: "relative", textAlign: "center"}}>
                  <input type="file" hidden ref={imageRef} onChange={onImageChange} />
                  {
                    isInFirstScanState ?
                      <div>
                        <Card ta="center" className="outer-card" style={{ color: customTheme.text,  }}>
                          <Card.Section>
                          <div style={{ marginBottom: '10px' , padding:"10px"}}>
                          {isLoading &&<CircularProgress className="circular-progress" />}
                            <Button
                              variant="filled"
                              color="#6776ab"
                              style={{color:"white"}}
                              onClick={handleScanFromPhotoClick}
                            >
                              Scan From Image
                            </Button>
                            </div>
                            <div>
                            {imageSrc && <img src={imageSrc}  alt="Uploaded" style={{ width: '20%', height: 'auto',cursor: "pointer"}} onClick={handleOpenModal}  />}
                            </div>
                          </Card.Section>
                        </Card>
                        <Modal 
                          opened={modalOpen} 
                          onClose={handleCloseModal}
                          title={<strong>Uploaded Image</strong>}
                          size={'xl'}
                          overlayProps={{
                            backgroundOpacity: 0.55,
                            blur: 3,
                          }}
                        >
                          <img 
                            src={uploadedImageUrl} 
                            alt="Uploaded" 
                            style={{
                              width: "100%",
                              height: "auto",
                              borderRadius: "8px",
                              border: "1px solid #ccc",
                            }}

                          />
                      </Modal>
                      
                      </div>
                      :
                      <div>
                        {!!imageSrc && (
                          <ReactCrop crop={crop} onChange={(crop, percentCrop) => setCrop(percentCrop)} style={{maxWidth: "40%"}}>
                            <img id="img-elem" src={imageSrc} alt="Crop me." />
                          </ReactCrop>
                        )}
                        <Card className="outer-card" style={{ color: customTheme.text}}>
                          <Card.Section style={{padding:"10px"}}>
                            <Button
                              variant="filled"
                              className="my-button"
                              color="#65729e"
                              style={{color:"white",minWidth: "200px",margin:"5px" }}
                              onClick={handleOCRRequest}
                              
                            >
                              Process Image
                            </Button>{" "}
                            <Button
                            variant="filled"
                              className="my-button"
                              color="#65729e"
                              style={{color:"white",minWidth: "200px", margin:"5px" }}
                              onClick={toggleScanState}
                            >
                              Cancel
                            </Button>
                          </Card.Section>
                        </Card>
                      </div>
                  }
                </Row>
              </Card.Section>
            </Card>
            <Form>
              <Card className="my-card" style={{padding:"30px", margin:"10px"}}>
                <Card.Section className="my-card-body">
                  <Row span={{xs:'1', sm:'1', md:'1', lg:'2'}} style={{
                      display: "flex",
                      //justifyContent: "space-between", // Creates space between columns
                      alignItems: "flex-start", // Ensures columns stay aligned at the top
                      gap: "30px", // Adds spacing between columns
                      justifyContent: isSmallScreen? "center": "auto"
                    }}>
                    <Col style={{ width: isSmallScreen? "auto" : "48%" }}> 
                      <FormGroup>
                        <Label className="form-label" for="name" style={{ color: "black", fontSize: "16px", fontFamily: "Arial, sans-serif", fontWeight: "bold"}}>Meeting Name*</Label>
                        <TextInput className="form-input" type="text" name="name" id="name" value={name} onChange={handleNameChange} required />
                        <div id="nameError" class="error-message"></div>
                      </FormGroup>
                      <FormGroup>
                        <Label className="form-label" for="agenda" style={{ color: "black", fontSize: "16px", fontFamily: "Arial, sans-serif", fontWeight: "bold"}}>Agenda*</Label>
                        <Textarea className="form-input" type="textarea" name="agenda" id="agenda" value={agenda} onChange={handleAgendaChange} autosize minRows={6} maxRows={6} required />
                        <div id="agendaError" class="error-message"></div>
                      </FormGroup>
                      <FormGroup>
                        <Label className="form-label" for="date" style={{ color: "black", fontSize: "16px", fontFamily: "Arial, sans-serif", fontWeight: "bold"}}>Date*</Label>
                        <TextInput className="form-input" type="date" name="date" id="date" value={date} onChange={handleDateChange} required />
                        <div id="dateError" class="error-message"></div>
                      </FormGroup>
                      <FormGroup>
                        <Label className="form-label" for="time" style={{ color: "black", fontSize: "16px", fontFamily: "Arial, sans-serif", fontWeight: "bold"}}>Time*</Label>
                        <TextInput className="form-input" type="time" name="time" id="time" value={time} onChange={handleTimeChange} required />
                        <div id="timeError" class="error-message"></div>
                      </FormGroup>
                    </Col>
                    <Col style={{ width: isSmallScreen? "auto" : "48%" }}> 
                      <FormGroup>
                        <Label className="form-label" for="type" style={{ color: "black", fontSize: "16px", fontFamily: "Arial, sans-serif", fontWeight: "bold"}}>Meeting Type*</Label>
                        <Card className="my-card my-border" style={{padding:"30px"}}>
                          <Card.Section>
                            <Row>
                              <Col>
                                <FormGroup check>
                                  <Label check style={{ display: "flex",alignItems:"center"}}>
                                    <Radio
                                    style={{marginRight:"20px"}}
                                      className="my-border"
                                      type="radio"
                                      name="type"
                                      id="type-radio"
                                      value={0}
                                      checked={typeSync[0]}
                                      onChange={handleTypeChange}
                                    />{' '}1 on 1
                                  </Label>
                                </FormGroup>
                                <FormGroup check>
                                  <Label check style={{ display: "flex",alignItems:"center"}}>
                                    <Radio
                                    style={{marginRight:"20px"}}
                                      className="my-border"
                                      type="radio"
                                      name="type"
                                      id="type-radio"
                                      value={1}
                                      checked={typeSync[1]}
                                      onChange={handleTypeChange}
                                    />{' '}
                                    Delegation
                                  </Label>
                                </FormGroup>
                                <FormGroup check>
                                  <Label check style={{ display: "flex",alignItems:"center"}}>
                                    <Radio
                                    style={{marginRight:"20px"}}
                                      className="my-border"
                                      type="radio"
                                      name="type"
                                      id="type-radio"
                                      value={2}
                                      checked={typeSync[2]}
                                      onChange={handleTypeChange}
                                    />{' '}
                                    Leadership Pipeline
                                  </Label>
                                </FormGroup>
                                <FormGroup check>
                                  <Label check style={{ display: "flex",alignItems:"center"}}>
                                    <Radio
                                    style={{marginRight:"20px"}}
                                      className="my-border"
                                      type="radio"
                                      name="type"
                                      id="type-radio"
                                      value={3}
                                      checked={typeSync[3]}
                                      onChange={handleTypeChange}
                                    />{' '}
                                    Personal Growth
                                  </Label>
                                </FormGroup>
                              </Col>
                              <Col>
                                <FormGroup check >
                                  <Label check style={{ display: "flex",alignItems:"center"}}>
                                    <Radio
                                    style={{marginRight:"20px"}}
                                      className="my-border"
                                      type="radio"
                                      name="type"
                                      id="type-radio"
                                      value={4}
                                      checked={typeSync[4]}
                                      onChange={handleTypeChange}
                                    />{' '}
                                    Debrief
                                  </Label>
                                </FormGroup>
                                <FormGroup check>
                                  <Label check style={{ display: "flex",alignItems:"center"}}>
                                    <Radio
                                    style={{marginRight:"20px"}}
                                      className="my-border"
                                      type="radio"
                                      name="type"
                                      id="type-radio"
                                      value={5} checked={typeSync[5]} onChange={handleTypeChange}
                                    />{' '}
                                    Goal Setting
                                  </Label>
                                </FormGroup>
                                <FormGroup check >
                                  <Label check style={{ display: "flex",alignItems:"center"}}>
                                    <Radio
                                    style={{marginRight:"20px"}}
                                      className="my-border"
                                      type="radio"
                                      name="type"
                                      id="type-radio"
                                      value={6}
                                      checked={typeSync[6]}
                                      onChange={handleTypeChange}
                                    />{' '}
                                    Leadership Workshop
                                  </Label>
                                </FormGroup>
                                <FormGroup check>
                                  <Label check style={{ display: "flex"}}>
                                    <Radio
                                    style={{marginRight:"20px"}}
                                      className="my-border"
                                      type="radio"
                                      name="type"
                                      id="type-radio"
                                      value={7}
                                      checked={typeSync[7]}
                                      onChange={handleTypeChange} />{' '}
                                    Problem Solving
                                  </Label>
                                </FormGroup>
                              </Col>
                            </Row>
                          </Card.Section>
                        </Card>
                        <div id="typeError" class="error-message"></div>
                      </FormGroup>
                      <FormGroup>
                        <Label className="form-label" for="objective" style={{ color: "black", fontSize: "16px", fontFamily: "Arial, sans-serif", fontWeight: "bold"}}>Objective*</Label>
                        <Textarea className="form-input" type="textarea" name="objective" id="objective" value={objective} onChange={handleObjective} autosize minRows={3} maxRows={3} required />
                        <div id="objectiveError" class="error-message"></div>
                      </FormGroup>
                      <FormGroup>
                        <Label className="form-label" for="questions" style={{ color: "black", fontSize: "16px", fontFamily: "Arial, sans-serif", fontWeight: "bold"}}>Questions*</Label>
                        <Textarea className="form-input" type="textarea" name="questions" id="questions" value={questions} onChange={handleQuestions} autosize minRows={3} maxRows={3} required/>
                        <div id="questionError" class="error-message"></div>
                      </FormGroup>
                    </Col>
                  </Row>
                </Card.Section>
              </Card>
              <Card className="my-card" style={{padding:"30px", margin:"5px"}} >
                <Card.Section className="my-card-body">
                  <Row>
                    <FormGroup>
                      <Label className="form-label" for="attendees" style={{ color: "black", fontSize: "16px", fontFamily: "Arial, sans-serif", fontWeight: "bold"}}>Invite People</Label>
                      <Row>
                      <MultiSelect
                          data={people.map(person => ({ value: person.id.toString(), label: person.name }))}
                          value={attendeeIds.map(String)}
                          onChange={handleAttendeeChange}
                          searchable
                          placeholder="Select attendees"
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
                          transition="pop-top-left"
                        />
                      </Row>
                    </FormGroup>
                  </Row>
                </Card.Section>
              </Card>
              <Card className="my-card"  style={{padding:"30px", margin:"5px"}}>
                <Card.Section className="my-card-body">
                  <Row span={{xs:'1', sm:'1', md:'1', lg:'2'}}
                  style={{
                    display: "flex",
                    //justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "30px", // Space between columns
                    justifyContent: isSmallScreen? "center": "auto"
                  }}>
                  <Col style={{ width: isSmallScreen? "auto" : "48%" }}> 
                  <FormGroup>
                    {/* <FormGroup style={{width: "50%", position: "relative", left: "25%"}}> */}
                      <Label className="form-label" for="notes" style={{ color: "black", fontSize: "16px", fontFamily: "Arial, sans-serif", fontWeight: "bold"}}>Meeting Notes*</Label>
                      <Textarea
                        id="notes"
                        placeholder="Enter your notes here..."
                        value={notes}
                        onChange={handleNotesChange}
                        autosize
                        minRows={20}
                        maxRows={20}
                      />
                      <div id="noteError" class="error-message"></div>
                      <Col>
                      {/* Image Upload */}
                      <div style={{ marginBottom: '1rem' }}>
                        <label for="image-upload" style={{ color: "black", fontSize: "15px", fontFamily: "Arial, sans-serif", marginTop: "10px", fontWeight: "bold"}}>
                          Upload Picture
                        </label>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: 'block', marginBottom: '1rem' }}
                        />
                      </div>

                      {/* Display Uploaded Image */}
                      {displayImage && (
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Uploaded Image:</div>
                          <img
                            src={displayImage}
                            alt="Uploaded"
                            style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', border: '1px solid #ccc' }}
                            onClick={openImageModal}
                          />
                          <Group position="right" style={{ marginTop: '0.5rem' }}>
                            <Button variant="outline" color="red" size="xs" onClick={clearImage}>
                              Remove Image
                            </Button>
                          </Group>
                        </div>
                        )}
                      </Col>
                      {/* Modal for Enlarged Image View */}
                      <Modal
                        opened={isImageModalOpen}
                        onClose={closeImageModal}
                        title={<strong>Uploaded Notes Image</strong>}
                        size={'xl'}
                        overlayProps={{
                          backgroundOpacity: 0.55,
                          blur: 3,
                        }}
                      >
                        <img
                          src={displayImage}
                          alt="Uploaded Full Screen"
                          style={{
                            width: "100%",
                            height: "auto",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                          }}
                        />
                      </Modal>
                    </FormGroup>
                    </Col>
                    <Col>
                    <FormGroup>
                    {/* <FormGroup style={{width: "50%", position: "relative", left: "25%"}}> */}
                      <Label className="form-label" for="actionSteps" style={{ color: "black", fontSize: "16px", fontFamily: "Arial, sans-serif", fontWeight: "bold"}}>Action steps*</Label>
                      <Textarea className="form-input" type="textarea" name="actionSteps" id="actionSteps" value={actionSteps} onChange={handleActionSteps} autosize minRows={5} maxRows={5} required/>
                    <div id="actionStepsError" class="error-message"></div>
                      
                    </FormGroup>
                    </Col>
                    
                  </Row>
                </Card.Section>
              </Card>

              <Card className="my-card" style={{ padding: "30px", margin: "5px" }}>
              <Card.Section className="my-card-body">
                {/* Header */}
                <Row>
                  <FormGroup>
                    <Label className="form-label" for="tasks" style={{ color: "black", fontSize: "16px", fontFamily: "Arial, sans-serif", fontWeight: "bold"}}>Tasks</Label>
                  </FormGroup>
                </Row>

                {/* Table Header */}
                <Row
                  style={{
                    fontWeight: "bold",
                    fontSize: "14px",
                    textAlign: "center",
                    marginBottom: "10px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "15px", // Gap between columns
                  }}
                >
                  <Col style={{ maxWidth: "4%" }}>Action</Col>
                  <Col className="mantine-visible-from-xl" style={{ maxWidth: "17%" }}>Task Name</Col>
                  <Col className="mantine-visible-from-xl" style={{ maxWidth: "14%" }}>Due Date</Col>
                  <Col className="mantine-visible-from-xl" style={{ maxWidth: "20%" }}>Assign To</Col>
                  <Col className="mantine-visible-from-xl" style={{ maxWidth: "13%"}}>Priority</Col>
                  <Col className="mantine-visible-from-xl" style={{ maxWidth: "23%" }}>Details</Col>
                </Row>

                {/* Task Rows */}
                {meetingTasks.map((task, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      flexWrap: "wrap", // Allow content to wrap when needed
                      gap: "5px",
                      alignItems: "flex-start", // Align items at the start of the row
                      width: "100%", // Ensure full width
                    }}
                  >
                    {/* Action Column */}
                    <div style={{ flex: "1 1 4%" }}>
                      <IconButton>
                      <ClearIcon
                        style={{ color: "red"}} 
                        task={task} 
                        index={meetingTasks.indexOf(task)} 
                        onClick={removeMeetingTask} 
                      />
                      </IconButton>
                    </div>

                    {/* Task Name Column */}
                    <div style={{ flex: "1 1 17%" }}>
                      <FormGroup>
                        <TextInput
                          className="form-input"
                          type="text"
                          placeholder="Task Name"
                          value={task.task_name || ""}
                          onChange={(e) => handleMeetingTasksChange(index, "task_name", e.target.value)}
                        />
                      </FormGroup>
                    </div>

                    {/* Due Date Column */}
                    <div style={{ flex: "1 1 14%" }}>
                      <FormGroup>
                        <TextInput
                          className="form-input"
                          type="date"
                          value={task.end_date || ""}
                          onChange={(e) => handleMeetingTasksChange(index, "end_date", e.target.value)}
                        />
                      </FormGroup>
                    </div>

                    {/* Assign To Column */}
                    <div style={{ flex: "1 1 21%" }}>
                      <FormGroup>
                      <MultiSelect
                        data={(people || []).map((person) => ({
                          value: person.id?.toString(),
                          label: person.name || "Unnamed Person",
                        }))}
                        value={(task.employees || []).map(String)}
                        onChange={(selectedValues) =>
                          handleMeetingTasksChange(index, "employees", selectedValues)
                        }
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
                        transition="pop-top-left"
                        style={{ width: "100%" }}
                      />

                      </FormGroup>
                    </div>

                    {/* Priority Column */}
                    <div style={{ flex: "1 1 14%" }}>
                      <FormGroup>

                        <Select
                          className="form-input"
                          placeholder="Priority"
                          value={task.priority || ""}
                          onChange={(value) => handleMeetingTasksChange(index, "priority", value)}
                          data={[
                            { value: "low", label: "Low" },
                            { value: "medium", label: "Medium" },
                            { value: "high", label: "High" },
                          ]}
                          styles={{
                            dropdown: {
                              zIndex: 5, // Ensure it appears above other elements
                            },
                          }}
                        />
                      </FormGroup>
                    </div>

                    {/* Details Column */}
                    <div style={{ flex: "1 1 24%", minHeight: "40px" }}>
                      <FormGroup>
                        <Textarea
                          className="form-input"
                          type="text"
                          placeholder="Details"
                          value={task.task_description || ""}
                          onChange={(e) => handleMeetingTasksChange(index, "task_description", e.target.value)}
                          autosize
                          minRows={3}
                          maxRows={3}
                        />
                      </FormGroup>
                    </div>
                  </div>
                ))}

                {/* Add Task Button */}
                <Row
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "20px",
                    marginBottom: "20px",
                  }}
                >
                  <Button variant = "outline" color = "#65729e" onClick={addMeetingTask}>New Task</Button>
                </Row>
              </Card.Section>
            </Card>



            </Form>
            <Card style={{maxWidth: "90%", position: "relative",padding:"30px",margin:"auto"}} className="my-card">
              <Card.Section className="my-card-body">
                <Row style={{ width: "70%", position: "relative",  textAlign: "center",margin:"auto"}}>
                  <div>
                    <Card className="outer-card" style={{ color: customTheme.text }}>
                      <Card.Section style={{padding:"5px"}}>
                       { !isSuperUser() && <Button
                          variant="filled"
                          className="my-button"
                          color="#65729e"
                          style={{ margin:"3px" }}
                          type="submit"
                          onClick={handleSubmit}
                          
                        > 
                          Save and Notify
                        </Button>}
                        <Button
                        variant="filled"
                          className="my-button"
                          color="#65729e"
                          style={{ margin:"3px" }}
                          onClick={handleClearForm}
                        >
                          Clear
                        </Button>
                      </Card.Section>
                    </Card>
                  </div>
                </Row>
              </Card.Section>
            </Card>
          </Card.Section>
        </Card>
      </Container>
    </div>
    </div>
    </div>
  );
};

export default Meeting;
