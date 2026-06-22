import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserCheck,
  UserX,
  BarChart3,
  Sheet,
  LogOut,
} from "lucide-react";
import "../Styles/admin.css";

export default function Sidebar({ presentCount, absentCount }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/admin");
  };

  return (
    <aside className="adm-side">
      <img
        className="adm-logo"
        src="/kus-logo.png"
        alt="King Saud University"
      />

      <div className="adm-menu-label">Menu</div>

      <NavLink to="/dashboard" className="adm-nav">
        <LayoutDashboard size={19} /> <span>Overview</span>
      </NavLink>

      <NavLink to="/present" className="adm-nav">
        <UserCheck size={19} />
        <span>Attending Students</span>
        {presentCount != null && (
          <span className="badge green">{presentCount}</span>
        )}
      </NavLink>

      <NavLink to="/absent" className="adm-nav">
        <UserX size={19} />
        <span>Absent Students</span>
        {absentCount != null && (
          <span className="badge gold">{absentCount}</span>
        )}
      </NavLink>

      <NavLink to="/charts" className="adm-nav">
        <BarChart3 size={19} /> <span>Charts</span>
      </NavLink>

      <NavLink to="/excel" className="adm-nav">
        <Sheet size={19} /> <span>Excel Sheet</span>
      </NavLink>

      <div className="adm-foot">
        <button className="adm-logout" onClick={logout}>
          <LogOut size={19} /> <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
