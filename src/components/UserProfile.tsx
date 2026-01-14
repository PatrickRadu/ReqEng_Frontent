import React from 'react';
import { ClinicalNotes } from './ClinicalNotes';
import './Dashboard.css'; 

export const UserProfile: React.FC = () => {
  // Accessing user data exactly as described in README Step 5
  const currentUserRole = localStorage.getItem('role');
  const fullName = localStorage.getItem('full_name');
  
  // Hardcoded for prototype purposes
  const targetPatientId = 1; 

  // Using 'big-container' to span the full grid width
  return (
    <div className="dashboard-container big-container">
      <div className="dashboard-info">
        <h1>Patient Profile</h1>
        <p>Viewing details for Patient ID: {targetPatientId}</p>
        <p>Logged in as: <strong>{fullName} ({currentUserRole})</strong></p>
      </div>

      <div className="dashboard-panel">
        {currentUserRole === 'doctor' || currentUserRole === 'psychologist' ? (
          /* SCENARIO A: Psychologist View -> Show Notes */
          <div style={{ marginTop: '20px' }}>
            <ClinicalNotes patientId={targetPatientId} />
          </div>
        ) : (
          /* SCENARIO B: Patient View -> Show Placeholder */
          <div className="small-container" style={{ marginTop: '20px', padding: '40px', textAlign: 'center', background: '#f8f9fa', borderRadius: '10px' }}>
            <h2>My Appointments</h2>
            <p style={{ color: '#666', marginTop: '10px' }}>
              (Calendar Component Placeholder)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};