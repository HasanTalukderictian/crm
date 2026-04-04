import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../src/assets/css/Sidebar.scss";

export const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [header, setHeader] = useState(null); // API data
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("userRole");
    navigate("/admin");
  };

  const fetchHeader = async () => {
    try {
      const res = await axios.get(`${API_BASE}/get-header`);
      if (res.data.status && res.data.data.length > 0) {
        setHeader(res.data.data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch header:", err);
    }
  };

  useEffect(() => {
    fetchHeader();
  }, []);

  // Get user role from localStorage
  const userRole = localStorage.getItem("userRole"); // "admin" or "user"

  // Sidebar links
  const links = [
    { to: "/admin-home", icon: "bi-speedometer2", label: "Dashboard", roles: ["admin", "user"] },
    { to: "/admin-visa", icon: "bi bi-passport", label: "Visa Management", roles: ["admin", "user"] },
    { to: "/admin-users", icon: "bi-people", label: "User Settings", roles: ["admin"] },
    { to: "/admin-team", icon: "bi-person", label: "Sales Person", roles: ["admin", "user"] },
    { to: "/admin-depart", icon: "bi-diagram-3", label: "Department", roles: ["admin", "user"] },
    { to: "/admin-settings", icon: "bi-globe", label: "Country Settings", roles: ["admin", "user"] },
    { to: "/admin-target", icon: "bi-bullseye", label: "Target", roles: ["admin", "user"] },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="menu-btn d-lg-none" onClick={toggleSidebar}>
        ☰
      </button>

      {/* Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay d-lg-none" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar */}
      <div className={`sidebar-container ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header d-flex align-items-center mb-3">
          {header?.image && (
            <img
              src={header.image}
              alt="Company Logo"
              style={{
                width: "40px",
                height: "40px",
                objectFit: "cover",
                borderRadius: "4px",
                marginRight: "8px",
              }}
            />
          )}
          <h4 style={{ fontSize: "20px", margin: 0, color: "white" }}>
            {header?.company_name}
          </h4>
        </div>

        <ul className="nav flex-column">
          {links
            .filter((link) => link.roles.includes(userRole)) // role-based filter
            .map((item, index) => (
              <li key={index} className="nav-item">
                <NavLink
                  to={item.to}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active-sidebar" : ""}`
                  }
                >
                  <i className={`bi ${item.icon}`}></i>
                  {item.label}
                </NavLink>
              </li>
            ))}

          {/* Logout */}
          <button onClick={handleLogout} className="nav-link logout-btn">
            <i className="bi bi-box-arrow-right"></i>
            Logout
          </button>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;