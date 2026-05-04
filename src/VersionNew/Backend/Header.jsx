// import React from 'react';
// import { FaMoon, FaSun, FaUserCircle, FaBars } from 'react-icons/fa';

// const Header = ({ toggleSidebar, darkMode, setDarkMode }) => {
//   return (
//     <nav className={`navbar sticky-top shadow-sm ${darkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-white'}`}>
//       <div className="container-fluid">
//         <button className="btn btn-outline-secondary border-0" onClick={toggleSidebar}>
//           <FaBars />
//         </button>
        
//         <div className="d-flex align-items-center">
//           <button 
//             className="btn btn-link nav-link me-3 text-warning" 
//             onClick={() => setDarkMode(!darkMode)}
//           >
//             {darkMode ? <FaSun size={20} /> : <FaMoon size={20} className="text-dark" />}
//           </button>
          
//           <div className="dropdown">
//             <img 
//               src="https://via.placeholder.com/40" 
//               className="rounded-circle cursor-pointer" 
//               alt="User" 
//               data-bs-toggle="dropdown"
//             />
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// }

// export default Header;

import React, { useState, useEffect } from 'react';
import { FaMoon, FaSun, FaBars, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Header = ({ toggleSidebar, darkMode, setDarkMode }) => {
    // User State from LocalStorage
    const userRole = localStorage.getItem("role"); // e.g., 'admin', 'user'
    const userName = localStorage.getItem("userName") || "User";

    // Modal & Data States
    const [showModal, setShowModal] = useState(false);
    const [companyName, setCompanyName] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

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
    };

    // Submit Action (Only for Admin)
    const submitHeader = async () => {
        if (!companyName) {
            toast.error("Company Name is required!");
            return;
        }

        const formData = new FormData();
        formData.append("Companyname", companyName);
        if (image) formData.append("image", image);

        try {
            const res = await axios.post(`${API_BASE}/add-header`, formData, {
                headers: { 
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${localStorage.getItem("authToken")}` 
                }
            });

            if (res.data.status) {
                toast.success("Header updated successfully!");
                resetForm();
            }
        } catch (err) {
            toast.error("Failed to update header.");
        }
    };

    return (
        <nav className={`navbar sticky-top shadow-sm py-2 ${darkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-white'}`}>
            <div className="container-fluid">
                <div className="d-flex align-items-center">
                    <button className="btn btn-outline-secondary border-0 me-2" onClick={toggleSidebar}>
                        <FaBars />
                    </button>
                    {/* Display User Role & Name */}
                    <div className="ms-2 d-none d-sm-block">
                        <span className={`badge ${userRole === 'admin' ? 'bg-danger' : 'bg-primary'} text-uppercase`}>
                            {userRole}
                        </span>
                        <small className="ms-2 fw-bold">{userName}</small>
                    </div>
                </div>

                <div className="d-flex align-items-center">
                    {/* Dark Mode Toggle */}
                    <button 
                        className="btn btn-link nav-link me-3 text-warning border-0" 
                        onClick={() => setDarkMode(!darkMode)}
                    >
                        {darkMode ? <FaSun size={18} /> : <FaMoon size={18} className="text-dark" />}
                    </button>
                    
                    {/* User Profile / Admin Trigger */}
                    <div className="dropdown">
                        <img 
                            src="https://ui-avatars.com/api/?name=Admin&background=random" 
                            className="rounded-circle cursor-pointer border shadow-sm" 
                            alt="User" 
                            width="35"
                            height="35"
                            style={{ cursor: 'pointer' }}
                            onClick={() => userRole === 'admin' && setShowModal(true)}
                        />
                    </div>
                </div>
            </div>

            {/* Admin Setting Modal */}
            {showModal && (
                <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.6)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className={`modal-content border-0 ${darkMode ? 'bg-dark text-light' : ''}`}>
                            <div className="modal-header border-bottom-0">
                                <h5 className="modal-title fw-bold">Header Settings (Admin)</h5>
                                <button className={`btn-close ${darkMode ? 'btn-close-white' : ''}`} onClick={resetForm}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Company Name</label>
                                    <input
                                        type="text"
                                        className={`form-control ${darkMode ? 'bg-secondary border-0 text-white' : ''}`}
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="Enter Company Name"
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
                                </div>

                                {preview && (
                                    <div className="text-center mt-3">
                                        <img src={preview} className="rounded border p-1" width="100" alt="Preview" />
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer border-top-0">
                                <button className="btn btn-secondary btn-sm" onClick={resetForm}>Cancel</button>
                                <button className="btn btn-primary btn-sm px-4" onClick={submitHeader}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer />
        </nav>
    );
}

export default Header;