import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Confetti from "../components/Confetti";
import "../Styles/auth.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.rpc("login_admin", {
      p_username: cleanUsername,
      p_password: cleanPassword,
    });

    setLoading(false);

    if (error) {
      alert("Login failed");
      return;
    }

    if (!data || data.length === 0) {
      alert("Invalid username or password");
      return;
    }

    const admin = data[0];

    localStorage.setItem("admin", "true");
    localStorage.setItem("adminId", admin.id);
    localStorage.setItem("adminName", admin.username);
    localStorage.setItem("role", "admin");

    navigate("/dashboard");
  };

  const onKey = (e) => {
    if (e.key === "Enter") login();
  };

  return (
    <div className="auth-bg">
      <Confetti count={30} />

      <span
        className="wel-balloon"
        style={{
          top: "12%",
          left: "12%",
          width: 40,
          height: 50,
          background: "radial-gradient(circle at 35% 28%,#9cc3ee,#4a90d9)",
        }}
      >
        <i style={{ borderTop: "7px solid #4a90d9" }} />
        <b />
      </span>

      <span
        className="wel-balloon"
        style={{
          top: "10%",
          right: "13%",
          width: 34,
          height: 43,
          background: "radial-gradient(circle at 35% 28%,#f6dd9a,#e9b949)",
          animationDelay: ".6s",
        }}
      >
        <i style={{ borderTop: "6px solid #e9b949" }} />
        <b />
      </span>

      <span
        className="wel-balloon"
        style={{
          bottom: "12%",
          left: "16%",
          width: 32,
          height: 40,
          background: "radial-gradient(circle at 35% 28%,#f2c2da,#e58bb6)",
          animationDelay: ".3s",
        }}
      >
        <i style={{ borderTop: "6px solid #e58bb6" }} />
        <b />
      </span>

      <span
        className="wel-balloon"
        style={{
          bottom: "14%",
          right: "14%",
          width: 30,
          height: 38,
          background: "radial-gradient(circle at 35% 28%,#9cc3ee,#2f6fc4)",
          animationDelay: ".9s",
        }}
      >
        <i style={{ borderTop: "6px solid #2f6fc4" }} />
        <b />
      </span>

      <div className="auth-card">
        <img
          className="auth-logo"
          src="/ksu-logo-blue.png"
          alt="King Saud University"
        />

        <h1 className="auth-title">Admin Login</h1>
        <p className="auth-sub">Graduation Attendance · Control Panel</p>

        <input
          className="auth-field"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={onKey}
          autoComplete="username"
        />

        <input
          className="auth-field"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={onKey}
          autoComplete="current-password"
        />

        <button
          className="ksu-btn ksu-btn-primary"
          onClick={login}
          disabled={loading}
        >
          {loading ? "Checking…" : "Login"}
        </button>

        <div className="auth-foot">
          <a onClick={() => navigate("/")}>← Back to home</a>
        </div>
      </div>
    </div>
  );
}
