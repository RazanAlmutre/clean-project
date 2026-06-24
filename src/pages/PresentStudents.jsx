import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import Sidebar from "../components/Sidebar";
import CapAvatar from "../components/CapAvatar";
import Confetti from "../components/Confetti";
import "../Styles/admin.css";

const PAGE_SIZE = 20;

export default function PresentStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  useEffect(() => {
    fetchPresentStudents(true);

    const interval = setInterval(() => {
      fetchPresentStudents(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchPresentStudents = async (showLoading = true) => {
    if (showLoading) setLoading(true);

    const { count, error: countError } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true });

    if (countError) {
      alert(countError.message);
      setLoading(false);
      return;
    }

    setTotal(count || 0);

    const { data: attendanceData, error } = await supabase
      .from("attendance")
      .select("student_id, attendance_date");

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const ids = [
      ...new Set((attendanceData || []).map((i) => Number(i.student_id))),
    ];

    if (ids.length === 0) {
      setStudents([]);
      setCurrentPage(1);
      setLoading(false);
      return;
    }

    const timeById = {};

    (attendanceData || []).forEach((a) => {
      timeById[Number(a.student_id)] = a.attendance_date;
    });

    const { data: studentsData, error: studentsError } = await supabase
      .from("students")
      .select("*")
      .in("id", ids)
      .order("id", { ascending: true });

    if (studentsError) {
      alert(studentsError.message);
      setLoading(false);
      return;
    }

    const enriched = (studentsData || []).map((s) => ({
      ...s,
      when: timeById[Number(s.id)],
    }));

    setStudents(enriched);

    setCurrentPage((page) => {
      const newTotalPages = Math.max(
        1,
        Math.ceil(enriched.length / PAGE_SIZE)
      );
      return Math.min(page, newTotalPages);
    });

    setLoading(false);
  };

  const openDeleteModal = (studentDbId) => {
    setSelectedStudentId(studentDbId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setSelectedStudentId(null);
    setShowDeleteModal(false);
  };

  const deleteAttendance = async () => {
    if (!selectedStudentId) return;

    const { error } = await supabase
      .from("attendance")
      .delete()
      .eq("student_id", selectedStudentId);

    if (error) {
      alert(error.message);
      return;
    }

    setStudents((prev) => prev.filter((s) => s.id !== selectedStudentId));

    closeDeleteModal();
    await fetchPresentStudents(false);
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
        presentCount={students.length}
        absentCount={total - students.length}
      />

      <main className="adm-main adm-list-main">
        <header className="adm-header">
          <div>
            <h1>Attending Students 🎓</h1>
            <p>Graduates who have checked in · Class of 2026</p>
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
              <span className="ic ic-green">✓</span>
              <div>
                <div className="k">Attending</div>
                <div className="v v-green">
                  {students.length.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="adm-stat">
              <span className="ic ic-amber">•</span>
              <div>
                <div className="k">Absent</div>
                <div className="v v-amber">
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
                All attending graduates <span>· {filtered.length}</span>
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
                  {query ? "No matches found" : "No attending students yet"}
                </div>
              ) : (
                paginatedStudents.map((s) => (
                  <div key={s.id} className="adm-row">
                    <CapAvatar name={s.student_name} size={40} />

                    <span className="nm">{s.student_name}</span>
                    <span className="sr">#{s.student_id}</span>
                    <span className="cl">{s.degree || "—"}</span>

                    <div className="present-action">
                      <span className="pill-present">
                        <span className="dot" />
                        Present
                      </span>

                      <button
                        className="remove-attendance"
                        onClick={() => openDeleteModal(s.id)}
                        title="Remove attendance"
                      >
                        <X size={16} strokeWidth={2.5} />
                      </button>
                    </div>
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

      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3>Are you sure?</h3>

            <p>Do you want to remove this student's attendance?</p>

            <div className="delete-modal-actions">
              <button className="cancel-btn" onClick={closeDeleteModal}>
                Cancel
              </button>

              <button className="confirm-btn" onClick={deleteAttendance}>
                Yes, remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
