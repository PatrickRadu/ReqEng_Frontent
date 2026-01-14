import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Pencil, Trash2, Save, X, Send, User } from 'lucide-react';
import './ClinicalNotes.css';
import { baseApiUrl } from '../constants';

interface Note {
  id: number;
  content: string;
  created_at: string;
  author_name: string;
  patient_id: number;
}

interface Patient {
  id: number;
  full_name: string;
}

export const ClinicalNotes: React.FC = () => {
  // 1. State for Patients List and Selection
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | string>("");

  // Existing State
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  // 2. Fetch Patients on Mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem('access_token');
        // Assumes an endpoint /users that filters by role
        const response = await axios.get<Patient[]>(`${baseApiUrl}/users`, {
          params: { role: 'patient' }, 
          headers: { Authorization: `Bearer ${token}` }
        });
        setPatients(response.data);
        
        // Optional: Auto-select first patient if available
        if (response.data.length > 0) {
          setSelectedPatientId(response.data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch patients", err);
        setError("Could not load patient list.");
      }
    };
    fetchPatients();
  }, []);

  // 3. Fetch Notes when Patient Selection Changes
  useEffect(() => {
    if (!selectedPatientId) {
      setNotes([]);
      return;
    }
    fetchNotes();
  }, [selectedPatientId, searchTerm]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get<Note[]>(`${baseApiUrl}/notes/`, {
        params: { 
          patient_id: selectedPatientId, 
          search: searchTerm,
          limit: 50 
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(response.data);
      setLoading(false);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status !== 404) {
         setError("Could not load notes.");
      }
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim() || !selectedPatientId) return;
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post<Note>(`${baseApiUrl}/notes/`, 
        {
          patient_id: selectedPatientId, // Uses the dropdown value
          content: newNoteContent,
          is_confidential: false
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes([response.data, ...notes]);
      setNewNoteContent("");
      showSuccess("Note added successfully");
    } catch (err: any) {
      alert("Error adding note");
    }
  };

  const handleDelete = async (noteId: number) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${baseApiUrl}/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(notes.filter(n => n.id !== noteId));
      showSuccess("Note deleted");
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.put<Note>(`${baseApiUrl}/notes/${editingId}`, 
        { content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(notes.map(n => (n.id === editingId ? response.data : n)));
      setEditingId(null);
      showSuccess("Updated successfully");
    } catch (err) {
      alert("Update failed");
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="notes-container big-container">
      {successMsg && <div className="success-banner">{successMsg}</div>}

      {/* HEADER WITH DROPDOWN */}
      <div className="notes-header">
        <div className="header-left">
            <span className="notes-title">Clinical Notes</span>
            <div className="patient-selector">
                <User size={16} className="selector-icon"/>
                <select 
                    value={selectedPatientId} 
                    onChange={(e) => setSelectedPatientId(Number(e.target.value))}
                    className="patient-dropdown"
                >
                    <option value="" disabled>Select a Patient</option>
                    {patients.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.full_name}
                        </option>
                    ))}
                </select>
            </div>
        </div>

        <input 
          type="text" 
          placeholder="Search notes..." 
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && <div style={{padding: '10px', color: 'red'}}>{error}</div>}

      {/* NOTES LIST */}
      <div className="notes-list">
        {!selectedPatientId ? (
            <div className="empty-state">Please select a patient to view notes.</div>
        ) : loading ? (
          <p style={{padding: '20px'}}>Loading history...</p>
        ) : notes.length === 0 ? (
          <div className="empty-state">No notes found for this patient.</div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="note-card">
              {editingId === note.id ? (
                /* EDIT MODE */
                <div>
                   <div className="note-meta">
                    <span className="author-name">Editing...</span>
                    <div className="note-actions">
                      <button className="icon-btn" onClick={saveEdit}><Save size={18} color="green" /></button>
                      <button className="icon-btn" onClick={() => setEditingId(null)}><X size={18} color="red" /></button>
                    </div>
                  </div>
                  <textarea 
                    className="edit-textarea"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                  />
                </div>
              ) : (
                /* VIEW MODE */
                <div>
                  <div className="note-meta">
                    <div>
                      <span className="author-name">{note.author_name}</span>
                      <span className="separator">•</span>
                      <span>{format(new Date(note.created_at), 'dd/MM/yyyy, HH:mm')}</span>
                    </div>
                    <div className="note-actions">
                      <button className="icon-btn" onClick={() => startEdit(note)}><Pencil size={16} /></button>
                      <button className="icon-btn delete" onClick={() => handleDelete(note.id)}><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="note-content">{note.content}</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* FOOTER */}
      <div className="notes-footer">
        <div className="input-wrapper">
          <textarea
            className="new-note-input"
            placeholder={selectedPatientId ? "Add a new note..." : "Select a patient first..."}
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            disabled={!selectedPatientId}
          />
          <button 
            className="send-btn" 
            onClick={handleAddNote}
            disabled={!selectedPatientId}
            style={{ opacity: !selectedPatientId ? 0.5 : 1 }}
          >
            <Send size={16} /> Add
          </button>
        </div>
      </div>
    </div>
  );
};