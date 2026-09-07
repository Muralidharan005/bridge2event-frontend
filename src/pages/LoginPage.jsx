import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Eye, EyeOff } from "lucide-react";
import "./Auth.css";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showError, showSuccess, extractErrorMessage } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await loginUser(formData);
      // Response contains { token, userId, name, email, role }
      login(response.data);
      showSuccess(`Welcome back, ${response.data.name || "User"}!`, "Login Successful");

      // Redirect user according to role
      const role = response.data.role;
      if (role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (role === "ORGANIZER") {
        navigate("/organizer/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      const msg = extractErrorMessage(
        err,
        "Invalid email or password. Please try again."
      );
      showError(msg, "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">
          Sign in to manage your events and tickets
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              required
              placeholder="name@example.com"
              className="form-input"
              value={formData.email}
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
                placeholder="••••••••"
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

          <button type="submit" disabled={loading} className="btn-auth-submit">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
