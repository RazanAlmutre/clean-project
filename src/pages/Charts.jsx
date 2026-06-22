import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";
import Confetti from "../components/Confetti";
import "../Styles/admin.css";

export default function Charts() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let all = [];
      let from = 0;
      const pageSize = 1000;
      while (true) {
        const { data } = await supabase
          .from("students")
          .select("*")
          .order("id", { ascending: true })
          .range(from, from + pageSize - 1);
        all = [...all, ...(data || [])];
        if (!data || data.length < pageSize) break;
        from += pageSize;
      }
      const { data: att } = await supabase
        .from("attendance")
        .select("student_id");
      setStudents(all);
      setAttendance(att || []);
      setLoading(false);
    })();
  }, []);

  const { present, absent, total, rate, byDegree } = useMemo(() => {
    const ids = new Set(attendance.map((a) => Number(a.student_id)));
    const present = students.filter((s) => ids.has(Number(s.id))).length;
    const total = students.length;
    const absent = total - present;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    const groups = {};
    students.forEach((s) => {
      const d = s.degree || "Other";
      groups[d] = groups[d] || { degree: d, total: 0, present: 0 };
      groups[d].total += 1;
      if (ids.has(Number(s.id))) groups[d].present += 1;
    });
    const byDegree = Object.values(groups)
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    return { present, absent, total, rate, byDegree };
  }, [students, attendance]);

  const ringDeg = Math.round((rate / 100) * 360);

  return (
    <div className="adm-shell">
      <Sidebar presentCount={present} absentCount={absent} />

      <main className="adm-main">
        <header className="adm-header">
          <div>
            <h1>Charts</h1>
            <p>Attendance insights · Class of 2026</p>
          </div>
          <span className="adm-live">
            <span className="dot" />
            LIVE
          </span>
        </header>

        <div className="adm-body">
          <Confetti count={18} />
          {loading ? (
            <div className="adm-loading">Loading…</div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "300px 1fr",
                gap: 20,
                minHeight: 0,
              }}
            >
              {/* rate ring */}
              <div
                className="sd-card"
                style={{
                  padding: 28,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  className="adm-panel-title"
                  style={{ alignSelf: "flex-start" }}
                >
                  Overall attendance
                </div>
                <div
                  style={{
                    marginTop: 18,
                    width: 180,
                    height: 180,
                    borderRadius: "50%",
                    background: `conic-gradient(#39c07a 0 ${ringDeg}deg, #e9f0f9 ${ringDeg}deg 360deg)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 126,
                      height: 126,
                      borderRadius: "50%",
                      background: "#fff",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-head)",
                        fontWeight: 800,
                        fontSize: 38,
                        color: "#0B2A5E",
                      }}
                    >
                      {rate}%
                    </div>
                    <div style={{ fontSize: 12, color: "#9aa6bd" }}>
                      present
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 20,
                    marginTop: 20,
                    fontSize: 13,
                    color: "#5a6b86",
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: "#39c07a",
                      }}
                    />
                    {present}
                  </span>
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: "#e9f0f9",
                      }}
                    />
                    {absent}
                  </span>
                </div>
              </div>

              {/* by degree */}
              <div
                className="sd-card"
                style={{ padding: 28, overflow: "hidden" }}
              >
                <div className="adm-panel-title">Attendance by degree</div>
                <div
                  className="ksu-scroll"
                  style={{
                    marginTop: 18,
                    maxHeight: 400,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  {byDegree.map((g) => {
                    const pct =
                      g.total > 0 ? Math.round((g.present / g.total) * 100) : 0;
                    return (
                      <div key={g.degree}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 13.5,
                            color: "#34415c",
                            marginBottom: 7,
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>{g.degree}</span>
                          <span style={{ color: "#9aa6bd" }}>
                            {g.present}/{g.total} · {pct}%
                          </span>
                        </div>
                        <div
                          style={{
                            height: 14,
                            borderRadius: 8,
                            background: "#eef2f7",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: pct + "%",
                              borderRadius: 8,
                              background:
                                "linear-gradient(90deg,#4a90d9,#0B3D91)",
                              transition: "width .9s ease",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {byDegree.length === 0 && (
                    <div className="adm-empty">No data yet</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
