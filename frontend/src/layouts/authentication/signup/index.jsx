import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Form, FormGroup, Label, Input, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { signup, addChurch as create_church, get_subscriptions, chargeCard, login } from '../../../api';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';

const Signup = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const history = useNavigate();
    const { state } = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [signupMessage, setSignupMessage] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const stripe = useStripe();
    const elements = useElements();
    const [selectedSubscription, setSelectedSubscription] = useState();

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
        subscription: state.id,
        church: 'new',
    });

    const handleChange = event => {
        const { name, value } = event.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubscriptionChange = event => {
        const subscriptionId = event.target.value;
        setSelectedSubscription(subscriptions.find(sub => sub.id === subscriptionId));
        setFormData(prevState => ({
            ...prevState,
            subscription: subscriptionId,
        }));
    };

    const handleSubmit = async event => {
        event.preventDefault();
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
  
          const selectedSub = subscriptions.find(sub => sub.id === formData.subscription);
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
          alert("Payment Successful!!. Redirecting to login...");

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
                  churchId = newChurchData.data.id;
              } else {
                  churchId = formData.church;
              }
  
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

              await login({ username: formData.email, password: formData.password }).then(response => {
                console.log(response.data)
                document.cookie="user="+response.data.user;
                document.cookie="priv="+response.data.priv;
                document.cookie="church="+response.data.church;
               document.cookie="user-id="+response.data.user_id;
                console.log(document.cookie,"cokkiesss");
                console.log(response.data);
                history('/dashboard');
                })
      } catch (error) {
          console.log(error);
          alert(error);
          setIsLoading(false);
          setShowPaymentModal(false);
      }
  };

    return (
        <div className="center-fullscreen">
            <Card className="vertical-card">
                <CardBody>
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label for="first_name">First name*</Label>
                            <Input
                                type="text"
                                id="first_name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="last_name">Last name*</Label>
                            <Input
                                type="text"
                                id="last_name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="email">Email*</Label>
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="password">Password*</Label>
                            <Input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="subscription">Subscription*</Label>
                            <Input
                                type="select"
                                id="subscription"
                                name="subscription"
                                value={formData.subscription}
                                onChange={handleSubscriptionChange}
                                required
                            >
                                <option value="">Select Subscription</option>
                                {subscriptions.map(subscription => (
                                    <option key={subscription.id} value={subscription.id}>
                                        {subscription.name}
                                    </option>
                                ))}
                            </Input>
                        </FormGroup>
                        <FormGroup>
                            <Label for="churchName">Church Name*</Label>
                            <Input
                                type="text"
                                id="churchName"
                                name="churchName"
                                value={formData.churchName}
                                onChange={handleChange}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="address">Address*</Label>
                            <Input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="ph_no">Phone Number*</Label>
                            <Input
                                type="text"
                                id="ph_no"
                                name="ph_no"
                                value={formData.ph_no}
                                onChange={handleChange}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="churchEmail">Church Email</Label>
                            <Input
                                type="email"
                                id="churchEmail"
                                name="churchEmail"
                                value={formData.churchEmail}
                                onChange={handleChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="website">Website</Label>
                            <Input
                                type="text"
                                id="website"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                            />
                        </FormGroup>
                        <div className="d-flex justify-content-between">
                            <Button type="submit" color="success" disabled={isLoading}>
                                Sign up
                            </Button>
                            <Button className="link-text" color="danger" onClick={() => window.location.href = '/Pricing_plan'}>
                                Back
                            </Button>
                        </div>
                    </Form>
                    {isSubmitted && <p>{signupMessage}</p>}
                </CardBody>
            </Card>
            <Modal isOpen={showPaymentModal} toggle={() => setShowPaymentModal(false)}>
                <ModalHeader toggle={() => setShowPaymentModal(false)}>Payment</ModalHeader>
                <ModalBody>
                    {subscriptions.length > 0 && <FormGroup>
                        <Label for="subscriptionAmount">Subscription Amount</Label>
                        <Input
                            type="text"
                            id="subscriptionAmount"
                            name="subscriptionAmount"
                            value={"$" + subscriptions.find(sub => sub.id === parseInt(formData.subscription))?.price}
                            disabled
                        />
                    </FormGroup>}
                    <FormGroup>
                        <Label>Card details</Label>
                        <CardElement />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handlePaymentSuccess}>Pay</Button>{' '}
                    <Button color="secondary" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default Signup;
