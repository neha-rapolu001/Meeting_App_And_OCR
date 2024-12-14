/**
 * This component is the invite people modal of the application.
 *
 * @params: {props}
 *
 *
 */
import {
  React,
  useState,
  useEffect
} from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Col,
  Card,
  CardBody
} from "reactstrap";
import NameCard from "../../layouts/schedule/meeting/components/NameCard";

const InvitePeopleModal = (props) => {

  useEffect(() => {
    if (props.isOpen) {
      console.log(props.people);
    }
  }, [props.isOpen]);

  return (
    <Modal isOpen={props.isOpen} toggle={props.toggle}>
      <ModalHeader>
        Invite People
      </ModalHeader>
      <ModalBody>
        <Card className="my-card">
          <CardBody>
            <Row>
              {
                props.people.map(
                  (person) => (
                    <Col key={person.id} xs={12} md={6} lg={6}>
                      <NameCard
                        person={person}
                        invite={props.invite}
                        uninvite={props.uninvite}
                        attendeeIds={props.attendeeIds}
                      />
                    </Col>
                  )
                )
              }
            </Row>
          </CardBody>
        </Card>
      </ModalBody>
      <ModalFooter>
        <Button color="success" onClick={props.toggle}>
          Done
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default InvitePeopleModal;

