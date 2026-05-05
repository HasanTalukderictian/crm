

import  { useState, useEffect, useRef } from 'react';
import { FaMoon, FaSun, FaBars, FaUser, FaSignOutAlt } from 'react-icons/fa';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Header = ({ toggleSidebar, darkMode, setDarkMode }) => {
    const navigate = useNavigate();
    
    // User State from LocalStorage
    const userRole = localStorage.getItem("userRole") || localStorage.getItem("role");
    const userName = localStorage.getItem("userName") || "User";
    
    // Dropdown state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Modal & Data States
    const [showModal, setShowModal] = useState(false);
    const [companyName, setCompanyName] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch existing header data on modal open
    const fetchHeaderData = async () => {
        try {
            const res = await axios.get(`${API_BASE}/get-header`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`
                }
            });
            if (res.data.status && res.data.data.length > 0) {
                const headerData = res.data.data[0];
                setCompanyName(headerData.company_name || "");
                if (headerData.image) {
                    setPreview(headerData.image);
                }
            }
        } catch (err) {
            console.error("Failed to fetch header:", err);
        }
    };

    // Open modal and fetch data
    const openModal = () => {
        setShowModal(true);
        fetchHeaderData();
    };

    // Image handling
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const resetForm = () => {
        setCompanyName("");
        setImage(null);
        setPreview(null);
        setShowModal(false);
        setLoading(false);
    };

    // Submit Action (Only for Admin)
    const submitHeader = async () => {
        // Validation
        if (!companyName || companyName.trim() === "") {
            toast.error("Company Name is required!");
            return;
        }

        setLoading(true);

        const formData = new FormData();
        // FIXED: Use "company_name" instead of "Companyname"
        formData.append("company_name", companyName.trim());
        if (image) {
            formData.append("image", image);
        }

        try {
            const res = await axios.post(`${API_BASE}/add-header`, formData, {
                headers: { 
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${localStorage.getItem("authToken")}` 
                }
            });

            if (res.data.status) {
                toast.success(res.data.message || "Header updated successfully!");
                resetForm();
                // Refresh page to show updated header
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                toast.error(res.data.message || "Failed to update header.");
            }
        } catch (err) {
            console.error("API Error:", err);
            if (err.response && err.response.data) {
                const errorMsg = err.response.data.message || "Failed to update header.";
                toast.error(errorMsg);
                
                // Show individual field errors if any
                if (err.response.data.errors) {
                    Object.values(err.response.data.errors).forEach(errorArray => {
                        errorArray.forEach(error => toast.error(error));
                    });
                }
            } else {
                toast.error("Network error. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const handleLogout = () => {
        // Clear all localStorage items
        localStorage.removeItem("authToken");
        localStorage.removeItem("userInfo");
        localStorage.removeItem("userRole");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        localStorage.removeItem("name");
        
        // Close dropdown
        setIsDropdownOpen(false);
        
        // Redirect to login page
        navigate("/");
        toast.success("Logged out successfully!");
    };

    // Get profile image URL based on user name
    const profileImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0d6efd&color=fff&bold=true`;

    return (
        <>
            <nav className={`navbar sticky-top shadow-sm py-2 ${darkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-white'}`}>
                <div className="container-fluid">
                    <div className="d-flex align-items-center">
                        <button className="btn btn-outline-secondary border-0 me-2" onClick={toggleSidebar}>
                            <FaBars />
                        </button>
                    </div>

                    <div className="d-flex align-items-center">
                        {/* Dark Mode Toggle */}
                        <button 
                            className="btn btn-link nav-link me-3 text-warning border-0" 
                            onClick={() => setDarkMode(!darkMode)}
                        >
                            {darkMode ? <FaSun size={18} /> : <FaMoon size={18} className="text-dark" />}
                        </button>
                        
                        {/* User Profile Dropdown */}
                        <div className="dropdown" ref={dropdownRef}>
                            <img 
                                src={profileImageUrl}
                                className="rounded-circle cursor-pointer border shadow-sm" 
                                alt="User Profile" 
                                width="38"
                                height="38"
                                style={{ cursor: 'pointer', objectFit: 'cover' }}
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            />
                            
                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="dropdown-menu show" style={{ 
                                    position: 'absolute', 
                                    right: 0, 
                                    top: '45px',
                                    minWidth: '220px',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                    border: 'none',
                                    backgroundColor: darkMode ? '#2c3034' : '#ffffff',
                                    zIndex: 1060
                                }}>
                                    <div className="dropdown-header" style={{ 
                                        padding: '12px 16px',
                                        borderBottom: `1px solid ${darkMode ? '#444' : '#eee'}`
                                    }}>
                                        <div className="d-flex align-items-center gap-3">
                                            <img 
                                                src={profileImageUrl}
                                                className="rounded-circle"
                                                width="40"
                                                height="40"
                                                alt="Profile"
                                            />
                                            <div>
                                                <div className="fw-bold" style={{ color: darkMode ? '#fff' : '#333' }}>
                                                    {userName}
                                                </div>
                                                <small className="text-muted text-capitalize">
                                                    {userRole || 'User'}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Settings option - only for admin */}
                                    {userRole === 'admin' && (
                                        <button
                                            className="dropdown-item d-flex align-items-center gap-3"
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                openModal();
                                            }}
                                            style={{ 
                                                padding: '10px 16px',
                                                color: darkMode ? '#e9ecef' : '#333',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = darkMode ? '#3a3f44' : '#f8f9fa';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <FaUser size={16} />
                                            <span>Header Settings</span>
                                        </button>
                                    )}
                                    
                                    {/* Logout option - for both admin and user */}
                                    <button
                                        className="dropdown-item d-flex align-items-center gap-3"
                                        onClick={handleLogout}
                                        style={{ 
                                            padding: '10px 16px',
                                            color: '#dc3545',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#dc354510';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        <FaSignOutAlt size={16} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Admin Setting Modal */}
            {showModal && (
                <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.6)", zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className={`modal-content border-0 ${darkMode ? 'bg-dark text-light' : ''}`}>
                            <div className="modal-header border-bottom-0">
                                <h5 className="modal-title fw-bold">
                                    <FaUser className="me-2" />
                                    Header Settings (Admin)
                                </h5>
                                <button className={`btn-close ${darkMode ? 'btn-close-white' : ''}`} onClick={resetForm}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">
                                        Company Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${darkMode ? 'bg-secondary border-0 text-white' : ''}`}
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="Enter Company Name"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Logo/Image</label>
                                    <input
                                        type="file"
                                        className={`form-control ${darkMode ? 'bg-secondary border-0 text-white' : ''}`}
                                        onChange={handleImageChange}
                                        accept="image/*"
                                    />
                                    <small className="text-muted">Supported formats: JPG, PNG, GIF (Max 2MB)</small>
                                </div>

                                {preview && (
                                    <div className="text-center mt-3">
                                        <img src={preview} className="rounded border p-1" width="100" alt="Preview" />
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer border-top-0">
                                <button className="btn btn-secondary btn-sm" onClick={resetForm} disabled={loading}>
                                    Cancel
                                </button>
                                <button 
                                    className="btn btn-primary btn-sm px-4" 
                                    onClick={submitHeader}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
}

export default Header;