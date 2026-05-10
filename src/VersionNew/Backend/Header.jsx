
import { useState, useEffect, useRef } from 'react';
import { FaMoon, FaSun, FaBars, FaUser, FaSignOutAlt, FaBell, FaCheck, FaCheckDouble } from 'react-icons/fa';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Header = ({ toggleSidebar, darkMode, setDarkMode }) => {
    const navigate = useNavigate();
    
    // User State from LocalStorage
    const userRole = localStorage.getItem("userRole") || localStorage.getItem("role");
    const userName = localStorage.getItem("userName") || "User";
    const userId = localStorage.getItem("userId");
    
    // Dropdown state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const dropdownRef = useRef(null);
    const notificationRef = useRef(null);

    // Notification States
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [showAllNotifications, setShowAllNotifications] = useState(false);

    // Modal & Data States
    const [showModal, setShowModal] = useState(false);
    const [companyName, setCompanyName] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch Notifications
    const fetchNotifications = async () => {
        setNotificationLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const response = await axios.get(`${API_BASE}/notifications`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            console.log("API Response:", response.data); // Debug log
            
            if (response.data && response.data.status === true && response.data.data) {
                setNotifications(response.data.data);
                // Calculate unread count from your data structure
                const unread = response.data.data.filter(n => !n.is_read).length;
                setUnreadCount(unread);
            } else if (response.data && response.data.notifications) {
                // Fallback for different response structure
                setNotifications(response.data.notifications);
                const unread = response.data.notifications.filter(n => !n.is_read).length;
                setUnreadCount(unread);
            } else {
                setNotifications([]);
                setUnreadCount(0);
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
            setNotifications([]);
            setUnreadCount(0);
        } finally {
            setNotificationLoading(false);
        }
    };

    // Fetch Unread Count
    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const response = await axios.get(`${API_BASE}/notifications/unread-count`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (response.data && response.data.status === true && response.data.unread_count !== undefined) {
                setUnreadCount(response.data.unread_count);
            } else if (response.data && response.data.unread_count !== undefined) {
                setUnreadCount(response.data.unread_count);
            }
        } catch (err) {
            console.error("Failed to fetch unread count:", err);
        }
    };

    // Mark Single Notification as Read
    const markAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem("authToken");
            await axios.post(`${API_BASE}/notifications/${notificationId}/read`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Update local state
            setNotifications(prev => 
                prev.map(notif => 
                    notif.id === notificationId ? { ...notif, is_read: true } : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
            
            toast.success("Notification marked as read");
        } catch (err) {
            console.error("Failed to mark as read:", err);
            toast.error("Failed to update notification");
        }
    };

    // Mark All Notifications as Read
    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem("authToken");
            await axios.post(`${API_BASE}/notifications/read-all`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Update local state
            setNotifications(prev => 
                prev.map(notif => ({ ...notif, is_read: true }))
            );
            setUnreadCount(0);
            
            toast.success("All notifications marked as read");
        } catch (err) {
            console.error("Failed to mark all as read:", err);
            toast.error("Failed to update notifications");
        }
    };

    // Check for new notifications periodically
    useEffect(() => {
        fetchNotifications();
        
        // Poll for new notifications every 30 seconds
        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 30000);
        
        return () => clearInterval(interval);
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
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
        if (!companyName || companyName.trim() === "") {
            toast.error("Company Name is required!");
            return;
        }

        setLoading(true);

        const formData = new FormData();
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
        localStorage.removeItem("authToken");
        localStorage.removeItem("userInfo");
        localStorage.removeItem("userRole");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        localStorage.removeItem("name");
        
        setIsDropdownOpen(false);
        navigate("/");
        toast.success("Logged out successfully!");
    };

    // Get profile image URL
    const profileImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0d6efd&color=fff&bold=true`;

    // Format notification time
    const formatTime = (dateString) => {
        if (!dateString) return 'Just now';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    // Get notification icon based on type (handles missing type field)
    const getNotificationIcon = (notification) => {
        // If type exists, use it; otherwise return default bell icon
        if (notification.type) {
            switch(notification.type) {
                case 'user':
                    return <FaUser className="text-info" />;
                case 'system':
                    return <FaBell className="text-warning" />;
                case 'alert':
                    return <FaBell className="text-danger" />;
                default:
                    return <FaBell className="text-primary" />;
            }
        }
        return <FaBell className="text-primary" />;
    };

    return (
        <>
            <nav className={`navbar sticky-top shadow-sm py-2 ${darkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-white'}`}>
                <div className="container-fluid">
                    <div className="d-flex align-items-center">
                        <button className="btn btn-outline-secondary border-0 me-2" onClick={toggleSidebar}>
                            <FaBars />
                        </button>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        {/* Notification Bell */}
                        <div className="position-relative" ref={notificationRef}>
                            <button 
                                className="btn btn-link nav-link position-relative border-0"
                                onClick={() => {
                                    setIsNotificationOpen(!isNotificationOpen);
                                    if (!isNotificationOpen) {
                                        fetchNotifications();
                                    }
                                }}
                                style={{ color: darkMode ? '#fff' : '#333' }}
                            >
                                <FaBell size={18} />
                                {unreadCount > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" 
                                          style={{ fontSize: '10px', marginTop: '-5px', marginLeft: '-10px' }}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {isNotificationOpen && (
                                <div className="dropdown-menu show" style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '40px',
                                    width: '380px',
                                    maxHeight: '500px',
                                    overflow: 'hidden',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                    border: 'none',
                                    backgroundColor: darkMode ? '#2c3034' : '#ffffff',
                                    zIndex: 1060,
                                    padding: 0
                                }}>
                                    {/* Header */}
                                    <div className="d-flex justify-content-between align-items-center p-3 border-bottom" 
                                         style={{ borderBottomColor: darkMode ? '#444' : '#eee' }}>
                                        <h6 className="mb-0 fw-bold" style={{ color: darkMode ? '#fff' : '#333' }}>
                                            <FaBell className="me-2" />
                                            Notifications
                                        </h6>
                                        {unreadCount > 0 && (
                                            <button 
                                                className="btn btn-sm btn-link text-decoration-none"
                                                onClick={markAllAsRead}
                                                style={{ fontSize: '12px' }}
                                            >
                                                <FaCheckDouble className="me-1" />
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>

                                    {/* Notifications List */}
                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {notificationLoading ? (
                                            <div className="text-center py-4">
                                                <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                <p className="mt-2 text-muted small">Loading notifications...</p>
                                            </div>
                                        ) : notifications.length === 0 ? (
                                            <div className="text-center py-5">
                                                <FaBell size={40} className="text-muted mb-2" />
                                                <p className="text-muted mb-0">No notifications yet</p>
                                                <small className="text-muted">You're all caught up!</small>
                                            </div>
                                        ) : (
                                            <>
                                                {notifications.slice(0, showAllNotifications ? undefined : 5).map((notification) => (
                                                    <div 
                                                        key={notification.id}
                                                        className={`p-3 border-bottom ${!notification.is_read ? 'bg-light' : ''}`}
                                                        style={{ 
                                                            borderBottomColor: darkMode ? '#444' : '#eee',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            backgroundColor: !notification.is_read 
                                                                ? (darkMode ? '#3a3f44' : '#f8f9fa')
                                                                : (darkMode ? '#2c3034' : 'transparent')
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = darkMode ? '#3e4348' : '#f1f3f5';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = !notification.is_read 
                                                                ? (darkMode ? '#3a3f44' : '#f8f9fa')
                                                                : (darkMode ? '#2c3034' : 'transparent');
                                                        }}
                                                    >
                                                        <div className="d-flex gap-3">
                                                            <div className="flex-shrink-0">
                                                                <div className="rounded-circle bg-primary bg-opacity-10 p-2" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    {getNotificationIcon(notification)}
                                                                </div>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <div className="d-flex justify-content-between align-items-start">
                                                                    <div className="flex-grow-1">
                                                                        <p className="mb-1 small" style={{ color: darkMode ? '#fff' : '#333', fontWeight: !notification.is_read ? '600' : 'normal' }}>
                                                                            {notification.message}
                                                                        </p>
                                                                        <small className="text-muted" style={{ fontSize: '11px' }}>
                                                                            {formatTime(notification.created_at)}
                                                                        </small>
                                                                    </div>
                                                                    {!notification.is_read && (
                                                                        <button
                                                                            className="btn btn-sm btn-link p-0 ms-2"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                markAsRead(notification.id);
                                                                            }}
                                                                            style={{ fontSize: '12px', textDecoration: 'none' }}
                                                                        >
                                                                            <FaCheck size={12} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {notifications.length > 5 && !showAllNotifications && (
                                                    <div className="p-2 text-center border-top" style={{ borderTopColor: darkMode ? '#444' : '#eee' }}>
                                                        <button
                                                            className="btn btn-sm btn-link text-decoration-none"
                                                            onClick={() => setShowAllNotifications(true)}
                                                        >
                                                            View all {notifications.length} notifications
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {notifications.length > 0 && showAllNotifications && (
                                        <div className="p-2 text-center border-top" style={{ borderTopColor: darkMode ? '#444' : '#eee' }}>
                                            <button
                                                className="btn btn-sm btn-link text-decoration-none"
                                                onClick={() => setShowAllNotifications(false)}
                                            >
                                                Show less
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Dark Mode Toggle */}
                        <button 
                            className="btn btn-link nav-link text-warning border-0" 
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
};

export default Header;