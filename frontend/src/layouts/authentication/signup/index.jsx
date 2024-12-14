import React, { useState, useEffect } from 'react';
import { 
    Button, 
    Container, 
    Paper, 
    Title, 
    Divider, 
    TextInput, 
    Select, 
    Group, 
    Modal, 
    Box, 
    Text,
    Checkbox
} from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';
import { signup, addChurch as create_church, get_subscriptions, chargeCard, login, check_church_exists, logout, check_email_exists } from '../../../api';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useMediaQuery } from '@mantine/hooks';

const Signup = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const navigate = useNavigate();
    const { state } = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [signupMessage, setSignupMessage] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const stripe = useStripe();
    const elements = useElements();
    const [selectedSubscription, setSelectedSubscription] = useState();
    const [hasExistingSubscription, setHasExistingSubscription] = useState(null);
    const [churchError, setChurchError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showThankYouModal, setShowThankYouModal] = useState(false);
    const isSmallScreen = useMediaQuery('(max-width: 1068px)');


    useEffect(() => {
        get_subscriptions()
            .then(response => {
                setSubscriptions(response.data);
            })
            .catch(error => console.error('Error fetching subscriptions:', error));
    }, []);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        churchName: '',
        address: '',
        ph_no: '',
        churchEmail: '',
        website: '',
        user_type: '2',
        subscription: String(state.id),
        church: 'new',
    });

    const handleChange = event => {
        const { name, value } = event.target;
        if (name === 'ph_no') {
          const cleanedValue = value.replace(/[\s-]/g, '');
          setFormData(prevState => ({
              ...prevState,
              [name]: cleanedValue,
          }));
      } else {
          setFormData(prevState => ({
              ...prevState,
              [name]: value,
          }));
      }
    };

    useEffect(() => {
      const checkEmailExistence = async () => {
        if (formData.email) {
            try {
                const emailExists = await check_email_exists(formData);
                if (emailExists.data.exists) {  // Ensure you're checking the correct property
                    setEmailError("This email is already taken. Please try another one.");
                } else {
                    setEmailError('');
                }
            } catch (error) {
                console.error('Error checking email existence:', error);
                setEmailError("Error checking email. Please try again later.");
            }
        }
    };
  
      checkEmailExistence();
  }, [formData.email]);

  useEffect(() => {
    const checkChurchExistence = async () => {
      if (formData.churchName) {
          try {
              const churchExists = await check_church_exists(formData);
              if (churchExists.data.exists) {  // Ensure you're checking the correct property
                  setChurchError("This church name is already taken. Please try another one.");
              } else {
                  setChurchError('');
              }
          } catch (error) {
              console.error('Error checking church existence:', error);
              setEmailError("Error checking church. Please try again later.");
          }
      }
  };
    checkChurchExistence();
  }, [formData.churchName]);


    const handleSubscriptionChange = event => {
        const subscriptionId = event.target.value;
        setSelectedSubscription(subscriptions.find(sub => String(sub.id) === subscriptionId));
        setFormData(prevState => ({
            ...prevState,
            subscription: subscriptionId,
        }));
    };


  const handleSubmit = async event => {
    event.preventDefault();
    
    if (churchError) {
      setErrorMessage("Please resolve the church name issue before proceeding.");
        return;
    }

    if (emailError) {
      setErrorMessage("Please resolve the email issue before proceeding.");
      return;
  }
    
    setShowPaymentModal(true);
  };

    const handlePaymentSuccess = async () => {
      setIsLoading(true);
  
      try {
          const cardElement = elements.getElement(CardElement);
  
          if (!stripe || !cardElement) {
              throw new Error('Stripe.js has not loaded properly.');
          }
          
            const { paymentMethod, error } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });
    
            if (error) {
                throw new Error(error.message);
            }
  
          const selectedSub = subscriptions.find(sub => String(sub.id) === formData.subscription);
          if (!selectedSub) {
              throw new Error('Selected subscription not found.');
          }
  
          const payment_data = await chargeCard({
              payment_method: paymentMethod.id,
              amount: selectedSub.price,
              church_id: formData.church,
              subscription_id: formData.subscription,
              email: formData.email,
          });
          console.log(payment_data.data)

          let churchId;
          if (formData.church === 'new') {
              const newChurchData = await create_church({
                  name: formData.churchName,
                  address: formData.address,
                  ph_no: formData.ph_no,
                  email: formData.churchEmail,
                  website: formData.website,
                  subscription: formData.subscription,
                  payment_id : payment_data.data.payment_id
              });
              console.log(newChurchData); // Check if the ID is in the response
              churchId = newChurchData.data.id;
              console.log('Response after church creation:', newChurchData);

              //console.log(churchId)
          } else {
              churchId = formData.church;
          }
          console.log(churchId)

          //console.log(payment_data); // Log the entire response


          const userData = {
              first_name: formData.first_name,
              last_name: formData.last_name,
              email: formData.email,
              password: formData.password,
              church: churchId,
              subscription: formData.subscription,
              user_type: formData.user_type,
          };
          await signup(userData);
          setShowThankYouModal(true);
          /*
          await login({ username: formData.email, password: formData.password }).then(response => {
            console.log(response.data)
            document.cookie="user="+response.data.user;
            document.cookie="priv="+response.data.priv;
            document.cookie="church="+response.data.church;
            document.cookie="user-id="+response.data.user_id;
            console.log(document.cookie,"cokkiesss");
            console.log(response.data);
            })
            */
      } catch (error) {
          console.log(error);
          alert(error.message);
          setIsLoading(false);
          setShowPaymentModal(false);
      }
  };

  return (
    <Container
      style={{
        minWidth: "100vw",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #8490bd, #dae0f7)",
        position: "relative",
        overflow: "hidden",
      }}
    >
        {/* Background overlay circles */}
        <>
      {!isSmallScreen && (
        <>
      <div style={{
        position: "absolute",
        top: "10%",
        left: "10%",
        width: 500,
        height: 500,
        background: "#dadeed",
        borderRadius: "50%",
        zIndex: 1
      }} />
      <div style={{
        position: "absolute",
        bottom: "10%",
        right: "20%",
        width: 300,
        height: 300,
        background: "#dadeed",
        borderRadius: "50%",
        zIndex: 1
      }} />
      </>
      )}
      </>
      <Box
        style={{
          width: isSmallScreen ? 500 : 700,
          height: isSmallScreen ? 1300 : 1200,
          padding: 40,
          background: "white",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
          borderRadius: "45%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          zIndex: 2,
        }}
      >
        <Title order={2} style={{ color: "#333", marginBottom: 20 }}>
          Sign Up
        </Title>
        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 300 }}>
          <TextInput
            label="First Name"
            placeholder="Enter your first name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            styles={{
                label: { color: "#333" },
            }}
            required
          />
          <TextInput
            label="Last Name"
            placeholder="Enter your last name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            style={{ marginTop: 10 }}
            styles={{
                label: { color: "#333" },
            }}
            required
          />
          <TextInput
            label="Email"
            placeholder="Enter your email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ marginTop: 10 }}
            styles={{
                label: { color: "#333" },
            }}
            required
            //error={emailError && <Text color="red">{emailError}</Text>}
            error={emailError ? emailError : null} // Conditionally show error
          />
          <TextInput
            label="Password"
            placeholder="Enter your password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            style={{ marginTop: 10 }}
            styles={{
                label: { color: "#333" },
            }}
            required
          />
          <Select
            label="Subscription"
            placeholder="Choose a plan"
            data={subscriptions.map((sub) => ({ value: String(sub.id), label: sub.name }))}
            value={String(formData.subscription)}
            onChange={(value) => setFormData({ ...formData, subscription: value })}
            style={{ marginTop: 10 }}
            styles={{
                option: { color: "#333" },
                label: { color: "#333" }
            }}
            required
          />
          <TextInput
            label="Church Name"
            placeholder="Enter Church Name"
            name="churchName"
            value={formData.churchName}
            onChange={handleChange}
            style={{ marginTop: 10 }}
            styles={{
                label: { color: "#333" },
            }}
            required
            error={churchError ? churchError : null}
          />
          <TextInput
            label="Address"
            placeholder="Enter your address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            style={{ marginTop: 10 }}
            styles={{
                label: { color: "#333" },
            }}
            required
          />    
          <TextInput
            label="Phone Number"
            placeholder="Enter your phone number"
            name="ph_no"
            value={formData.ph_no}
            onChange={handleChange}
            style={{ marginTop: 10 }}
            styles={{
                label: { color: "#333" },
            }}
            required
          />
          <TextInput
            label="Church Email"
            placeholder="Enter church email address"
            name="churchEmail"
            value={formData.churchEmail}
            onChange={handleChange}
            style={{ marginTop: 10 }}
            styles={{
                label: { color: "#333" },
            }}
          />
          <TextInput
            label="Website"
            placeholder="Enter church website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            style={{ marginTop: 10 }}
            styles={{
                label: { color: "#333" },
            }}
          />

          <Button
            type="submit"
            fullWidth
            disabled={isLoading}
            style={{
              borderRadius: "25px",
              backgroundColor: "#00aaff",
              marginTop: 20,
            }}
          >
            Sign Up
          </Button>
          <Button
            variant='outline'
            onClick={() => navigate("/")}
            fullWidth
            color="gray"
            style={{
              borderRadius: "25px",
              marginTop: 10,
            }}
          >
            Back to Login
          </Button>
        </form>
      </Box>
      <Modal opened={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Payment" styles={{ title: { color: '#333'} }} >
          {subscriptions.length > 0 && (
              <Text style={{ marginBottom: '10px' , color: "#333" }}>
                  Subscription Amount: ${subscriptions.find(sub => sub.id === parseInt(formData.subscription))?.price}
              </Text>
          )}
          <CardElement style={{ width: "100%" }} />
          <Group position="center" style={{ marginTop: '20px' }}>
              <Button onClick={handlePaymentSuccess} loading={isLoading}>Pay</Button>
              <Button onClick={() => setShowPaymentModal(false)}>Cancel</Button>
          </Group>
      </Modal>
      <Modal
        opened={showThankYouModal}
        onClose={() => {
          setShowThankYouModal(false);
          navigate("/"); // Navigate to the dashboard
        }}
        title="Thank You"
      >
        <Text style={{ marginBottom: '20px' }}>Thank you for signing up! Your subscription is now active.</Text>
        <Group position="center">
          <Button onClick={() => navigate("/")}>Go to Login</Button>
        </Group>
      </Modal>
    </Container>
    
);
};

export default Signup;