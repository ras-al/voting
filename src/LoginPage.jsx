import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin");
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  return (
    <div style={{ background: "black", minHeight: "100vh", color: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h2>Admin Login</h2>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        style={{ margin: "10px", padding: "10px", borderRadius: 6 }}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        style={{ margin: "10px", padding: "10px", borderRadius: 6 }}
      />
      <button
        onClick={login}
        style={{ background: "#a6d608", color: "black", padding: "10px 20px", borderRadius: 6, border: "none" }}
      >
        Login
      </button>
    </div>
  );
}
