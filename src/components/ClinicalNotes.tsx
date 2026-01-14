import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Pencil, Trash2, Save, X, Send } from 'lucide-react';
import './ClinicalNotes.css';
import { baseApiUrl } from '../constants';

interface Note {
  id: number;
  content: string;
  created_at: string;
  author_name: string;
  patient_id: number;
}

interface ClinicalNotesProps {
  patientId: number;
}

export const ClinicalNotes: React.FC<ClinicalNotesProps> = ({ patientId }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchNotes();
  }, [patientId, searchTerm]);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get<Note[]>(`${baseApiUrl}/notes/`, {
        params: {
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
    if (!newNoteContent.trim()) return;
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post<Note>(`${baseApiUrl}/notes/`, 
        {
          patient_id: patientId,
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
      await axios.delete(`${baseApiUrl}/notes/delete/${noteId}`, {
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
      const response = await axios.put<Note>(`${baseApiUrl}/notes/update/${editingId}`, 
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

      <div className="notes-header">
        <span className="notes-title">Clinical Notes</span>
        <input 
          type="text" 
          placeholder="Search..." 
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && <div style={{padding: '10px', color: 'red'}}>{error}</div>}

      <div className="notes-list">
        {loading ? (
          <p style={{padding: '20px'}}>Loading...</p>
        ) : notes.length === 0 ? (
          <div className="empty-state">No notes found.</div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="note-card">
              {editingId === note.id ? (
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

      <div className="notes-footer">
        <div className="input-wrapper">
          <textarea
            className="new-note-input"
            placeholder="Add a new note..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
          />
          <button className="send-btn" onClick={handleAddNote}>
            <Send size={16} /> Add
          </button>
        </div>
      </div>
    </div>
  );
};