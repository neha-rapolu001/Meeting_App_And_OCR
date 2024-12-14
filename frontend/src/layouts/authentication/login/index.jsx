import React, { useState, useEffect } from "react";
import { Button, TextInput, PasswordInput, Container, Title, Text, Box } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { login, getCookie, updateCookie as setcookie } from "../../../api";
import { useMediaQuery } from '@mantine/hooks';

function Login() {
  const isSmallScreen = useMediaQuery('(max-width: 1068px)');
  
  useEffect(() => {
    if (getCookie("user") == null && getCookie("priv") == null) {
      setcookie("user", "");
      setcookie("priv", "");
    }
    if (getCookie("user") !== "" && getCookie("priv") !== "") {
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
      errors: { ...prevState.errors, [name]: "" },
    }));
  };

  const validateForm = () => {
    const { username, password } = formData;
    const errors = {};
    if (!formData.username) errors.username = "Username is required.";
    if (!formData.password) errors.password = "Password is required.";
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors }));
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
        document.cookie = "first_name=" + response.data.first_name;
        console.log(document.cookie, "cokkiesss");
        console.log(response.data);
        navigate("/dashboard");
      })
      .catch((error) => {
        const errors = {};
        if (error.response.status === 403) {
          errors.invalid = "Your account is inactive or deleted.";
        } else {
          errors.invalid = error.response.data.message;
        }
        setFormData((prevState) => ({
          ...prevState,
          errors: { ...errors },
        }));
        setError(error.response.data.message);
        console.log(formData.errors.invalid);
      });
  };

  return (
    <Container
      style={{
        minWidth: "100vw",
        height: "100vh",
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
            width: isSmallScreen ? 500 : 600,
            height: isSmallScreen ? 600 : 850,
            padding: 40,
            background: "white",
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
            borderRadius: "50%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            zIndex: 2,
            position: "relative",
        }}
      >
        <Title order={2} style={{ color: "#333", marginBottom: 20 }}>
          Login
        </Title>
        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 300 }}>
          <TextInput
            label="Username"
            placeholder="Enter your username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={formData.errors.username}
            styles={{
                label: { color: "#333" }, // Setting label color to a darker shade
            }}
          />
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={formData.errors.password}
            style={{ marginTop: 10 }}
            styles={{
                label: { color: "#333" }, // Setting label color to a darker shade
            }}
          />
          <Text
            component="a"
            href="/forgot-password"
            size="sm"
            style={{
              display: "block",
              marginTop: "10px",
              color: "#1d8cf8",
              textDecoration: "none",
              textAlign: "right",
            }}
          >
            Forgot password?
          </Text>
          {error && (
            <Text color="red" size="sm" mt="sm">
              {formData.errors.invalid}
            </Text>
          )}
          <Button
            type="submit"
            fullWidth
            style={{
              borderRadius: "25px",
              backgroundColor: "#00aaff",
              marginTop: 20,
            }}
          >
            Login
          </Button>
          <Button
            onClick={handleSignUp}
            fullWidth
            style={{
              borderRadius: "25px",
              backgroundColor: "#ffaa00",
              marginTop: 10,
            }}
          >
            Subscribe
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default Login;
