import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { get_subscriptions } from '../../api';

const Pricing_plan = () => {
  const [plans, setPlans] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    get_subscriptions()
      .then(response => {
        setPlans(response.data);
      })
      .catch(error => {
        console.error("Failed to fetch plans:", error);
      });
  }, []);

  const handleNavigate = (plan) => {
    navigate("/signup", { state: plan });
  };

  const handleGoBack = () => {
    navigate("/"); // Navigate back one step in the history
  };

  return (
    <>
      <div className="main-div">
        <h6 className="choose">Choose Your Plan</h6>
        <div className="pricing-container">
          {plans.map(plan => (
            <div key={plan.id} className="pricing-card">
              <h2 className="h2">{plan.name}</h2>
              <h5>
                <b className="b">${plan.price}</b> / month
              </h5>
              <p>{plan.description}</p>
              <button onClick={() => handleNavigate(plan)}>Choose</button>
              <p>
                {plan.name} <b>{plan.count}</b> Users
              </p>
            </div>
          ))}
        </div>
        <a className="link-text" href="/">
                Back to login
        </a>
      </div>
    </>
  );
};

export default Pricing_plan;
