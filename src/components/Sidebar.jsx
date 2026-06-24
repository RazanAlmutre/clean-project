import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserCheck,
  UserX,
  BarChart3,
  Sheet,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import "../Styles/admin.css";

export default function Sidebar({ presentCount, absentCount }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const logout = () => {
    localStorage.clear();
    navigate("/admin");
  };

  return (
    <>
      <button
        className="adm-burger"
        style={{ display: open ? "none" : undefined }}
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      <div className={"adm-scrim" + (open ? " show" : "")} onClick={close} />

      <aside className={"adm-side" + (open ? " open" : "")}>
        <button className="adm-side-close" onClick={close} aria-label="Close menu">
          <X size={20} />
        </button>

        <img className="adm-logo" src="/ksu-logo.png" alt="King Saud University" />

        <div className="adm-menu-label">Menu</div>

        <NavLink to="/dashboard" className="adm-nav" onClick={close}>
          <LayoutDashboard size={19} /> <span>Overview</span>
        </NavLink>

        <NavLink to="/present" className="adm-nav" onClick={close}>
          <UserCheck size={19} />
          <span>Attending Students</span>
          {presentCount != null && <span className="badge green">{presentCount}</span>}
        </NavLink>

        <NavLink to="/absent" className="adm-nav" onClick={close}>
          <UserX size={19} />
          <span>Absent Students</span>
          {absentCount != null && <span className="badge gold">{absentCount}</span>}
        </NavLink>

        <NavLink to="/charts" className="adm-nav" onClick={close}>
          <BarChart3 size={19} /> <span>Charts</span>
        </NavLink>

        <NavLink to="/excel" className="adm-nav" onClick={close}>
          <Sheet size={19} /> <span>Excel Sheet</span>
        </NavLink>

        <div className="adm-foot">
          <button className="adm-logout" onClick={logout}>
            <LogOut size={19} /> <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
