// src/components/PatientAppointments.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { baseApiUrl } from "../constants";
import "./PatientAppts.css";

// Interface matching the backend "AppointmentPatientView"
interface Appointment {
  id: number;
  appointment_time: string;
  doctor_name: string;
}

const PatientAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get(`${baseApiUrl}/appointments/patient`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAppointments(response.data);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load appointments.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div className="appointments-container big-container">
      <div className="header-row">
        <h2>My Upcoming Appointments</h2>
        <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && appointments.length === 0 && (
        <p>No upcoming appointments found.</p>
      )}

      {!loading && !error && appointments.length > 0 && (
        <div className="table-wrapper">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Psychologist</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((app) => (
                <tr key={app.id}>
                  <td>{new Date(app.appointment_time).toLocaleString()}</td>
                  <td>{app.doctor_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;