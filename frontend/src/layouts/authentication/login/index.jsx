import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Container,
  Row,
  Col,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { login, getCookie, updateCookie as setcookie } from "../../../api";
import "bootstrap/dist/css/bootstrap.min.css";

function Login(props) {
  const customTheme = {
    primary: "#FFE658",
    secondary: "#2E2E2E",
    text: "#000",
  };

  useEffect(() => {
    if (getCookie("user") == null && getCookie("priv") == null) {
      setcookie("user", "");
      setcookie("priv", "");
    }

    console.log(document.cookie);
    if (getCookie("user") !== "" && getCookie("priv") !== "") {
      console.log("not here");
      navigate("/dashboard");
    }
  }, []);

  const navigate = useNavigate();
  const handleSignUp = () => {
    navigate("/pricing_plan");
  };

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    priv: null, // Initialize priv state
    errors: {
      username: "",
      password: "",
      invalid: ""
    },
  });

  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
      errors: {
        ...prevState.errors,
        [name]: "",
      },
    }));
  };

  const validateForm = () => {
    const { username, password } = formData;
    const errors = {};

    // Check for errors and update the errors object accordingly
    if (!username) {
      errors.username = "Username is required.";
    }

    if (!password) {
      errors.password = "Password is required.";
    }

    return errors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({
        ...prevState,
        errors: { ...errors },
      }));
      return;
    }

    login(formData)
      .then((response) => {
        console.log(response.data);
        // Update formData state with priv value from response
        setFormData((prevState) => ({
          ...prevState,
          priv: response.data.priv,
        }));

        document.cookie = "user=" + response.data.user;
        document.cookie = "priv=" + response.data.priv;
        document.cookie = "church=" + response.data.church;
        document.cookie = "user-id=" + response.data.user_id;
        console.log(document.cookie, "cokkiesss");
        console.log(response.data);
        navigate("/dashboard");
      })
      .catch((error) => {
        const errors = {};
        errors.invalid = error.response.data.message;
        setFormData((prevState) => ({
          ...prevState,
          errors: { ...errors },
        }));
        setError(error.response.data.message);
        console.log(formData.errors.invalid);
      });
  };

  return (
    <div className="center-fullscreen" >
      <Container>
        <Row>
          <Col sm={{ size: 6, offset: 3 }}>
            <Card className="my-card" style={{ backgroundColor: customTheme.primary, border: `1px solid ${customTheme.text}` }}>
              <CardBody className="my-card-body">
                <Form>
                  <Card className="my-card" style={{ backgroundColor: customTheme.secondary, border: `1px solid ${customTheme.text}` }}>
                    <CardBody className="my-card-body">
                      {formData.errors.invalid && <div className="form-error" style={{ color: customTheme.text }}>{formData.errors.invalid}</div>}
                      <FormGroup>
                        <Label for="username" className="form-label" style={{ color: customTheme.text }}>
                          Username
                        </Label>
                        <Input
                          type="text"
                          className="form-input"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          placeholder="Enter your username"
                          style={{ backgroundColor: customTheme.primary, borderColor: formData.errors.username ? 'red' : customTheme.text }}
                        />
                        {formData.errors.username && <div className="invalid-feedback" style={{ color: 'red' }}>{formData.errors.username}</div>}
                      </FormGroup>
                      <FormGroup>
                        <Label for="password" className="form-label" style={{ color: customTheme.text }}>
                          Password
                        </Label>
                        <Input
                          type="password"
                          className="form-input"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter your password"
                          style={{ backgroundColor: customTheme.primary, borderColor: formData.errors.password ? 'red' : customTheme.text }}
                        />
                        {formData.errors.password && <div className="invalid-feedback" style={{ color: 'red' }}>{formData.errors.password}</div>}
                        <div className="text-right mt-2">
                          <a className="link-text" href="/forgot-password" style={{ color: customTheme.text }}>
                            Forgot password?
                          </a>
                        </div>
                      </FormGroup>
                    </CardBody>
                  </Card>
                </Form>
                <Row>
                  <div>
                    <Card className="outer-card" style={{ backgroundColor: customTheme.primary, border: `1px solid ${customTheme.text}` }}>
                      <CardBody>
                        <Button className="my-button" color="success" onClick={handleSubmit} style={{ backgroundColor: customTheme.primary, color: customTheme.text }}>
                          Sign In
                        </Button>{" "}
                        <Button className="my-button" color="success" onClick={handleSignUp} style={{ backgroundColor: customTheme.primary, color: customTheme.text }}>
                          Subscribe
                        </Button>
                      </CardBody>
                    </Card>
                  </div>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;
