import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaHome, FaUsers, 
  FaThLarge, FaPassport, FaBuilding, FaGlobe, FaBullseye, FaUserTie
} from 'react-icons/fa';

const Menu = ({ isOpen, darkMode }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // 🔹 STATE
  const [company, setCompany] = useState({});
  const [role, setRole] = useState("admin");

  // 🔹 INIT
  useEffect(() => {
    fetchHeader();
    getUserRole();
  }, []);

  // 🔹 API CALL
  const fetchHeader = async () => {
    try {
      const res = await axios.get(`${API_BASE}/get-header`);
      if (res.data.status) {
        setCompany(res.data.data[0]);
      }
    } catch (err) {
      console.log("Header API error", err);
    }
  };

  // 🔹 ROLE FIX
  const getUserRole = () => {
    const roleData = localStorage.getItem("userRole");

    if (roleData) {
      setRole(roleData.toLowerCase());
    } else {
      setRole("admin");
    }
  };

  const sidebarStyle = {
    width: isOpen ? '250px' : '75px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 1000,
    backgroundColor: darkMode ? '#1a1d20' : '#ffffff',
    borderRight: darkMode ? '1px solid #333' : '1px solid #eee',
    display: 'flex',
    flexDirection: 'column'
  };

  const navItemStyle = (path) => {
    const isActive = location.pathname === path;

    return {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 25px',
      textDecoration: 'none',
      transition: '0.2s',
      color: isActive
          ? '#0d6efd'
          : (darkMode ? '#adb5bd' : '#495057'),
      backgroundColor: isActive
        ? (darkMode ? '#2c3034' : '#f8f9fa')
        : 'transparent',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      width: '100%'
    };
  };

  return (
    <div style={sidebarStyle} className="shadow-sm">

      {/* 🔹 HEADER */}
      <div
        className="p-3 mb-2 border-bottom d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: '90px' }}
      >
        {/* IMAGE */}
        {company?.image ? (
          <img
            src={company.image}
            alt="logo"
            style={{
              width: '40px',
              height: '40px',
              objectFit: 'cover',
              borderRadius: '50%'
            }}
          />
        ) : (
          <FaThLarge size={24} className={darkMode ? 'text-white' : 'text-primary'} />
        )}

        {/* TITLE */}
        {isOpen && (
          <>
            <h6 className={`mt-2 mb-0 fw-bold ${darkMode ? 'text-white' : 'text-dark'}`}>
              {company?.company_name || "Company"}
            </h6>

            <small className={darkMode ? 'text-secondary' : 'text-muted'}>
              {role === "admin" ? "Admin Panel" : "User Panel"}
            </small>
          </>
        )}
      </div>

      {/* 🔹 MENU */}
      <div
        className="flex-grow-1 sidebar-scroll"
        style={{ overflowY: 'auto', overflowX: 'hidden' }}
      >

        <Link to="/admin/v1/home" style={navItemStyle('/admin/v1/home')} className="nav-hover-effect">
          <FaHome size={20} className="min-w-icon" />
          {isOpen && <span className="ms-3 fw-medium">Dashboard</span>}
        </Link>

        <Link to="/admin/v1/visa" style={navItemStyle('/admin/v1/visa')} className="nav-hover-effect">
          <FaPassport size={20} className="min-w-icon" />
          {isOpen && <span className="ms-3 fw-medium">Visa Management</span>}
        </Link>

        {/* 🔥 ADMIN ONLY */}
        {role === "admin" && (
          <Link to="/admin/v1/user" style={navItemStyle('/admin/v1/user')} className="nav-hover-effect">
            <FaUsers size={20} className="min-w-icon" />
            {isOpen && <span className="ms-3 fw-medium">User Management</span>}
          </Link>
        )}

        <Link to="/admin/v1/sales" style={navItemStyle('/admin/v1/sales')} className="nav-hover-effect">
          <FaUserTie size={20} className="min-w-icon" />
          {isOpen && <span className="ms-3 fw-medium">Sales Person</span>}
        </Link>

        <Link to="/admin/v1/dept" style={navItemStyle('/admin/v1/dept')} className="nav-hover-effect">
          <FaBuilding size={20} className="min-w-icon" />
          {isOpen && <span className="ms-3 fw-medium">Department</span>}
        </Link>

        <Link to="/admin/v1/country" style={navItemStyle('/admin/v1/country')} className="nav-hover-effect">
          <FaGlobe size={20} className="min-w-icon" />
          {isOpen && <span className="ms-3 fw-medium">Country</span>}
        </Link>

        <Link to="/admin/v1/target" style={navItemStyle('/admin/v1/target')} className="nav-hover-effect">
          <FaBullseye size={20} className="min-w-icon" />
          {isOpen && <span className="ms-3 fw-medium">Target Setting</span>}
        </Link>

      </div>

      {/* 🔹 STYLE */}
      <style>{`
        .nav-hover-effect:hover {
          background-color: ${darkMode ? '#2c3034' : '#f8f9fa'} !important;
          color: ${darkMode ? '#fff' : '#0d6efd'} !important;
        }

        .min-w-icon {
          min-width: 25px;
          display: flex;
          justify-content: center;
        }

        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#333' : '#eee'};
          border-radius: 10px;
        }
      `}</style>

    </div>
  );
};

export default Menu;