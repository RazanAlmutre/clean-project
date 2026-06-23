import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Confetti from "../components/Confetti";
import "../Styles/auth.css";

export default function StudentLogin() {
  const navigate = useNavigate();

  const [serial, setSerial] = useState("");
  const [degree, setDegree] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async () => {
    setErrorMsg("");

    if (!serial.trim() || !degree) {
      setErrorMsg("Please enter your serial number and choose your degree");
      return;
    }

    setLoading(true);

    const inputSerial = serial.trim();

    // 1) نجيب كل الطلاب اللي نفس الرقم
    console.log("Searching for:", inputSerial);
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("student_id", inputSerial);

    if (error) {
      setLoading(false);
      setErrorMsg("Server error");
      return;
    }

    if (!data || data.length === 0) {
      setLoading(false);
      setErrorMsg("Student not found");
      return;
    }

    // 2) نطابق الدرجة
    const student = data.find(
      (s) =>
        (s.degree || "").trim().toUpperCase() === degree.trim().toUpperCase(),
    );

    if (!student) {
      setLoading(false);
      setErrorMsg("Degree does not match this serial number");
      return;
    }

    // 3) حفظ البيانات
    localStorage.setItem("studentDbId", student.id);
    localStorage.setItem("studentId", student.student_id);
    localStorage.setItem("studentName", student.student_name);
    localStorage.setItem("studentDegree", student.degree);
    localStorage.setItem("role", "student");

    setLoading(false);
    navigate("/student");
  };

  const onKey = (e) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div className="auth-bg">
      <Confetti count={26} />

      <span
        className="wel-balloon"
        style={{
          top: "14%",
          right: "16%",
          width: 34,
          height: 42,
          background: "radial-gradient(circle at 35% 28%,#9cc3ee,#4a90d9)",
        }}
      >
        <i style={{ borderTop: "6px solid #4a90d9" }} />
        <b />
      </span>

      <div className="auth-card">
        <div className="auth-cap">
          <img src="/sticker-cap.png" alt="" />
        </div>

        <h1 className="auth-title">Student Login</h1>
        <p className="auth-sub">Graduation Attendance System · Class of 2026</p>

        {errorMsg && <div className="auth-error">{errorMsg}</div>}

        <input
          className="auth-field"
          type="text"
          inputMode="decimal"
          placeholder="Serial Number"
          value={serial}
          onChange={(e) => setSerial(e.target.value)}
          onKeyDown={onKey}
        />

        <select
          className={
            "auth-field auth-select" + (degree ? "" : " is-placeholder")
          }
          value={degree}
          onChange={(e) => setDegree(e.target.value)}
        >
          <option value="" disabled>
            Choose your degree
          </option>
          <option value="BSc">BSc — Bachelor's</option>
          <option value="MSc">MSc — Master's</option>
          <option value="PhD">PhD — Doctorate</option>
        </select>

        <button
          className="ksu-btn ksu-btn-primary"
          onClick={submit}
          disabled={loading}
        >
          {loading ? "Checking…" : "Continue"}
        </button>

        <div className="auth-foot">
          <a onClick={() => navigate("/")}>← Back to home</a>
        </div>
      </div>
    </div>
  );
}