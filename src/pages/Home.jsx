import { useNavigate } from "react-router-dom";
import Confetti from "../components/Confetti";
import "../Styles/auth.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="wel-wrap">
      {/* ---------- Left festive panel ---------- */}
      <aside className="wel-left">
        <span className="wel-blob wel-blob-1" />
        <span className="wel-blob wel-blob-2" />
        <img className="wel-burst" src="/sticker-confetti.png" alt="" />
        <img
          className="wel-logo-chip"
          src="/ksu-logo.png"
          alt="King Saud University"
        />

        <span
          className="wel-balloon"
style={{
  top: 100,
  left: 40,
  width: 20,
  height: 28,
  background: "radial-gradient(circle at 35% 28%, #f6dd9a, #e9b949)",
}}
        >
          <i style={{ borderTop: "4px solid #e9b949" }} />
          <b />
        </span>

        <div className="wel-headline">
          <h1>
            Graduation
            <br />
            Attendance
          </h1>
          <p>
            Celebrate the Class of 2026 — check in and watch attendance update
            live.
          </p>
        </div>

        <img className="wel-girl" src="/graduate-girl.png" alt="Graduate" />

        <div className="wel-live">
          <span className="dot" />
          Live attendance · updated in real time
        </div>
      </aside>

      {/* ---------- Right panel ---------- */}
      <main className="wel-right">
        <Confetti count={24} />

        <span
          className="wel-balloon"
          style={{
            top: 60,
            left: 56,
            width: 38,
            height: 48,
            background: "radial-gradient(circle at 35% 28%,#9cc3ee,#4a90d9)",
          }}
        >
          <i style={{ borderTop: "7px solid #4a90d9" }} />
          <b />
        </span>
        <span
          className="wel-balloon"
          style={{
            top: 54,
            right: 70,
            width: 30,
            height: 38,
            animationDelay: ".5s",
            background: "radial-gradient(circle at 35% 28%,#f2c2da,#e58bb6)",
          }}
        >
          <i style={{ borderTop: "6px solid #e58bb6" }} />
          <b />
        </span>

        <img
          className="auth-logo"
          style={{ width: 190, height: 84 }}
          src="/logo26.png"
          alt="King Saud University"
        />
        <h2 className="wel-welcome">Welcome 🎓</h2>
        <p className="wel-sub">Graduation Attendance System</p>
        <p className="wel-hint">Choose how you'd like to sign in</p>

        <div className="wel-actions">
          <button
            className="ksu-btn ksu-btn-primary"
            onClick={() => navigate("/student-login")}
          >
            🎓 &nbsp;I'm a Student
          </button>
          <button
            className="ksu-btn ksu-btn-ghost"
            onClick={() => navigate("/admin")}
          >
            Admin Login
          </button>
        </div>

        <div className="wel-foot">
          <span className="dot-green" />
          King Saud University · Class of 2026
        </div>
      </main>
    </div>
  );
}
