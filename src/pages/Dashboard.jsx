import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";
import CapAvatar from "../components/CapAvatar";
import Confetti from "../components/Confetti";
import { Search } from "lucide-react";
import "../Styles/admin.css";

export default function Dashboard() {
  const [total, setTotal] = useState(0);
  const [recent, setRecent] = useState([]); // every check-in, newest first
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [absentList, setAbsentList] = useState([]);
  const [pickId, setPickId] = useState("");
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    load();
    loadAbsent();
  }, []);

  // list of students who have NOT checked in yet
  const loadAbsent = async () => {
    let all = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
      const { data } = await supabase
        .from("students")
        .select("id, student_id, student_name, degree")
        .order("student_name", { ascending: true })
        .range(from, from + pageSize - 1);
      all = [...all, ...(data || [])];
      if (!data || data.length < pageSize) break;
      from += pageSize;
    }
    const { data: att } = await supabase
      .from("attendance")
      .select("student_id");
    const presentIds = new Set((att || []).map((a) => Number(a.student_id)));
    setAbsentList(all.filter((s) => !presentIds.has(Number(s.id))));
  };

  // manually mark a not-yet-arrived student as attended
  const markPresent = async () => {
    if (!pickId) return;
    setMarking(true);
    const { error } = await supabase
      .from("attendance")
      .upsert(
        { student_id: Number(pickId) },
        { onConflict: "student_id,attendance_date" },
      );
    setMarking(false);
    if (error) {
      alert(error.message);
      return;
    }
    setPickId("");
    await load();
    await loadAbsent();
  };

  const load = async () => {
    setLoading(true);

    const { count: totalCount } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true });

    // every attendance row, newest first
    const { data: att } = await supabase
      .from("attendance")
      .select("student_id, attendance_date, created_at")
      .order("created_at", { ascending: false });

    const rows = att || [];

    // enrich with student name / serial / degree
    const ids = [...new Set(rows.map((a) => a.student_id))];
    let byId = {};
    if (ids.length) {
      const { data: studs } = await supabase
        .from("students")
        .select("*")
        .in("id", ids);
      (studs || []).forEach((s) => {
        byId[Number(s.id)] = s;
      });
    }
    const enriched = rows.map((a) => {
      const s = byId[Number(a.student_id)] || {};

      const when = a.created_at ? new Date(a.created_at) : null;

      if (when) {
        when.setHours(when.getHours() );
      }
      console.log("created_at =", a.created_at);

      const time = when
        ? when.toLocaleTimeString("en-SA", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        : "";

      return {
        id: a.student_id,
        name: s.student_name || "Graduate",
        serial: s.student_id || "—",
        degree: s.degree || "—",
        time,
      };
    });

    setTotal(totalCount || 0);
    setRecent(enriched);
    setLoading(false);
  };

  const present = recent.length;
  const absent = Math.max(0, total - present);
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;
  const adminName = localStorage.getItem("adminName") || "Admin";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recent;
    return recent.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(q) ||
        String(s.serial || "")
          .toLowerCase()
          .includes(q),
    );
  }, [recent, query]);

  return (
    <div className="adm-shell">
      <Sidebar presentCount={present} absentCount={absent} />

      <main className="adm-main">
        <header className="adm-header">
          <div>
            <h1>Welcome back, {adminName} 🎓</h1>
            <p>Graduation Attendance · Overview · Class of 2026</p>
          </div>
          <span className="adm-live">
            <span className="dot" />
            LIVE
          </span>
        </header>

        <div className="adm-body">
          <Confetti count={18} />
          <div className="adm-stats">
            <div className="adm-stat">
              <span className="ic ic-blue">∑</span>
              <div>
                <div className="k">Total Students</div>
                <div className="v v-blue">{total.toLocaleString()}</div>
              </div>
            </div>
            <div className="adm-stat">
              <span className="ic ic-green">✓</span>
              <div>
                <div className="k">Present</div>
                <div className="v v-green">{present.toLocaleString()}</div>
              </div>
            </div>
            <div className="adm-stat">
              <span className="ic ic-amber">•</span>
              <div>
                <div className="k">Absent</div>
                <div className="v v-amber">{absent.toLocaleString()}</div>
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
                {present.toLocaleString()} of {total.toLocaleString()} graduates
                checked in
              </div>
            </div>
          </div>

                    {/* manual mark-present */}
          <div
            className="adm-panel"
            style={{ flex: "none", marginTop: 20, padding: "18px 22px" }}
          >
            <div className="adm-panel-title" style={{ marginBottom: 14 }}>
              Mark a student as attended{" "}
              <span>· {absentList.length} not arrived</span>
            </div>
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <select
                value={pickId}
                onChange={(e) => setPickId(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 240,
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid #dbe8f6",
                  background: "#f3f8fe",
                  color: "#34415c",
                  fontSize: 14,
                  fontFamily: "var(--font-body)",
                }}
              >
                <option value="">Select a not-yet-arrived student…</option>
                {absentList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.student_name} · #{s.student_id}
                    {s.degree ? " · " + s.degree : ""}
                  </option>
                ))}
              </select>
              <button
                className="ksu-btn ksu-btn-green"
                style={{ width: "auto", padding: "12px 20px" }}
                onClick={markPresent}
                disabled={!pickId || marking}
              >
                {marking ? "Saving…" : "Mark as attended"}
              </button>
            </div>
          </div>

          {/* big recent check-ins panel */}
          <div className="adm-panel">
            <div className="adm-panel-head">
              <div className="adm-panel-title">
                Recent check-ins <span>· {filtered.length}</span>
              </div>
              <div className="adm-tools">
                <div className="adm-search">
                  <Search size={16} color="#9aa6bd" />
                  <input
                    placeholder="Search by name or serial…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="adm-row-head r6">
              <span />
              <span>Name</span>
              <span>Serial</span>
              <span>Degree</span>
              <span>Status</span>
              <span>Time</span>
            </div>

            <div className="adm-rows ksu-scroll">
              {loading ? (
                <div className="adm-loading">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="adm-empty">
                  {query ? "No matches found" : "No check-ins yet"}
                </div>
              ) : (
                filtered.map((s, i) => (
                  <div key={s.id + "-" + i} className="adm-row r6">
                    <CapAvatar name={s.name} size={42} />
                    <span className="nm">{s.name}</span>
                    <span className="sr">#{s.serial}</span>
                    <span className="cl">{s.degree}</span>
                    <span className="pill-present">
                      <span className="dot" />
                      Present
                    </span>
                    <span className="sr tm" style={{ color: "#ee0703" }}>
                      {s.time}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
