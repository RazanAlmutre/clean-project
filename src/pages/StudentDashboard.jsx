import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import CapAvatar from "../components/CapAvatar";
import Confetti from "../components/Confetti";
import "../Styles/student-dashboard.css";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const studentDbId = localStorage.getItem("studentDbId");

  const [student, setStudent] = useState(null);
  const [attended, setAttended] = useState(false);
  const [loading, setLoading] = useState(true);
  const [present, setPresent] = useState(0);
  const [total, setTotal] = useState(0);

  const today = new Date().toISOString().split("T")[0];

  const loadCounts = async () => {
    const { count: totalCount } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true });
    const { count: presentCount } = await supabase
      .from("attendance")
      .select("*", { count: "exact", head: true });
    setTotal(totalCount || 0);
    setPresent(presentCount || 0);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!studentDbId) {
        alert("Please login again");
        setLoading(false);
        return;
      }

      const { data: studentData, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", studentDbId)
        .single();

      if (error || !studentData) {
        alert("Student not found");
        setLoading(false);
        return;
      }
      setStudent(studentData);

      const { data: attendanceData } = await supabase
        .from("attendance")
        .select("*")
        .eq("student_id", studentDbId)
        .eq("attendance_date", today);

      if (attendanceData && attendanceData.length > 0) setAttended(true);

      await loadCounts();
      setLoading(false);
    };
    fetchData();
  }, [studentDbId, today]);

  const markAttendance = async () => {
    if (!student) return;

    const { data: existing } = await supabase
      .from("attendance")
      .select("*")
      .eq("student_id", student.id)
      .eq("attendance_date", today);

    if (existing && existing.length > 0) {
      setAttended(true);
      alert("You have already marked your attendance.");
      return;
    }

    const { error } = await supabase
      .from("attendance")
      .insert([{ student_id: student.id, attendance_date: today }]);

    if (error) {
      alert(error.message);
      return;
    }

    setAttended(true);
    await loadCounts();
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (loading) {
    return (
      <div
        className="sd-page"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <p style={{ color: "#9aa6bd", margin: "auto" }}>Loading…</p>
      </div>
    );
  }

  const name = student?.student_name || "Graduate";
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="sd-page">
      <header className="sd-header">
        <img
          className="logo"
          src="/ksu-logo-blue.png"
          alt="King Saud University"
        />
        <div className="sd-user">
          <div className="meta">
            <div className="nm">{name}</div>
            <div className="sr">Serial #{student?.student_id}</div>
          </div>
          <CapAvatar name={name} size={46} />
          <button className="sd-logout" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <div className="sd-body">
        <Confetti count={22} />

        <div className="sd-greet">
          <div>
            <h1>Hi, {name.split(" ")[0]} 👋</h1>
            <p>Welcome to your graduation day · Class of 2026</p>
          </div>
          <span className="sd-live">
            <span className="dot" />
            LIVE CEREMONY
          </span>
        </div>

        <div className="sd-grid">
          {/* profile */}
          <div className="sd-card sd-profile">
            <CapAvatar name={name} size={120} tone="soft" />
            <h3>{name}</h3>
            <p>{student?.degree || "King Saud University"}</p>
            <div className="sd-chips">
              <div className="sd-chip">
                <div className="k">Serial</div>
                <div className="v">#{student?.student_id}</div>
              </div>
              <div className="sd-chip">
                <div className="k">Status</div>
                <div
                  className="v"
                  style={{ color: attended ? "#1d875a" : "#9aa6bd" }}
                >
                  {attended ? "Present" : "Pending"}
                </div>
              </div>
            </div>
          </div>

          {/* main */}
          <div className="sd-main">
            <div className={"sd-status " + (attended ? "present" : "pending")}>
              {attended && (
                <img className="burst" src="/sticker-confetti.png" alt="" />
              )}
              <span className="badge">{attended ? "✓" : "🎓"}</span>
              <div className="txt">
                <div className="lab">Attendance Status</div>
                <div className="big">
                  {attended ? "You're Present 🎉" : "Not marked yet"}
                </div>
                <div className="sub">
                  {attended
                    ? "Your attendance has been recorded for today."
                    : "Tap the button below when you arrive at the hall."}
                </div>
              </div>
            </div>

            <button
              className={
                "ksu-btn " + (attended ? "ksu-btn-green" : "ksu-btn-primary")
              }
              onClick={markAttendance}
              disabled={attended}
              style={{ fontSize: 19, padding: 20 }}
            >
              {attended ? "🎉  Attendance Recorded" : "Mark My Attendance"}
            </button>

            <div className="sd-card sd-count">
              <div className="top">
                <div className="title">Ceremony attendance</div>
                <div className="num">
                  {present} / {total}
                </div>
              </div>
              <div className="sd-bar">
                <i style={{ width: pct + "%" }} />
              </div>
              <div className="note">
                {present > 0 ? (
                  <>
                    You're one of <strong>{present}</strong> graduates already
                    checked in. The hall is filling up! 🎓
                  </>
                ) : (
                  <>Be the first to check in for today's ceremony! 🎓</>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
