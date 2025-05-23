// File: src/UserPage.jsx
import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function UserPage() {
  const [search, setSearch] = useState("");
  const [participants, setParticipants] = useState([]);
  const [voted, setVoted] = useState(false);
  const [votedFor, setVotedFor] = useState(null);
  const [announcing, setAnnouncing] = useState(false);
  const [winner, setWinner] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const votedFlag = localStorage.getItem("hasVoted");
    const votedId = localStorage.getItem("votedForId");
    if (votedFlag) {
      setVoted(true);
      setVotedFor(votedId);
    }
    fetchAnnounce();
    fetchParticipants();
  }, []);

  async function fetchAnnounce() {
    const snap = await getDoc(doc(db, "appState", "announce"));
    if (snap.exists()) {
      setAnnouncing(snap.data().isAnnouncing);
    } else {
      setAnnouncing(false);
    }
  }

  async function fetchParticipants() {
    const snap = await getDocs(collection(db, "participants"));
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setParticipants(data.sort((a, b) => b.votes - a.votes));
    if (data.length > 0) {
      const max = data.reduce((a, b) => (a.votes > b.votes ? a : b));
      setWinner(max);
    }
  }

  async function vote(id, name) {
    if (voted) return;
    const ref = doc(db, "participants", id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const count = snap.data().votes || 0;
      await updateDoc(ref, { votes: count + 1 });
      localStorage.setItem("hasVoted", "true");
      localStorage.setItem("votedForId", id);
      localStorage.setItem("votedForName", name);
      setVoted(true);
      setVotedFor(id);
      fetchParticipants();
    }
  }

  const filtered = participants.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedParticipants = announcing
    ? [
        winner,
        ...participants.filter((p) => p.id !== winner?.id),
      ]
    : filtered;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        color: "#a6d608",
        padding: "2rem",
        fontFamily: "sans-serif",

        // Flex container for vertical & horizontal center
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Admin login button top-left */}
      <button
        onClick={() => navigate("/login")}
        style={{
          position: "fixed",
          top: 10,
          left: 10,
          background: "#a6d608",
          color: "black",
          padding: "6px 12px",
          borderRadius: 6,
          border: "none",
          cursor: "pointer",
          zIndex: 100,
        }}
      >
        Admin Login
      </button>

      <h1 style={{ marginBottom: 20 }}>Vote your Chambidi</h1>

      {!announcing && (
        <>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chambidis..."
            style={{
              padding: "10px",
              width: "100%",
              maxWidth: 400,
              borderRadius: 6,
              marginBottom: "1.5rem",
              border: "1px solid #a6d608",
              backgroundColor: "#111",
              color: "#a6d608",
              textAlign: "center",
              fontSize: 16,
            }}
          />

          {voted && (
            <div
              style={{
                marginBottom: "1.5rem",
                fontWeight: "bold",
                fontSize: "1.2rem",
                textAlign: "center",
              }}
            >
              You voted for:{" "}
              <span style={{ color: "#f0c419" }}>
                {localStorage.getItem("votedForName")}
              </span>
            </div>
          )}

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              width: "100%",
              maxWidth: 600,
              margin: "auto",
            }}
          >
            {filtered.length === 0 && (
              <li
                style={{
                  color: "#666",
                  textAlign: "center",
                  padding: 20,
                  fontStyle: "italic",
                }}
              >
                No candidates found
              </li>
            )}

            {filtered.map((p) => (
              <li
                key={p.id}
                style={{
                  marginBottom: 12,
                  backgroundColor: "#111",
                  padding: 12,
                  borderRadius: 6,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: "#a6d608",
                  fontWeight: "600",
                }}
              >
                <span>{p.name}</span>
                {!voted && (
                  <button
                    onClick={() => vote(p.id, p.name)}
                    style={{
                      background: "#a6d608",
                      color: "black",
                      padding: "6px 12px",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Vote
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Winner announcement */}
      {announcing && winner && (
        <div
          style={{
            maxWidth: 600,
            width: "100%",
            marginTop: 20,
            textAlign: "center",
          }}
        >
          <h2
            style={{
              backgroundColor: "#a6d608",
              color: "black",
              padding: "1rem",
              borderRadius: 6,
              fontWeight: "bold",
              fontSize: "1.6rem",
              marginBottom: "1.5rem",
            }}
          >
            🏆 Winner: {winner.name} ({winner.votes} votes)
          </h2>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              color: "#a6d608",
              fontWeight: "600",
              backgroundColor: "#111",
              borderRadius: 6,
            }}
          >
            {sortedParticipants.map((p) => (
              <li
                key={p.id}
                style={{
                  padding: 12,
                  borderBottom: "1px solid #444",
                  backgroundColor: p.id === winner.id ? "#f0c419" : "transparent",
                  color: p.id === winner.id ? "black" : "#a6d608",
                  fontWeight: p.id === winner.id ? "bold" : "normal",
                  textAlign: "left",
                }}
              >
                {p.name} - {p.votes} votes
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
