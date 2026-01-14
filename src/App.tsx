import "./App.css";
import axios from "axios";
import { baseApiUrl } from "./constants";
import { useEffect, useState } from "react";
import { Auth } from "./components/Auth";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "./components/Dashboard";
import { UserProfile } from "./components/UserProfile";
export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
}
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("access_token");
  });
  const role = localStorage.getItem("role");
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("access_token");
  });

  console.log("App token:", token);
  console.log("App isLoggedIn:", isLoggedIn);
  
  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  },[token]);

  const isRoleAllowedPatient = () => {
    return role === "patient";
  }

  const isRoleAllowedPsychologist = () => {
    return role === "doctor" || role === "psychologist";
  }

  return (
    <div className="App">
      <div className="content-container">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/login" element={<Auth setToken={setToken}/>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                isRoleAllowed={() => {
                  return true;
                }}
              >
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/example-patient-page"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn} isRoleAllowed={isRoleAllowedPatient}>
                <div>Example Page for Patients</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/example-psychologist-page"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn} isRoleAllowed={isRoleAllowedPsychologist}>
                <div>Example Page for Psychologists</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-profile"
            element={
              <ProtectedRoute 
                isLoggedIn={isLoggedIn} 
                isRoleAllowed={() => true} // Logic handled inside component
              >
                <UserProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      </div>  
    </div>
  );
}

export default App;