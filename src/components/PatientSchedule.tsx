import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseApiUrl } from "../constants";
import "./PatientSchedule.css";

const TIMESLOTS = [
  "07:00 - 09:00",
  "09:00 - 11:00",
  "11:00 - 13:00",
  "13:00 - 15:00",
  "15:00 - 17:00",
  "17:00 - 19:00",
  "19:00 - 21:00",
];

interface PatientScheduleProps {
  date: Date;
  onBack: () => void;
}

interface Appointment {
  id: number;
  appointment_time: string;
  patient_name: string;
  patient_email: string;
}

interface Doctor {
  id: number;
  full_name: string;
}

export const PatientSchedule: React.FC<PatientScheduleProps> = ({ date, onBack }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch appointments and doctors on mount
  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const res = await axios.get(`${baseApiUrl}/appointments/patient`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data || []);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get(`${baseApiUrl}/users?role=psychologist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(res.data || []);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    }
  };

  // Check if a timeslot is taken
  const isSlotTaken = (slot: string): boolean => {
    const startHour = parseInt(slot.split(" - ")[0].split(":")[0], 10);

    return appointments.some((appt) => {
      const apptDate = new Date(appt.appointment_time);
      return (
        apptDate.getFullYear() === date.getFullYear() &&
        apptDate.getMonth() === date.getMonth() &&
        apptDate.getDate() === date.getDate() &&
        apptDate.getHours() === startHour
      );
    });
  };

  const handleSetAppointment = async () => {
    if (!selectedSlot || !selectedDoctor) return;

    try {
      const token = localStorage.getItem("access_token");
      const patientId = localStorage.getItem("id");

      if (!patientId) {
        alert("Patient ID not found. Please log in again.");
        return;
      }

      // Extract starting hour from slot (e.g., "13:00 - 15:00" -> "13")
      const startHour = selectedSlot.split(" - ")[0].split(":")[0];

      // Construct appointment time
      const appointmentTime = new Date(date);
      appointmentTime.setHours(parseInt(startHour, 10), 0, 0, 0);

      await axios.post(
        `${baseApiUrl}/appointments`,
        {
          patient_id: parseInt(patientId, 10),
          doctor_id: selectedDoctor,
          appointment_time: appointmentTime.toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Appointment set successfully!");
      setSelectedSlot(null);
      setSelectedDoctor(null);
      fetchAppointments(); // Refresh appointments to update UI
    } catch (err) {
      console.error("Failed to set appointment:", err);
      alert("Failed to set appointment. Please try again.");
    }
  };

  const dateStr = date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="schedule-view">
      <button className="back-button" onClick={onBack}>
        ← Back to Calendar
      </button>

      <h3>Available Timeslots for {dateStr}</h3>

      <div style={{ marginTop: "20px" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontWeight: "600" }}>Select Doctor:</span>
          <select
            value={selectedDoctor || ""}
            onChange={(e) => {
              setSelectedDoctor(e.target.value ? Number(e.target.value) : null);
              setSelectedSlot(null); // Reset slot when doctor changes
            }}
          >
            <option value="">-- Choose a doctor --</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.full_name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <div style={{ marginTop: "20px", textAlign: "center", color: "#666" }}>
          Loading timeslots...
        </div>
      ) : selectedDoctor ? (
        <>
          <div className="schedule-grid" style={{ marginTop: "20px" }}>
            {TIMESLOTS.map((slot) => {
              const taken = isSlotTaken(slot);
              const isSelected = selectedSlot === slot;

              return (
                <div
                  key={slot}
                  className={`timeslot ${isSelected ? "selected" : ""} ${
                    taken ? "taken" : "available"
                  }`}
                  onClick={() => !taken && setSelectedSlot(slot)}
                >
                  {taken ? (
                    <div className="time">Unavailable</div>
                  ) : (
                    <div className="time">{slot}</div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedSlot && (
            <div style={{ marginTop: "20px" }}>
              <p>
                Selected: <strong>{selectedSlot}</strong>
              </p>
              <button
                className="set-appointment-btn"
                onClick={handleSetAppointment}
              >
                Set Appointment
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ marginTop: "20px", padding: "20px", textAlign: "center", color: "#999" }}>
          Please select a doctor to view available timeslots.
        </div>
      )}
    </div>
  );
};
