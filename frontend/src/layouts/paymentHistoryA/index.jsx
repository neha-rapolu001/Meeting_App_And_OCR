import React, { useEffect, useState } from "react";
import { Container, Card, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import { get_all_payments, getCookie, get_payment_card_details, update_payment } from '../../../src/api'; // Assuming you have API functions to update payment method and get payment card details
import AppSidebar from "../../components/appSidebar";
import { useNavigate } from 'react-router-dom';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const PaymentHistory = () => {
  const history = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [showCardDetailsModal, setShowCardDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showCreatePaymentForm, setShowCreatePaymentForm] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    email: getCookie('user'),
    church: getCookie('church')
  });
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    get_all_payments()
      .then((response) => {
        console.log(response.data.payments);
        const sortedPayments = response.data.payments.sort((a, b) => new Date(b.date) - new Date(a.date));
        const filteredPayments = sortedPayments.filter(payment => parseInt(payment.church_id) === parseInt(getCookie('church')));
        setPayments(filteredPayments);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching payments:', error);
      });
  }, []);

  const toggleCardDetailsModal = () => {
    setShowCardDetailsModal(!showCardDetailsModal);
  };

  const toggleCreatePaymentForm = () => {
    setShowCreatePaymentForm(!showCreatePaymentForm);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails({ ...cardDetails, [name]: value });
  };

  const handleCreatePayment = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    if (error) {
      console.error('Error creating payment method:', error);
    } else {
      console.log('PaymentMethod', paymentMethod);
      updateCard(paymentMethod.id, cardDetails.email, cardDetails.church);
      setShowCreatePaymentForm(false);
    }
  };

  const updateCard = (paymentMethodId, email, church) => {
    const cardDetails = { payment_method: paymentMethodId, email, church };
    update_payment(cardDetails)
      .then((response) => {
        console.log("Payment method updated successfully:", response);
        history('/paymenthistorya');
      })
      .catch((error) => {
        console.error('Error updating payment method:', error);
      });
  };

  const formatDateTime = (dateTimeString) => {
    const optionsDate = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    const optionsTime = {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    };
    const formattedDate = new Date(dateTimeString).toLocaleString(undefined, optionsDate);
    const formattedTime = new Date(dateTimeString).toLocaleString(undefined, optionsTime);
    return [formattedDate, formattedTime];
  };

  const handlePaymentSelect = (payment) => {
    get_payment_card_details({ payment_id: payment.payment_id })
      .then((response) => {
        console.log('Card details:', response.data.cardDetails);
        setSelectedPayment({ ...payment, cardDetails: response.data.cardDetails });
        toggleCardDetailsModal();
      })
      .catch((error) => {
        console.error('Error fetching card details:', error);
      });
  };

  return (
    <div style={{ display: "flex" }}>
      <AppSidebar />
      <Container className="my-4" style={{marginLeft:"12%"}}>
        <Card className="my-card schedule-card">
          <div className="full-screen-calendar">
            {isLoading && <p>Loading...</p>}
            {!isLoading && payments.length === 0 && <p>No payments found.</p>}
            {!isLoading && payments.length > 0 && (
              <div>
                <h3>Payment History</h3>
                <br></br>
                <Button color="primary" onClick={toggleCreatePaymentForm}>Update Payment Method</Button>
                <br></br>
                <br></br>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ width: "10%" }}>Transaction ID</th>
                      <th style={{ width: "15%" }}>Church Name</th>
                      <th style={{ width: "15%" }}>Email</th>
                      <th style={{ width: "15%" }}>Date</th>
                      <th style={{ width: "15%" }}>Amount</th>
                      <th style={{ width: "10%" }}>Transaction Status</th>
                      <th style={{ width: "20%" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, index) => (
                      <tr key={index}>
                        <td>{payment.transaction_id}</td>
                        <td>{payment.church_name}</td>
                        <td>{payment.email}</td>
                        <td>{formatDateTime(payment.date)}</td>
                        <td>{'$' + payment.amount}</td>
                        <td>{payment.is_success ? 'Success' : 'Failed'}</td>
                        <td>
                          <Button color="primary" onClick={() => handlePaymentSelect(payment)}>Show Card Details</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </Container>

      <Modal isOpen={showCreatePaymentForm} toggle={toggleCreatePaymentForm}>
        <ModalHeader toggle={toggleCreatePaymentForm}>Update Payment Method</ModalHeader>
        <ModalBody>
          <Form onSubmit={handleCreatePayment}>
            <FormGroup>
              <Label for="card_number">Card Details:</Label>
              <CardElement id="card_number" options={{ style: { base: { fontSize: '16px' } } }} />
            </FormGroup>
            <Button type="submit" color="primary">Update Payment Method</Button>
          </Form>
        </ModalBody>
      </Modal>

      <Modal isOpen={showCardDetailsModal} toggle={toggleCardDetailsModal}>
        <ModalHeader toggle={toggleCardDetailsModal}>Card Details</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>Card Type</Label>
              <Input type="text" value={selectedPayment ? selectedPayment.cardDetails.brand : ''} readOnly />
            </FormGroup>
            <FormGroup>
              <Label>Last 4 Digits</Label>
              <Input type="text" value={selectedPayment ? "**** **** **** " + selectedPayment.cardDetails.last4 : ''} readOnly />
            </FormGroup>
            <FormGroup>
              <Label>Expiration Date</Label>
              <Input type="text" value={selectedPayment ? `${selectedPayment.cardDetails.exp_month}/${selectedPayment.cardDetails.exp_year}` : ''} readOnly />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleCardDetailsModal}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default PaymentHistory;
