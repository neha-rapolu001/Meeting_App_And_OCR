/**
 * NameCard component rendered by InvitePeopleModal.
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
  Card,
  CardBody
} from "reactstrap";

const NameCard = (props) => {
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    setIsSelected(props.attendeeIds.includes(props.person.id));
  }, []);

  const toggleIsSelected = () => {
    setIsSelected(!isSelected);
  }

  const handleClick = () => {
    if (isSelected) {
      props.uninvite(props.person);
    } else {
      props.invite(props.person);
    }
    toggleIsSelected();
  }

  return (
    <Card
      className={`${isSelected ? "my-card-selected" : "my-card"}`}
      style={{cursor: "pointer", marginBottom: "10px"}}
      onClick={handleClick}
    >
      <CardBody style={{textAlign: "center"}}>
        {props.person.name}
      </CardBody>
    </Card>
  );
}

export default NameCard;

