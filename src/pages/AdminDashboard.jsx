import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";
import Sidebar from "../components/Sidebar";
import CapAvatar from "../components/CapAvatar";
import "../Styles/admin.css";

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);

    const { count } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true });

    const { data: studentsData } = await supabase
      .from("students")
      .select("*")
      .order("id", { ascending: true })
      .limit(2000);

    const { data: attendanceData } = await supabase
      .from("attendance")
      .select("*");

    setTotalStudents(count || 0);
    setStudents(studentsData || []);
    setAttendance(attendanceData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const presentIds = new Set(attendance.map((i) => Number(i.student_id)));
  const presentStudents = students.filter((s) => presentIds.has(Number(s.id)));
  const absentStudents = students.filter((s) => !presentIds.has(Number(s.id)));

  const total = totalStudents;
  const presentCount = presentStudents.length;
  const absentCount = total - presentCount;
  const rate = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  return (
    <div className="adm-shell">
      <Sidebar presentCount={presentCount} absentCount={absentCount} />

      <main className="adm-main">
        <header className="adm-header">
          <div>
            <h1>Welcome to Graduation Entry 🎓</h1>
            <p>Student Attendance Dashboard · Class of 2026</p>
          </div>
          <span className="adm-live">
            <span className="dot" />
            LIVE
          </span>
        </header>

        <div className="adm-body">
          {loading ? (
            <div className="adm-loading">Loading…</div>
          ) : (
            <>
              <div className="adm-stats">
                <div className="adm-stat">
                  <span className="ic ic-blue">
                    <Users size={22} />
                  </span>
                  <div>
                    <div className="k">Total</div>
                    <div className="v v-blue">{total.toLocaleString()}</div>
                  </div>
                </div>
                <div className="adm-stat">
                  <span className="ic ic-green">
                    <UserCheck size={22} />
                  </span>
                  <div>
                    <div className="k">Attending</div>
                    <div className="v v-green">
                      {presentCount.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="adm-stat">
                  <span className="ic ic-amber">
                    <UserX size={22} />
                  </span>
                  <div>
                    <div className="k">Absent</div>
                    <div className="v v-amber">
                      {absentCount.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="adm-progress">
                  <div className="pt">
                    <span>ATTENDANCE RATE</span>
                    <span>{rate}%</span>
                  </div>
                  <div className="track">
                    <i style={{ width: rate + "%" }} />
                  </div>
                  <div className="cap">
                    {presentCount.toLocaleString()} of {total.toLocaleString()}{" "}
                    graduates seated
                  </div>
                </div>
              </div>

              <div className="adm-cols">
                <div className="adm-list-card">
                  <div className="cap-head green">Recently Attending</div>
                  <div
                    className="adm-rows ksu-scroll"
                    style={{ maxHeight: 320 }}
                  >
                    {presentStudents.length === 0 ? (
                      <div className="adm-empty">No attending students yet</div>
                    ) : (
                      presentStudents.slice(0, 12).map((s) => (
                        <div
                          key={s.id}
                          className="adm-row"
                          style={{ gridTemplateColumns: "54px 1fr 110px" }}
                        >
                          <CapAvatar name={s.student_name} size={40} />
                          <span className="nm">{s.student_name}</span>
                          <span className="sr">#{s.student_id}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="adm-list-card">
                  <div className="cap-head amber">Not Yet Arrived</div>
                  <div
                    className="adm-rows ksu-scroll"
                    style={{ maxHeight: 320 }}
                  >
                    {absentStudents.length === 0 ? (
                      <div className="adm-empty">Everyone is here 🎉</div>
                    ) : (
                      absentStudents.slice(0, 12).map((s) => (
                        <div
                          key={s.id}
                          className="adm-row"
                          style={{ gridTemplateColumns: "54px 1fr 110px" }}
                        >
                          <CapAvatar
                            name={s.student_name}
                            size={40}
                            tone="amber"
                          />
                          <span className="nm" style={{ color: "#5a6b86" }}>
                            {s.student_name}
                          </span>
                          <span className="sr">#{s.student_id}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
