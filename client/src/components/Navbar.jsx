import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="brand-lockup">
        <span className="brand-mark">SS</span>
        <div>
          <p className="eyebrow">ScholasticaStars</p>
          <h1>Student learning space</h1>
        </div>
      </div>

      <nav className="top-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/live-classes">Live classes</NavLink>
        <NavLink to="/payments">Payments</NavLink>
        <NavLink to="/profile">Profile</NavLink>
      </nav>

      <div className="user-actions">
        <div className="user-chip">
          <span>{user?.name?.[0] || "S"}</span>
          <div>
            <strong>{user?.name}</strong>
            <p>{user?.studentId}</p>
          </div>
        </div>
        <button className="button button-secondary" onClick={handleLogout} type="button">
          Log out
        </button>
      </div>
    </header>
  );
}
