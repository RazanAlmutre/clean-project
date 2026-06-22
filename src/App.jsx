import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import StudentLogin from "./pages/StudentLogin";
import StudentDashboard from "./pages/StudentDashboard";

import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import PresentStudents from "./pages/PresentStudents";
import AbsentStudents from "./pages/AbsentStudents";
import Charts from "./pages/Charts";
import ExcelUpload from "./pages/ExcelUpload";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student" element={<StudentDashboard />} />

        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/present" element={<PresentStudents />} />
        <Route path="/absent" element={<AbsentStudents />} />
        <Route path="/charts" element={<Charts />} />
        <Route path="/excel" element={<ExcelUpload />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
