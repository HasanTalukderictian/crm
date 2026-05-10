import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const API_BASE = import.meta.env.VITE_API_BASE_URL;

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState("all");
    const [loading, setLoading] = useState(false); // Loading state
    const [actionLoading, setActionLoading] = useState(false); // For actions like toggle/reset
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("admin");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`${API_BASE}/users`, {
                headers: {
                    "Accept": "application/json",
                    "Authorization": "Bearer " + token
                }
            });
            const data = await response.json();
            if (response.ok && data.users) {
                setUsers(data.users);
                setFilteredUsers(data.users);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const openResetModal = (userId) => {
        setSelectedUserId(userId);
        setShowResetModal(true);
    };

    const closeResetModal = () => {
        setShowResetModal(false);
        setSelectedUserId(null);
        setNewPassword("");
        setConfirmPassword("");
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        setActionLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`${API_BASE}/users/${selectedUserId}/reset-password`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    password: newPassword,
                    password_confirmation: confirmPassword
                })
            });
            if (response.ok) {
                toast.success("Password reset successful");
                closeResetModal();
            } else {
                toast.error("Failed to reset password");
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong");
        } finally {
            setActionLoading(false);
        }
    };

    const toggleStatus = async (userId, currentStatus) => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`${API_BASE}/users/${userId}/toggle-status`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({ active: !currentStatus })
            });
            if (response.ok) {
                const updatedUsers = users.map(user =>
                    user.id === userId ? { ...user, active: !currentStatus } : user
                );
                setUsers(updatedUsers);
                applyFilter(filterStatus, updatedUsers);
                toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        const token = localStorage.getItem("authToken");
        try {
            const response = await fetch(`${API_BASE}/create-user`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({ name, email, password, role })
            });
            const data = await response.json();
            if (response.ok) {
                const updatedUsers = [...users, data.user];
                setUsers(updatedUsers);
                applyFilter(filterStatus, updatedUsers);
                setShowModal(false);
                setName("");
                setEmail("");
                setPassword("");
                setRole("admin");
                toast.success("User created successfully");
            } else {
                setError(data.message || "Failed to create user");
                toast.error(data.message || "Failed to create user");
            }
        } catch (err) {
            setError("Something went wrong");
            toast.error("Something went wrong");
        } finally {
            setActionLoading(false);
        }
    };

    const applyFilter = (status, allUsers = users) => {
        setFilterStatus(status);
        let filtered = allUsers;
        if (status === "active") {
            filtered = allUsers.filter(u => u.active);
        } else if (status === "inactive") {
            filtered = allUsers.filter(u => !u.active);
        }
        setFilteredUsers(filtered);
        setCurrentPage(1);
    };

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    // Loader Component
    const Loader = () => (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '30px 40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                animation: 'fadeIn 0.3s ease-out'
            }}>
                <div className="spinner-border text-primary" style={{ width: '50px', height: '50px' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <div style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '500' }}>
                    <i className="bi bi-hourglass-split me-2"></i>
                    Please wait...
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </div>
    );

    // Table Loader Component
    const TableLoader = () => (
        <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
        }}>
            <div className="spinner-border text-primary" style={{ width: '40px', height: '40px' }} role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted mb-0">Loading users...</p>
        </div>
    );

    return (
        <>
            {/* Global Loader for initial data fetch */}
            {loading && <Loader />}

            <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
                <div className="container-fluid px-4 py-4">
                    {/* Header Card */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card shadow-sm border-0 rounded-3">
                                <div className="card-body py-4">
                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                        <div>
                                            <h2 className="mb-1" style={{ color: '#2c3e50', fontWeight: '600' }}>
                                                <i className="bi bi-people-fill me-2" style={{ color: '#3498db' }}></i>
                                                User Management
                                            </h2>
                                            <p className="text-muted mb-0">Manage system users, roles, and permissions</p>
                                        </div>
                                        <button
                                            className="btn btn-primary rounded-3 px-4 py-2"
                                            onClick={() => setShowModal(true)}
                                            style={{ fontWeight: '500' }}
                                            disabled={actionLoading}
                                        >
                                            <i className="bi bi-person-plus-fill me-2"></i>
                                            Add New User
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Section */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card shadow-sm border-0 rounded-3">
                                <div className="card-body">
                                    <div className="d-flex align-items-center gap-3 flex-wrap">
                                        <label className="fw-semibold mb-0" style={{ color: '#2c3e50' }}>
                                            <i className="bi bi-funnel-fill me-1"></i>
                                            Filter by Status:
                                        </label>
                                        <div className="btn-group" role="group">
                                            <button
                                                className={`btn ${filterStatus === "all" ? "btn-primary" : "btn-outline-secondary"}`}
                                                onClick={() => applyFilter("all")}
                                                style={{ borderRadius: '8px 0 0 8px' }}
                                                disabled={loading || actionLoading}
                                            >
                                                <i className="bi bi-list-ul me-1"></i> All
                                            </button>
                                            <button
                                                className={`btn ${filterStatus === "active" ? "btn-primary" : "btn-outline-secondary"}`}
                                                onClick={() => applyFilter("active")}
                                                disabled={loading || actionLoading}
                                            >
                                                <i className="bi bi-check-circle-fill me-1"></i> Active
                                            </button>
                                            <button
                                                className={`btn ${filterStatus === "inactive" ? "btn-primary" : "btn-outline-secondary"}`}
                                                onClick={() => applyFilter("inactive")}
                                                style={{ borderRadius: '0 8px 8px 0' }}
                                                disabled={loading || actionLoading}
                                            >
                                                <i className="bi bi-x-circle-fill me-1"></i> Inactive
                                            </button>
                                        </div>
                                        <div className="ms-auto">
                                            <span className="badge bg-info rounded-pill px-3 py-2">
                                                <i className="bi bi-people me-1"></i> Total Users: {filteredUsers.length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="row">
                        <div className="col-12">
                            <div className="card shadow-sm border-0 rounded-3">
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead style={{ backgroundColor: '#34495e', color: 'white' }}>
                                                <tr>
                                                    <th className="py-3 px-4"><i className="bi bi-person-badge me-2"></i>Name</th>
                                                    <th className="py-3"><i className="bi bi-shield-lock me-2"></i>Role</th>
                                                    <th className="py-3"><i className="bi bi-envelope me-2"></i>Email</th>
                                                    <th className="py-3"><i className="bi bi-toggle-on me-2"></i>Status</th>
                                                    <th className="py-3"><i className="bi bi-tools me-2"></i>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {!loading && currentUsers.length > 0 ? (
                                                    currentUsers.map((user, index) => (
                                                        <tr key={user.id} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa' }}>
                                                            <td className="py-3 px-4">
                                                                <div className="d-flex align-items-center">
                                                                    <div className="avatar-circle me-3" style={{
                                                                        width: '40px',
                                                                        height: '40px',
                                                                        backgroundColor: '#3498db',
                                                                        borderRadius: '50%',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        color: 'white',
                                                                        fontWeight: 'bold'
                                                                    }}>
                                                                        {user.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <strong>{user.name}</strong>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-3">
                                                                <span className={`badge ${user.role === "admin" ? "bg-danger" : user.role === "manager" ? "bg-warning" : user.role === "finance_manager" ? "bg-info" : "bg-primary"} px-3 py-2 rounded-pill`}>
                                                                    <i className={`bi ${user.role === "admin" ? "bi-shield-shaded" : "bi-person"} me-1`}></i>
                                                                    {user.role === "admin" ? "Administrator" : user.role === "manager" ? "Sales Manager" : user.role === "finance_manager" ? "Finance Manager" : "Regular User"}
                                                                </span>
                                                             </td>
                                                            <td className="py-3">{user.email}</td>
                                                            <td className="py-3">
                                                                <button
                                                                    className={`btn btn-sm ${user.active ? 'btn-success' : 'btn-secondary'} rounded-pill px-3`}
                                                                    style={{ minWidth: "90px", fontWeight: '500' }}
                                                                    onClick={() => toggleStatus(user.id, user.active)}
                                                                    disabled={actionLoading}
                                                                >
                                                                    {actionLoading ? (
                                                                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                                    ) : (
                                                                        <i className={`bi ${user.active ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                                                                    )}
                                                                    {user.active ? 'Active' : 'Inactive'}
                                                                </button>
                                                             </td>
                                                            <td className="py-3">
                                                                <button
                                                                    className="btn btn-outline-primary btn-sm rounded-pill px-3"
                                                                    onClick={() => openResetModal(user.id)}
                                                                    disabled={actionLoading}
                                                                    style={{ fontWeight: '500' }}
                                                                >
                                                                    {actionLoading && selectedUserId === user.id ? (
                                                                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                                    ) : (
                                                                        <i className="bi bi-key-fill me-1"></i>
                                                                    )}
                                                                    Reset Password
                                                                </button>
                                                             </td>
                                                        </tr>
                                                    ))
                                                ) : !loading && currentUsers.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="text-center py-5">
                                                            <i className="bi bi-inbox display-1 text-muted"></i>
                                                            <p className="mt-2 text-muted">No users found</p>
                                                            <button 
                                                                className="btn btn-primary mt-2 rounded-pill"
                                                                onClick={() => setShowModal(true)}
                                                            >
                                                                <i className="bi bi-person-plus-fill me-2"></i>
                                                                Add your first user
                                                            </button>
                                                         </td>
                                                    </tr>
                                                ) : (
                                                    <tr>
                                                        <td colSpan="5" className="p-0">
                                                            <TableLoader />
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && !loading && (
                        <div className="row mt-4">
                            <div className="col-12">
                                <div className="d-flex justify-content-center">
                                    <nav>
                                        <ul className="pagination">
                                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                                <button 
                                                    className="page-link rounded-start" 
                                                    onClick={() => setCurrentPage(currentPage - 1)}
                                                    disabled={actionLoading}
                                                >
                                                    <i className="bi bi-chevron-left"></i> Previous
                                                </button>
                                            </li>
                                            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                                let pageNum;
                                                if (totalPages <= 7) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 4) {
                                                    pageNum = i + 1;
                                                    if (i === 6) pageNum = totalPages;
                                                } else if (currentPage >= totalPages - 3) {
                                                    pageNum = totalPages - 6 + i;
                                                } else {
                                                    pageNum = currentPage - 3 + i;
                                                }
                                                if (pageNum > totalPages) return null;
                                                if (i === 3 && totalPages > 7 && currentPage > 4 && currentPage < totalPages - 3) {
                                                    return (
                                                        <li key="dots" className="page-item disabled">
                                                            <span className="page-link">...</span>
                                                        </li>
                                                    );
                                                }
                                                if (i === 0 && totalPages > 7 && currentPage > 4) {
                                                    return (
                                                        <li key={1} className="page-item">
                                                            <button className="page-link" onClick={() => setCurrentPage(1)}>1</button>
                                                        </li>
                                                    );
                                                }
                                                if (i === 6 && totalPages > 7 && currentPage < totalPages - 3) {
                                                    return (
                                                        <li key={totalPages} className="page-item">
                                                            <button className="page-link" onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>
                                                        </li>
                                                    );
                                                }
                                                return (
                                                    <li key={pageNum} className={`page-item ${currentPage === pageNum ? "active" : ""}`}>
                                                        <button className="page-link" onClick={() => setCurrentPage(pageNum)}>
                                                            {pageNum}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                                <button 
                                                    className="page-link rounded-end" 
                                                    onClick={() => setCurrentPage(currentPage + 1)}
                                                    disabled={actionLoading}
                                                >
                                                    Next <i className="bi bi-chevron-right"></i>
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add User Modal */}
            {showModal && (
                <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.5)", overflowY: "auto" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 shadow-lg">
                            <div className="modal-header" style={{ backgroundColor: '#2c3e50', color: 'white', borderRadius: '12px 12px 0 0' }}>
                                <h5 className="modal-title">
                                    <i className="bi bi-person-plus-fill me-2"></i>
                                    Add New User
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    {error}
                                    <button type="button" className="btn-close" onClick={() => setError("")}></button>
                                </div>}
                                {success && <div className="alert alert-success alert-dismissible fade show" role="alert">
                                    <i className="bi bi-check-circle-fill me-2"></i>
                                    {success}
                                    <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
                                </div>}

                                <form onSubmit={handleAddUser}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            <i className="bi bi-person me-1"></i> Full Name
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control rounded-3"
                                            placeholder="Enter user's full name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            disabled={actionLoading}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            <i className="bi bi-envelope me-1"></i> Email Address
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control rounded-3"
                                            placeholder="user@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={actionLoading}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            <i className="bi bi-lock me-1"></i> Password
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control rounded-3"
                                            placeholder="Create a strong password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={actionLoading}
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold">
                                            <i className="bi bi-shield me-1"></i> User Role
                                        </label>
                                        <select
                                            className="form-select rounded-3"
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            disabled={actionLoading}
                                        >
                                            <option value="admin">👑 Administrator (Full Access)</option>
                                            <option value="user">👤 Regular User (Limited Access)</option>
                                            <option value="manager">👤 Sales Manager (Limited Access)</option>
                                            <option value="finance_manager">👤 Finance Manager (Limited Access)</option>
                                        </select>
                                    </div>
                                    <div className="d-flex justify-content-end gap-2">
                                        <button 
                                            type="button" 
                                            className="btn btn-secondary rounded-pill px-4" 
                                            onClick={() => setShowModal(false)}
                                            disabled={actionLoading}
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={actionLoading}>
                                            {actionLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-save me-2"></i>
                                                    Create User
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {showResetModal && (
                <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.5)", overflowY: "auto" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 shadow-lg">
                            <div className="modal-header" style={{ backgroundColor: '#e74c3c', color: 'white', borderRadius: '12px 12px 0 0' }}>
                                <h5 className="modal-title">
                                    <i className="bi bi-key-fill me-2"></i>
                                    Reset Password
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={closeResetModal}></button>
                            </div>
                            <div className="modal-body p-4">
                                <form onSubmit={handleResetPassword}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            <i className="bi bi-lock me-1"></i> New Password
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control rounded-3"
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            disabled={actionLoading}
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold">
                                            <i className="bi bi-check-circle me-1"></i> Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control rounded-3"
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            disabled={actionLoading}
                                        />
                                    </div>
                                    <div className="d-flex justify-content-end gap-2">
                                        <button 
                                            type="button" 
                                            className="btn btn-secondary rounded-pill px-4" 
                                            onClick={closeResetModal}
                                            disabled={actionLoading}
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-danger rounded-pill px-4" disabled={actionLoading}>
                                            {actionLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Resetting...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-key me-2"></i>
                                                    Reset Password
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer 
                position="top-right" 
                autoClose={3000} 
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </>
    );
};

export default UserManagement;