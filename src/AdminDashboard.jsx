import React, { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [participants, setParticipants] = useState([]);
  const [newName, setNewName] = useState("");
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchParticipants();
    fetchAnnounceStatus();
  }, []);

  async function fetchParticipants() {
    const snap = await getDocs(collection(db, "participants"));
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setParticipants(data);
  }

  async function fetchAnnounceStatus() {
    const snap = await getDoc(doc(db, "appState", "announce"));
    if (snap.exists()) {
      setIsAnnouncing(snap.data().isAnnouncing);
    } else {
      await setDoc(doc(db, "appState", "announce"), { isAnnouncing: false });
      setIsAnnouncing(false);
    }
  }

  async function addParticipant() {
    if (!newName.trim()) {
      alert("Enter participant name");
      return;
    }
    if (participants.some((p) => p.name.toLowerCase() === newName.toLowerCase())) {
      alert("Participant with this name already exists");
      return;
    }
    await addDoc(collection(db, "participants"), {
      name: newName.trim(),
      votes: 0,
    });
    setNewName("");
    fetchParticipants();
  }

  async function deleteParticipant(id) {
    if (!window.confirm("Delete this participant?")) return;
    await deleteDoc(doc(db, "participants", id));
    fetchParticipants();
  }

  async function toggleAnnounce() {
    const newState = !isAnnouncing;
    await updateDoc(doc(db, "appState", "announce"), {
      isAnnouncing: newState,
    });
    setIsAnnouncing(newState);
  }

  async function resetVotes() {
    if (!window.confirm("Reset all votes? This will not remove participants.")) return;
    for (const p of participants) {
      await updateDoc(doc(db, "participants", p.id), { votes: 0 });
    }
    await updateDoc(doc(db, "appState", "announce"), { isAnnouncing: false });
    setIsAnnouncing(false);
    fetchParticipants();
  }

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        color: "#a6d608",
        padding: "2rem",
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <button
        onClick={logout}
        style={{
          alignSelf: "flex-start",
          marginBottom: 20,
          background: "#a6d608",
          color: "black",
          padding: "8px 16px",
          borderRadius: 6,
          border: "none",
          cursor: "pointer",
        }}
      >
        Logout
      </button>

      <h1 style={{ marginBottom: 30 }}>Admin Dashboard</h1>

      <div
        style={{
          marginBottom: 30,
          width: "100%",
          maxWidth: 450,
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New participant name"
          style={{
            flexGrow: 1,
            padding: 12,
            borderRadius: 6,
            border: "none",
            fontSize: 16,
          }}
        />
        <button
          onClick={addParticipant}
          style={{
            padding: "12px 24px",
            borderRadius: 6,
            border: "none",
            background: "#a6d608",
            color: "black",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Add
        </button>
      </div>

      <div
        style={{
          maxWidth: 600,
          width: "100%",
          border: "1px solid #a6d608",
          borderRadius: 6,
          padding: "1rem",
          maxHeight: 350,
          overflowY: "auto",
        }}
      >
        <h2 style={{ marginBottom: 15 }}>Participants List</h2>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          {participants.length === 0 && (
            <li style={{ padding: 10, color: "#888" }}>No participants added yet.</li>
          )}
          {participants.map((p) => (
            <li
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px",
                borderBottom: "1px solid #a6d608",
              }}
            >
              <span style={{ fontWeight: "600" }}>
                {p.name} — Votes: {p.votes}
              </span>
              <button
                onClick={() => deleteParticipant(p.id)}
                style={{
                  background: "red",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 30, display: "flex", gap: 15 }}>
        <button
          onClick={toggleAnnounce}
          style={{
            padding: "12px 28px",
            borderRadius: 6,
            border: "none",
            background: isAnnouncing ? "red" : "#a6d608",
            color: isAnnouncing ? "white" : "black",
            cursor: "pointer",
            fontWeight: "bold",
            minWidth: 180,
          }}
        >
          {isAnnouncing ? "Stop Announcing Winner" : "Announce Winner"}
        </button>

        <button
          onClick={resetVotes}
          style={{
            padding: "12px 28px",
            borderRadius: 6,
            border: "none",
            background: "#444",
            color: "#a6d608",
            cursor: "pointer",
            fontWeight: "bold",
            minWidth: 120,
          }}
        >
          Reset Votes
        </button>
      </div>
    </div>
  );
}
