import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
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
      const data = await loginUser(form);
      login(data);
      navigate("/");
    } catch (_error) {
      setError("We cannot find an account with that email address");
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
        </Link>
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
        <h1>Sign in</h1>
        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="ap_email">Email or mobile phone number</label>
            <input
              id="ap_email"
              name="email"
              type="email"
              className="auth-input"
              value={form.email}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="auth-form-group">
            <div className="auth-label-row">
              <label className="auth-label" htmlFor="ap_password">Password</label>
              <Link to="/login" className="auth-link-small">Forgot password?</Link>
            </div>
            <input
              id="ap_password"
              name="password"
              type="password"
              className="auth-input"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-primary-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-legal-text">
          By continuing, you agree to Amazon's <Link to="/login" className="auth-link-small">Conditions of Use</Link> and <Link to="/login" className="auth-link-small">Privacy Notice</Link>.
        </p>
      </div>

      <div className="auth-divider-container">
        <div className="auth-divider-line"></div>
        <span className="auth-divider-text">New to Amazon?</span>
        <div className="auth-divider-line"></div>
      </div>

      <Link to="/signup" className="auth-secondary-btn" style={{ maxWidth: "350px" }}>
        Create your Amazon account
      </Link>

      <footer className="auth-footer">
        <div className="auth-footer-links">
          <Link to="/login" className="auth-link-small">Conditions of Use</Link>
          <Link to="/login" className="auth-link-small">Privacy Notice</Link>
          <Link to="/login" className="auth-link-small">Help</Link>
        </div>
        <p className="auth-footer-copy">© 1996-2024, Amazon.com, Inc. or its affiliates</p>
      </footer>
    </>
  );
}

export default Login;
