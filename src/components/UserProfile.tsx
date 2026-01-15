import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ClinicalNotes } from './ClinicalNotes';
import './Dashboard.css'; 
import { AppCalendar } from './AppCalendar';
import { DoctorSchedule } from './DoctorSchedule';
import { PatientSchedule } from './PatientSchedule';

export const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  // Accessing user data exactly as described in README Step 5
  const currentUserRole = localStorage.getItem('role');
  const currentUserRoleCapitalized = currentUserRole
    ? currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1)
    : '';
  const fullName = localStorage.getItem('full_name');
  const storedValue = localStorage.getItem('id');
  const targetPatientId = Number(storedValue);

  // State to track selected day for schedule view
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <div className="dashboard-container big-container">
      {/* Top info */}
      <div className="dashboard-info">
        <h1>{currentUserRoleCapitalized} Profile</h1>
        <p>Viewing details for User ID: {targetPatientId}</p>
        <p>
          Logged in as: <strong>{fullName} ({currentUserRoleCapitalized})</strong>
        </p>
      </div>

      <div className="dashboard-panel">
        {currentUserRole === 'doctor' || currentUserRole === 'psychologist' ? (
          <div className="doctor-main-panel">
            {/* LEFT PANEL: Calendar / Doctor Schedule */}
            <div className="doctor-left-panel">
              {!selectedDate && (
                <div style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
                  <AppCalendar onDayClick={(day: Date) => setSelectedDate(day)} />
                </div>
              )}
              {selectedDate && (
                <DoctorSchedule
                  date={selectedDate}
                  onBack={() => setSelectedDate(null)}
                />
              )}
            </div>

            {/* RIGHT PANEL: Clinical Notes */}
            <div className="doctor-right-panel">
              <ClinicalNotes />
            </div>
          </div>
        ) : (
          /* SCENARIO B: Patient View -> Calendar / Patient Schedule */
          <div className="doctor-main-panel">
            <div className="doctor-left-panel">
              {!selectedDate && (
                <div style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
                  <AppCalendar onDayClick={(day: Date) => setSelectedDate(day)} />
                </div>
              )}
              {selectedDate && (
                <PatientSchedule
                  date={selectedDate}
                  onBack={() => setSelectedDate(null)}
                />
              )}
            </div>

            {/* Optional Right Panel Placeholder */}
            <div className="doctor-right-panel" style={{ background: '#f8f9fa', borderRadius: '10px', padding: '20px', textAlign: 'center', color: '#666' }}>
              <h3>Appointments Info</h3>
              <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'block', margin: '0 auto' }}>
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
