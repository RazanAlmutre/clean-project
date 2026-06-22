import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const isAdmin = localStorage.getItem("admin") === "true";

  return isAdmin ? children : <Navigate to="/" />;
}
