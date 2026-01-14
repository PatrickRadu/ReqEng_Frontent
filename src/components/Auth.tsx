import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseApiUrl } from "../constants";
import { useNavigate } from "react-router";
import "./Auth.css";


interface AuthProps {
    setToken: (token: string) => void;
}
export const Auth: React.FC<AuthProps> = ({ setToken }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("patient");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(`${baseApiUrl}/login`, {
        email,
        password,
      });
      localStorage.setItem("id", response.data.user.id);
      localStorage.setItem("role", response.data.user.role);
      localStorage.setItem("full_name", response.data.user.full_name);
      localStorage.setItem("access_token", response.data.access_token);

      // Clear form
      setEmail("");
      setPassword("");

      console.log("Login successful:", response.data);
      setToken(response.data.access_token);
      // Navigate to the intended page
      navigate("/user-profile");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(`${baseApiUrl}/register`, {
        email,
        password,
        full_name: fullName,
        role,
      });

      console.log("Registration response:", response.data);
      setSuccess("Registration successful! You can now log in.");

      // Clear form and switch to login
      setEmail("");
      setPassword("");
      setFullName("");
      setRole("patient");
      setIsSignUp(false);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Registration failed. Please try again."
      );
    }
  };

  // If user is logged in, show a simple dashboard

  return (
    <div className="login-container big-container">
      <form onSubmit={isSignUp ? handleRegister : handleLogin}>
        <h2>{isSignUp ? "Sign Up" : "Login"}</h2>

        {error && <div>{error}</div>}
        {success && <div>{success}</div>}

        {isSignUp && (
          <div>
            <label>
              Full Name:
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </label>
          </div>
        )}

        <div>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
        </div>

        <div>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>

        {isSignUp && (
          <div>
            <label>
              Role:
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="patient">Patient</option>
                <option value="psychologist">Psychologist</option>
              </select>
            </label>
          </div>
        )}

        <button type="submit">{isSignUp ? "Sign Up" : "Login"}</button>

        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
            setSuccess("");
          }}
        >
          {isSignUp
            ? "Already have an account? Login"
            : "Don't have an account? Sign Up"}
        </button>
      </form>
    </div>
  );
};
