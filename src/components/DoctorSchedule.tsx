import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseApiUrl } from "../constants";
import "./DoctorSchedule.css";

const timeslots = [
  "07:00 - 09:00",
  "09:00 - 11:00",
  "11:00 - 13:00",
  "13:00 - 15:00",
  "15:00 - 17:00",
  "17:00 - 19:00",
  "19:00 - 21:00",
];

interface DoctorScheduleProps {
  date: Date;
  onBack: () => void;
}

interface Appointment {
  id: number;
  appointment_time: string; // "2026-01-15T07:00:00"
  patient_name: string;
}

export const DoctorSchedule: React.FC<DoctorScheduleProps> = ({ date, onBack }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get(`${baseApiUrl}/appointments/doctor`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(response.data || []);
      } catch (err) {
        console.error("Failed to fetch appointments", err);
      }
    };

    fetchAppointments();
  }, [date]);

  // Map appointments to timeslots based on starting hour
  const slotPatients: Record<string, string> = {};
  timeslots.forEach((slot) => {
    const slotStartHour = parseInt(slot.split(" - ")[0].split(":")[0], 10); // e.g., 7
    const patient = appointments.find((app) => {
      const appDate = new Date(app.appointment_time);
      const appHour = appDate.getHours();
      const appDay = appDate.toDateString();
      const selectedDay = date.toDateString();
      return appDay === selectedDay && appHour === slotStartHour;
    });
    slotPatients[slot] = patient ? patient.patient_name : "-";
  });

  return (
    <div className="schedule-view">
      <button className="back-button" onClick={onBack}>← Back to Calendar</button>
      <h3>
        Schedule for {date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
      </h3>
      <div className="schedule-grid">
        {timeslots.map((slot) => (
          <div key={slot} className="timeslot">
            <div className="time">{slot}</div>
            <div className="patient">{slotPatients[slot]}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
