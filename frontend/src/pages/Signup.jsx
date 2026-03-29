import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");
      const data = await signupUser(form);
      login(data);
      navigate("/");
    } catch (_error) {
      setError("Signup failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-logo">
        <Link to="/">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" 
            alt="Amazon Logo" 
            className="auth-logo-img"
          />
          <span className="auth-logo-badge">PORTFOLIO DEMO</span>
        </Link>
      </div>

      <div className="auth-disclaimer">
        <span className="auth-disclaimer-icon">⚠️</span>
        <div>
          <strong>PORTFOLIO DEMO ONLY:</strong> This is a UI clone created for a portfolio. 
          It is <strong>NOT</strong> the real Amazon. For your safety, <strong>DO NOT</strong> use your actual Amazon password.
        </div>
      </div>

      {error && (
        <div className="auth-card" style={{ padding: "14px", border: "1px solid #c40000", marginBottom: "14px", width: "100%", maxWidth: "350px" }}>
          <div className="auth-error-box" style={{ border: "none", margin: 0, padding: 0 }}>
             <span className="auth-error-icon">!</span>
             <div>
                <h4 style={{ color: "#c40000", margin: "0 0 5px 0", fontSize: "17px" }}>There was a problem</h4>
                <p className="auth-error-text">{error}</p>
             </div>
          </div>
        </div>
      )}

      <div className="auth-card">
        <h1>Create account</h1>
        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="ap_customer_name">Your name</label>
            <input
              id="ap_customer_name"
              name="name"
              type="text"
              placeholder="First and last name"
              className="auth-input"
              value={form.name}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label" htmlFor="ap_email">Email</label>
            <input
              id="ap_email"
              name="email"
              type="email"
              className="auth-input"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label" htmlFor="ap_password">Password</label>
            <input
              id="ap_password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              className="auth-input"
              value={form.password}
              onChange={handleChange}
              required
            />
            <div style={{ fontSize: "12px", marginTop: "4px", color: "#111" }}>
              <span style={{ fontStyle: "italic", fontWeight: "bold", marginRight: "5px" }}>i</span>
              Passwords must be at least 6 characters.
            </div>
          </div>

          <button type="submit" className="auth-primary-btn" disabled={loading}>
            {loading ? "Creating account..." : "Continue"}
          </button>
        </form>

        <p className="auth-legal-text" style={{ borderTop: "1px solid #eee", paddingTop: "15px", marginTop: "20px" }}>
          Already have an account? <Link to="/login" className="auth-link-small" style={{ fontWeight: "bold" }}>Sign in ▸</Link>
        </p>

        <p className="auth-legal-text" style={{ fontSize: "11px", color: "#555" }}>
          By creating an account, you agree to Amazon's <Link to="/signup" className="auth-link-small">Conditions of Use</Link> and <Link to="/signup" className="auth-link-small">Privacy Notice</Link>.
        </p>
      </div>

      <footer className="auth-footer">
        <div className="auth-footer-links">
          <Link to="/signup" className="auth-link-small">Conditions of Use</Link>
          <Link to="/signup" className="auth-link-small">Privacy Notice</Link>
          <Link to="/signup" className="auth-link-small">Help</Link>
        </div>
        <p className="auth-footer-copy">© 1996-2024, Amazon.com, Inc. or its affiliates</p>
      </footer>
    </>
  );
}

export default Signup;
