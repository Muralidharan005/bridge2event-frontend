import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";
import { useToast } from "../context/ToastContext";
import { Eye, EyeOff } from "lucide-react";
import "./Auth.css";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "USER", // 'USER', 'ORGANIZER', or 'ADMIN'
    active: true,
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess, showWarning, extractErrorMessage } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      showWarning("Password must be at least 6 characters.", "Password Too Short");
      return;
    }

    if (formData.password !== confirmPassword) {
      showError(
        "Passwords do not match. Please re-enter your password to confirm.",
        "Password Mismatch"
      );
      return;
    }

    setLoading(true);

    try {
      await registerUser(formData);
      showSuccess("Account created successfully! Please log in.", "Registration Successful");
      // After registration, redirect to login
      navigate("/login");
    } catch (err) {
      const msg = extractErrorMessage(
        err,
        "Registration failed. Please check your details."
      );
      showError(msg, "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Create an Account</h2>
        <p className="auth-subtitle">
          Join Bridge2Event to discover or host amazing events
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="John Doe"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              required
              placeholder="john@example.com"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              required
              placeholder="+1234567890"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="Create a strong password (min 6 chars)"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                placeholder="Re-enter your password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={
                  showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                }
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword && formData.password !== confirmPassword && (
              <span style={{ fontSize: "0.78rem", color: "#ef4444", marginTop: "2px" }}>
                Passwords do not match
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Register As</label>
            <select
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="USER">Attendee / Ticket Buyer (USER)</option>
              <option value="ORGANIZER">
                Event Host / Organizer (ORGANIZER)
              </option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-auth-submit">
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
