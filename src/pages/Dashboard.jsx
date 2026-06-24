import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";
import CapAvatar from "../components/CapAvatar";
import Confetti from "../components/Confetti";
import { Search } from "lucide-react";
import "../Styles/admin.css";

export default function Dashboard() {
  const [total, setTotal] = useState(0);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    load(true);

    const interval = setInterval(() => {
      load(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const load = async (showLoading = true) => {
    if (showLoading) setLoading(true);

    const { count: totalCount } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true });

    const { data: att } = await supabase
      .from("attendance")
      .select("student_id, attendance_date, created_at")
      .order("created_at", { ascending: false });

    const rows = att || [];
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

      const time = when
        ? when.toLocaleTimeString("en-SA", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        : "";

       // Present from 8:00 AM to 12:30 PM; anyone outside that window is "Late"
      const mins = when ? when.getHours() * 60 + when.getMinutes() : 0;
      const late = when ? mins < 8 * 60 || mins > 12 * 60 + 30 : false;

      return {
        id: a.student_id,
        name: s.student_name || "Graduate",
        serial: s.student_id || "—",
        degree: s.degree || "—",
        time,
        late,
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
        String(s.serial || "").toLowerCase().includes(q)
    );
  }, [recent, query]);

  return (
    <div className="adm-shell">
      <Sidebar presentCount={present} absentCount={absent} />

      <main className="adm-main">
        <header className="adm-header">
          <div>
            <h1>Welcome back, {adminName} </h1>
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

                     {s.late ? (
                      <span
                        className="pill-absent"
                        style={{ color: "#c2410c", background: "#fde9d8" }}
                      >
                        Late
                      </span>
                    ) : (
                      <span className="pill-present">
                        <span className="dot" />
                        Present
                      </span>
                    )}

                    <span className="sr tm" style={{ color: "#0B2A5E" }}>
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
