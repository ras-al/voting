import React from "react";
import { Routes, Route } from "react-router-dom";
import UserPage from "./UserPage";
import LoginPage from "./LoginPage";
import AdminDashboard from "./AdminDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<UserPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;
