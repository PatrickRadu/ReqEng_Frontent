import axios from "axios";
import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { baseApiUrl } from "../constants";
import "./Dashboard.css";
const Dashboard: React.FC = () => {
  const fullName = localStorage.getItem("full_name");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  useEffect(() => {
    const fetchHello = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get(`${baseApiUrl}/hello`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Hello response:", response.data);
      } catch (err: any) {
        console.error(err);
      }
    };

    fetchHello();
  }, []);
  return (
    <div className="dashboard-container big-container">
      <div className="dashboard-info">
      <h1>Dashboard</h1>
      <p>Welcome to the Dashboard, {fullName}!</p>
      <p>Your role: {role}</p>
      </div>
      <div className="dashboard-panel">
       {role === "patient" && (
        <div>
          <button onClick={() => navigate("/example-patient-page")}>
            View My Appointments
          </button>
        </div>
      )}
      {role === "psychologist" && (
        <div>
          <button onClick={() => navigate("/example-psychologist-page")}>
            View Appointments
          </button>
        </div>
      )}
      </div>
    </div>
  );
};

export default Dashboard;