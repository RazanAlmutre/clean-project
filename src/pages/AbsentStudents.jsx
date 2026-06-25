import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import Sidebar from "../components/Sidebar";
import CapAvatar from "../components/CapAvatar";
import Confetti from "../components/Confetti";
import "../Styles/admin.css";

const PAGE_SIZE = 20;

export default function AbsentStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [markingId, setMarkingId] = useState(null);
  

  useEffect(() => {
    fetchAbsentStudents(true);

    const interval = setInterval(() => {
      fetchAbsentStudents(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchAbsentStudents = async (showLoading = true) => {
    if (showLoading) setLoading(true);

    let allStudents = [];
    let from = 0;
    const pageSize = 1000;

    while (true) {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("id", { ascending: true })
        .range(from, from + pageSize - 1);

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      allStudents = [...allStudents, ...(data || [])];

      if (!data || data.length < pageSize) break;
      from += pageSize;
    }

    const { data: attendanceData, error: attErr } = await supabase
      .from("attendance")
      .select("student_id");

    if (attErr) {
      alert(attErr.message);
      setLoading(false);
      return;
    }

    const presentIds = new Set(
      (attendanceData || []).map((i) => Number(i.student_id))
    );

    const absent = allStudents.filter((s) => !presentIds.has(Number(s.id)));

    setTotal(allStudents.length);
    setStudents(absent);

    setCurrentPage((page) => {
      const newTotalPages = Math.max(1, Math.ceil(absent.length / PAGE_SIZE));
      return Math.min(page, newTotalPages);
    });

    setLoading(false);
  };

  const markPresent = async (studentDbId) => {
    setMarkingId(studentDbId);

    // absent students have no attendance row yet, so a plain insert works
    // (only needs the INSERT policy — avoids the upsert/UPDATE-policy issue)
    const { error } = await supabase.from("attendance").insert({
      student_id: Number(studentDbId),
    });

    setMarkingId(null);

    // 23505 = duplicate (already present) → treat as success
    if (error && error.code !== "23505") {
      alert(error.message);
      return;
    }

    // remove immediately, then refresh from the server
    setStudents((prev) => prev.filter((s) => s.id !== studentDbId));
    await fetchAbsentStudents(false);
  };

  const handleStatusChange = (student, value) => {
    if (value !== "present") return;
    markPresent(student.id);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;

    return students.filter(
      (s) =>
        (s.student_name || "").toLowerCase().includes(q) ||
        String(s.student_id || "").toLowerCase().includes(q)
    );
  }, [students, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const firstItem =
    filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(currentPage * PAGE_SIZE, filtered.length);

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(1, page - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="adm-shell">
      <Sidebar
        presentCount={total - students.length}
        absentCount={students.length}
      />

      <main className="adm-main adm-list-main">
        <header className="adm-header">
          <div>
            <h1>Absent Students</h1>
            <p>Graduates who have not checked in yet · Class of 2026</p>
          </div>

          <span className="adm-live">
            <span className="dot" />
            LIVE
          </span>
        </header>

        <div className="adm-body adm-list-body">
          <Confetti count={18} />

          <div className="adm-stats">
            <div className="adm-stat">
              <span className="ic ic-amber">•</span>
              <div>
                <div className="k">Absent</div>
                <div className="v v-amber">
                  {students.length.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="adm-stat">
              <span className="ic ic-green">✓</span>
              <div>
                <div className="k">Attending</div>
                <div className="v v-green">
                  {Math.max(0, total - students.length).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="adm-stat">
              <span className="ic ic-blue">∑</span>
              <div>
                <div className="k">Total</div>
                <div className="v v-blue">{total.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="adm-panel adm-list-panel">
            <div className="adm-panel-head">
              <div className="adm-panel-title">
                Not yet arrived <span>· {filtered.length}</span>
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

            <div className="adm-row-head">
              <span />
              <span>Name</span>
              <span>Serial</span>
              <span>Degree</span>
              <span>Status</span>
            </div>

            <div className="adm-rows ksu-scroll no-inner-scroll">
              {loading ? (
                <div className="adm-loading">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="adm-empty">
                  {query ? "No matches found" : "Everyone is here 🎉"}
                </div>
              ) : (
                paginatedStudents.map((s) => (
                  <div key={s.id} className="adm-row">
                    <CapAvatar name={s.student_name} size={40} tone="amber" />

                    <span className="nm" style={{ color: "#5a6b86" }}>
                      {s.student_name}
                    </span>

                    <span className="sr">#{s.student_id}</span>

                    <span className="cl">{s.degree || "—"}</span>

                    <select
                      value="not_yet"
                      onChange={(e) => handleStatusChange(s, e.target.value)}
                      disabled={markingId === s.id}
                      className="pill-absent"
                      style={{
                        border: "none",
                        outline: "none",
                        cursor: markingId === s.id ? "not-allowed" : "pointer",
                      }}
                    >
                      <option value="not_yet">
                        {markingId === s.id ? "Saving..." : "Not yet"}
                      </option>
                      <option value="present">Present</option>
                    </select>
                  </div>
                ))
              )}
            </div>

            {!loading && filtered.length > 0 && (
              <div className="adm-pagination">
                <p>
                  Showing <strong>{firstItem}</strong>–
                  <strong>{lastItem}</strong> of{" "}
                  <strong>{filtered.length}</strong> students
                </p>

                <div className="adm-page-controls">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  <span>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
