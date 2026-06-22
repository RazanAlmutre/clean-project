import { useState } from "react";
import ExcelJS from "exceljs";
import { supabase } from "../lib/supabase";
import { UploadCloud, FileSpreadsheet } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Confetti from "../components/Confetti";
import "../Styles/admin.css";

export default function ExcelUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    try {
      if (!file) {
        alert("Please select an Excel file");
        return;
      }

      setLoading(true);

      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.worksheets[0];

      if (!worksheet) {
        alert("No worksheet found");
        return;
      }

      // قراءة الهيدر
      const header1 = String(worksheet.getCell("A1").value || "").trim();
      const header2 = String(worksheet.getCell("B1").value || "").trim();
      const header3 = String(worksheet.getCell("C1").value || "").trim();

      // دعم أكثر من صيغة
      const validHeaders =
        header1.includes("student") &&
        header2.includes("name") &&
        header3.includes("degree");

      if (!validHeaders) {
        alert(
          "Invalid file format. Required: student_id, student_name, degree",
        );
        return;
      }

      const students = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;

        const student_id = row.getCell(1).value;
        const student_name = row.getCell(2).value;
        const degree = row.getCell(3).value;

        if (student_id && student_name) {
          students.push({
            student_id: String(student_id).trim(),
            student_name: String(student_name).trim(),
            degree: degree ? String(degree).trim() : null,
          });
        }
      });

      if (students.length === 0) {
        alert("No data found in file");
        return;
      }

      // إدخال البيانات
      const { error } = await supabase.from("students").upsert(students, {
        onConflict: "student_id",
      });

      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }

      alert(`Uploaded successfully: ${students.length} students`);
      setFile(null);
    } catch (err) {
      console.error(err);
      alert(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-shell">
      <Sidebar />

      <main className="adm-main">
        <header className="adm-header">
          <div>
            <h1>Excel Upload</h1>
            <p>Import students list</p>
          </div>
        </header>

        <div className="adm-body">
          <Confetti count={15} />

          <div className="adm-upload">
            <div className="adm-drop">
              <FileSpreadsheet size={30} />
              <h3>{file ? file.name : "Upload Excel file"}</h3>
              <p>.xlsx / .xls</p>

              <label className="ksu-btn ksu-btn-ghost">
                <UploadCloud size={18} /> Choose File
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  hidden
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>

              {file && (
                <div className="adm-file">
                  Selected: <strong>{file.name}</strong>
                </div>
              )}
            </div>

            <button
              className="ksu-btn ksu-btn-primary"
              onClick={handleUpload}
              disabled={loading}
              style={{ marginTop: 20 }}
            >
              {loading ? "Uploading..." : "Upload to Database"}
            </button>

            <div className="adm-hint">
              Columns must be: <code>student_id</code>,{" "}
              <code>student_name</code>, <code>degree</code>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
