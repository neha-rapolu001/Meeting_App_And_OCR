import React, { useState } from "react";
import {
  Button,
  TextInput,
  Container,
  Title,
  Box,
  Text,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from '@mantine/hooks';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const isSmallScreen = useMediaQuery('(max-width: 1068px)');

  const handleChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Add functionality for sending a reset email
    console.log("Sending password reset email to:", email);
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
          width: isSmallScreen ? 400 : 500,
          height: isSmallScreen ? 500 : 600,
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
          Forgot Password
        </Title>
        <Text size="sm" color="dimmed" mb="xl">
          Enter your email address below, and we'll send you instructions to reset your password.
        </Text>
        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 300 }}>
          <TextInput
            label="Email"
            placeholder="Enter your email"
            name="email"
            value={email}
            onChange={handleChange}
            required
            styles={{
              label: { color: "#333" },
            }}
          />
          <Button
            type="submit"
            fullWidth
            style={{
              borderRadius: "25px",
              backgroundColor: "#00aaff",
              marginTop: 20,
              padding: "5px 0",
            }}
          >
            Send Email
          </Button>
          <Text
            component="a"
            href="/"
            size="sm"
            style={{
              display: "block",
              marginTop: "15px",
              color: "#1d8cf8",
              textDecoration: "none",
            }}
          >
            Back to login
          </Text>
        </form>
      </Box>
    </Container>
  );
}

export default ForgotPassword;
