import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, FaChartLine, FaUsers, FaSignOutAlt, 
  FaThLarge, FaPassport, FaBuilding, FaGlobe, FaBullseye, FaUserTie 
} from 'react-icons/fa';

const Menu = ({ isOpen, darkMode }) => {
  const location = useLocation();
  const navigate = useNavigate();



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

  const navItemStyle = (path, isLogout = false) => {
    const isActive = location.pathname === path;
    return {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 25px',
      textDecoration: 'none',
      transition: '0.2s',
      color: isLogout
        ? '#dc3545'
        : (isActive
            ? '#0d6efd'
            : (darkMode ? '#adb5bd' : '#495057')),
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

      {/* Sidebar Header */}
      <div
        className="p-3 mb-2 border-bottom d-flex align-items-center justify-content-center"
        style={{ minHeight: '70px' }}
      >
        {isOpen ? (
          <h4 className={`mb-0 fw-bold ${darkMode ? 'text-white' : 'text-primary'}`}>
            Admin Panel
          </h4>
        ) : (
          <FaThLarge size={24} className={darkMode ? 'text-white' : 'text-primary'} />
        )}
      </div>

      {/* Main Navigation */}
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

        <Link to="/admin/v1/user" style={navItemStyle('/admin/v1/user')} className="nav-hover-effect">
          <FaUsers size={20} className="min-w-icon" />
          {isOpen && <span className="ms-3 fw-medium">User Management</span>}
        </Link>

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

 

      {/* Custom Styles */}
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