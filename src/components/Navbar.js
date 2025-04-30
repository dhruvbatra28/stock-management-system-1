import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar({ user, logout }) {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand">Stock Manager</div>
      <ul className="nav-links">
        <li className={location.pathname === "/" ? "active" : ""}>
          <Link to="/">Dashboard</Link>
        </li>
        <li className={location.pathname === "/stock" ? "active" : ""}>
          <Link to="/stock">Stock Management</Link>
        </li>
        <li className={location.pathname === "/billing" ? "active" : ""}>
          <Link to="/billing">Billing</Link>
        </li>
      </ul>
      <div className="navbar-user">
        <span>Welcome, {user?.name}</span>
        <button onClick={logout} className="btn-logout">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
