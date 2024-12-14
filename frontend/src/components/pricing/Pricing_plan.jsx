import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { get_subscriptions } from "../../api";
import { Container, Box, Card, Title, Text, Button, Group } from "@mantine/core";
import { useMediaQuery } from '@mantine/hooks';

const Pricing_plan = () => {
  const [plans, setPlans] = useState([]);
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery('(max-width: 1068px)');

  useEffect(() => {
    get_subscriptions()
      .then((response) => {
        setPlans(response.data);
      })
      .catch((error) => {
        console.error("Failed to fetch plans:", error);
      });
  }, []);

  const handleNavigate = (plan) => {
    navigate("/signup", { state: plan });
  };

  const handleGoBack = () => {
    navigate("/");
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
        overflow: "auto",
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
          width: isSmallScreen ? 400 : 800,
          padding: 40,
          background: "white",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
          borderRadius: isSmallScreen ? "35%" : "45%",
          textAlign: "center",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <Title order={2} style={{ color: "#333", marginBottom: 30 }}>
          Choose Your Plan
        </Title>
        {/* Correct column layout for all plans */}
        <Group direction="column" spacing="lg" align="center" justify="center" style={{ width: "100%" }}>
          {plans.map((plan) => (
            <Card
              key={plan.id}
              shadow="md"
              padding="lg"
              radius="md"
              style={{
                width: "100%",
                maxWidth: isSmallScreen ? 200 : 500,
                maxHeight: isSmallScreen ? 250 : 500,
                textAlign: "center",
                backgroundColor: "#edf1fc",
              }}
            >
              <Title order={3} style={{ marginBottom: 10 }}>
                {plan.name}
              </Title>
              <Text size="xl" weight={700} color="blue" style={{ margin: "10px 0" }}>
                ${plan.price}
                <span style={{ fontSize: "0.9em", color: "#666" }}> / month</span>
              </Text>
              <Text size="sm" style={{ marginBottom: 10 }}>
                {plan.description}
              </Text>
              <Button
                fullWidth
                onClick={() => handleNavigate(plan)}
                style={{
                  borderRadius: "20px",
                  backgroundColor: "#00aaff",
                  marginTop: 10,
                }}
              >
                Choose Plan
              </Button>
              <Text size="sm" color="dimmed" style={{ marginTop: 10 }}>
                {plan.count} Users
              </Text>
            </Card>
          ))}
        </Group>
        <Button
          variant="outline"
          color="gray"
          onClick={handleGoBack}
          style={{ marginTop: 20, borderRadius: "20px" }}
        >
          Back to Login
        </Button>
      </Box>
    </Container>
  );
};

export default Pricing_plan;
