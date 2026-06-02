import { useEffect, useState, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pie } from "react-chartjs-2";
import "../../assets/css/target.scss";

export const API_BASE = import.meta.env.VITE_API_BASE_URL;

const TargetManagement = () => {
    const [users, setUsers] = useState([]);
    const [targets, setTargets] = useState([]);
    const [targetModal, setTargetModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [monthlyTarget, setMonthlyTarget] = useState("");
    const [year, setYear] = useState("");
    const [month, setMonth] = useState("");
    const [messageModal, setMessageModal] = useState(false);
    const [messageText, setMessageText] = useState("");
    const [selectedMessageUser, setSelectedMessageUser] = useState(null);
    const [filterYear, setFilterYear] = useState("");
    const [filterMonth, setFilterMonth] = useState("");
    const [filterUser, setFilterUser] = useState("");
    const [selectedUserId, setSelectedUserId] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;

    const userRole = localStorage.getItem("userRole");
    const userId = Number(localStorage.getItem("userId"));
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // ================= FETCH FUNCTIONS =================
    const fetchUsers = useCallback(async () => {
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
            }
        } catch (error) {
            console.error("Fetch Users Error:", error);
        }
    }, []);

    const fetchTargets = useCallback(async () => {
        try {
            const token = localStorage.getItem("authToken");
            let params = new URLSearchParams();

            if (userRole === "admin") {
                if (filterYear) params.append("year", filterYear);
                if (filterMonth) params.append("month", filterMonth);
                if (filterUser) params.append("user_id", filterUser);
            } else {
                params.append("user_id", userId);
                if (filterYear) params.append("year", filterYear);
                if (filterMonth) params.append("month", filterMonth);
            }

            const response = await fetch(`${API_BASE}/get-target?${params.toString()}`, {
                headers: {
                    "Accept": "application/json",
                    "Authorization": "Bearer " + token
                }
            });
            const data = await response.json();
            if (response.ok) {
                setTargets(data.data?.data || data.data || []);
            }
        } catch (error) {
            console.error("Fetch Targets Error:", error);
        }
    }, [userRole, userId, filterYear, filterMonth, filterUser]);

    useEffect(() => {
        fetchUsers();
        fetchTargets();
    }, [fetchUsers, fetchTargets]);

    // ================= LOGIC & HELPERS =================
    const applyFilters = () => {
        let data = [...users];
        if (userRole !== "admin") {
            data = data.filter(u => u.id === userId);
        } else if (filterUser) {
            data = data.filter(u => u.id === Number(filterUser));
        }
        return data;
    };

    const filteredUsersList = applyFilters();
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsersList.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsersList.length / usersPerPage);

    // FIXED: Get user target with current month priority for admin
    const getUserTarget = (uid) => {
        let userTargets = targets.filter(t => t.user_id === uid);
        
        // If no filters applied, show only current month's target
        if (!filterYear && !filterMonth) {
            const currentMonthTarget = userTargets.find(t => t.year === currentYear && t.month === currentMonth);
            return currentMonthTarget || null;
        }
        
        // If filters applied, show filtered target
        let filtered = userTargets;
        if (filterYear) {
            filtered = filtered.filter(t => t.year === parseInt(filterYear));
        }
        if (filterMonth) {
            filtered = filtered.filter(t => t.month === parseInt(filterMonth));
        }
        return filtered.length > 0 ? filtered[0] : null;
    };

    // Get all targets for a user (for table display)
    const getAllUserTargets = (uid) => {
        let userTargets = targets.filter(t => t.user_id === uid);
        
        // If filters are applied, show filtered results
        if (filterYear || filterMonth) {
            if (filterYear) {
                userTargets = userTargets.filter(t => t.year === parseInt(filterYear));
            }
            if (filterMonth) {
                userTargets = userTargets.filter(t => t.month === parseInt(filterMonth));
            }
            return userTargets.sort((a, b) => {
                if (a.year !== b.year) return b.year - a.year;
                return b.month - a.month;
            });
        }
        
        // No filters - show ONLY current month's record
        const currentMonthTarget = userTargets.find(t => t.year === currentYear && t.month === currentMonth);
        return currentMonthTarget ? [currentMonthTarget] : [];
    };

    const getMonthName = (monthNum) => {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return months[monthNum - 1] || "-";
    };

    const getProgressStatus = (progress) => {
        if (progress <= 30) return { label: "Poor", color: "#dc3545" };
        if (progress <= 50) return { label: "Average", color: "#fd7e14" };
        if (progress < 100) return { label: "Good Going", color: "#ffc107" };
        return { label: "Excellent", color: "#28a745" };
    };

    // ================= MODAL HANDLERS =================
    const openModal = (user) => {
        const currentDate = new Date();
        setYear(currentDate.getFullYear());
        setMonth(currentDate.getMonth() + 1);

        if (user) {
            setSelectedUser(user);
            setSelectedUserId(user.id);
            const userTarget = getUserTarget(user.id);
            setMonthlyTarget(userTarget ? userTarget.target : "");
        } else {
            setSelectedUser(null);
            setSelectedUserId("");
            setMonthlyTarget("");
        }
        setTargetModal(true);
    };

    const closeModal = () => {
        setTargetModal(false);
        setSelectedUser(null);
        setMonthlyTarget("");
    };

    const openMessageModal = (user) => {
        setSelectedMessageUser(user);
        setMessageText("");
        setMessageModal(true);
    };

    const closeMessageModal = () => {
        setMessageModal(false);
        setMessageText("");
    };

    // ================= API ACTIONS =================
    const handleSetTarget = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("authToken");
            const finalUserId = selectedUser ? selectedUser.id : selectedUserId;
            
            if (!finalUserId) {
                toast.error("Please select a user");
                return;
            }

            const userTarget = targets.find(t => t.user_id === finalUserId && t.year === parseInt(year) && t.month === parseInt(month));
            const url = userTarget ? `${API_BASE}/targets/${userTarget.id}` : `${API_BASE}/set-target`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    user_id: finalUserId,
                    target: monthlyTarget,
                    year: year,
                    month: month
                })
            });

            const data = await response.json();
            if (response.ok) {
                toast.success("Success ✅");
                closeModal();
                fetchTargets();
            } else {
                toast.error(data.message || "Action Failed");
            }
        } catch (err) {
            toast.error("Network Error");
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`${API_BASE}/send-notification`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    user_id: selectedMessageUser.id,
                    message: messageText
                })
            });
            if (response.ok) {
                toast.success("Message sent ✅");
                closeMessageModal();
            } else {
                toast.error("Failed to send");
            }
        } catch (err) {
            console.error(err);
        }
    };

    // ================= CHART PREP =================
    let chartData = null;
    if (userRole !== "admin") {
        const userTargets = targets.filter(t => t.user_id === userId);
        const myTarget = (!filterYear && !filterMonth) 
            ? userTargets.find(t => t.year === currentYear && t.month === currentMonth)
            : (userTargets.length > 0 ? userTargets[0] : null);
        
        if (myTarget && (Number(myTarget.achieved) > 0 || Number(myTarget.remaining) > 0)) {
            chartData = {
                labels: ["Achieved", "Remaining"],
                datasets: [{
                    data: [Number(myTarget.achieved), Number(myTarget.remaining)],
                    backgroundColor: ["#28a745", "#dc3545"],
                    borderWidth: 1,
                }],
            };
        }
    }

    return (
        <div className="target-management-container">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop />
            
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <h1>Target Management</h1>
                    <p>Track and manage performance targets efficiently</p>
                </div>
            </div>

            <div className="container mt-4">
                {userRole === "admin" ? (
                    <>
                        {/* Admin Dashboard */}
                        <div className="admin-header">
                            <div className="header-left">
                                <h3>Team Performance Overview</h3>
                                <span className="badge-modern">{filteredUsersList.length} Active Members</span>
                                {!filterYear && !filterMonth && (
                                    <div className="current-month-badge-admin">
                                        📍 Showing current month: {getMonthName(currentMonth)} {currentYear}
                                    </div>
                                )}
                                {(filterYear || filterMonth) && (
                                    <div className="filter-badge-admin">
                                        🔍 Filtered results
                                        <button className="clear-filters-btn-admin" onClick={() => {
                                            setFilterYear("");
                                            setFilterMonth("");
                                            setFilterUser("");
                                        }}>Clear Filters</button>
                                    </div>
                                )}
                            </div>
                            <button className="btn-primary-gradient" onClick={() => openModal(null)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                                Set New Target
                            </button>
                        </div>

                        {/* Modern Filter Bar */}
                        <div className="filter-container">
                            <div className="filter-group">
                                <label>Year</label>
                                <select className="modern-select" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                                    <option value="">All Years</option>
                                    <option value={currentYear - 1}>{currentYear - 1}</option>
                                    <option value={currentYear}>{currentYear}</option>
                                    <option value={currentYear + 1}>{currentYear + 1}</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Month</label>
                                <select className="modern-select" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                                    <option value="">All Months</option>
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i} value={i + 1}>{getMonthName(i + 1)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Team Member</label>
                                <select className="modern-select" value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
                                    <option value="">All Members</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>&nbsp;</label>
                            
                            </div>
                        </div>

                        {/* Modern Table */}
                        <div className="table-container">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>Team Member</th>
                                        <th>Period</th>
                                        <th>Target</th>
                                        <th>Achieved</th>
                                        <th>Remaining</th>
                                        <th>Progress</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentUsers.length > 0 ? currentUsers.map(user => {
                                        const userTargetsList = getAllUserTargets(user.id);
                                        return userTargetsList.length > 0 ? (
                                            userTargetsList.map((t, idx) => {
                                                const progressStatus = getProgressStatus(t.progress);
                                                const isCurrentMonth = (t.year === currentYear && t.month === currentMonth);
                                                return (
                                                    <tr key={`${user.id}-${t.year}-${t.month}`} className={isCurrentMonth && !filterYear && !filterMonth ? 'highlighted-row-admin' : ''}>
                                                        {idx === 0 && (
                                                            <>
                                                                <td rowSpan={userTargetsList.length} className="user-cell">
                                                                    <div className="user-avatar">{user.name.charAt(0)}</div>
                                                                    <span className="user-name">{user.name}</span>
                                                                </td>
                                                            </>
                                                        )}
                                                        <td>
                                                            <div className="period-badge">
                                                                {getMonthName(t.month)} {t.year}
                                                                {isCurrentMonth && !filterYear && !filterMonth && <span className="current-tag-admin"> (Current)</span>}
                                                            </div>
                                                        </td>
                                                        <td className="target-value">{t.target.toLocaleString()}</td>
                                                        <td className="achieved-value">{t.achieved.toLocaleString()}</td>
                                                        <td className="remaining-value">{t.remaining.toLocaleString()}</td>
                                                        <td>
                                                            <div className="progress-cell">
                                                                <div className="progress-bar-container">
                                                                    <div className="progress-fill" style={{ width: `${t.progress}%`, backgroundColor: progressStatus.color }}></div>
                                                                </div>
                                                                <span className="progress-percent" style={{ color: progressStatus.color }}>{t.progress}%</span>
                                                            </div>
                                                        </td>
                                                        {idx === 0 && (
                                                            <td rowSpan={userTargetsList.length}>
                                                                <div className="action-buttons">
                                                                    <button className="btn-icon edit" onClick={() => openModal(user)} title="Edit Target">
                                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3l4 4-7 7H10v-4l7-7z"/><path d="M4 20h16"/></svg>
                                                                    </button>
                                                                    <button className="btn-icon message" onClick={() => openMessageModal(user)} title="Send Message">
                                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr key={user.id}>
                                                <td className="user-cell">
                                                    <div className="user-avatar">{user.name.charAt(0)}</div>
                                                    <span className="user-name">{user.name}</span>
                                                </td>
                                                <td colSpan="6" className="empty-state">
                                                    <div className="empty-message">
                                                        {!filterYear && !filterMonth ? 
                                                            `No target found for ${getMonthName(currentMonth)} ${currentYear}` : 
                                                            "No target records found for selected filters"}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr><td colSpan="7" className="empty-state"><div className="empty-message">No users found</div></td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination-modern">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}>← Prev</button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button key={i} className={currentPage === i+1 ? 'active' : ''} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                ))}
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}>Next →</button>
                            </div>
                        )}
                    </>
                ) : (
                    /* User Dashboard - Shows ONLY current month by default */
                    <div className="user-dashboard">
                        <div className="dashboard-header">
                            <h3>My Performance Dashboard</h3>
                            <p>Track your monthly targets and achievements</p>
                            {!filterYear && !filterMonth && (
                                <div className="current-month-indicator">
                                    📍 Showing current month: {getMonthName(currentMonth)} {currentYear}
                                </div>
                            )}
                            {(filterYear || filterMonth) && (
                                <div className="filter-indicator">
                                    🔍 Showing filtered results
                                    <button className="clear-filters-btn" onClick={() => {
                                        setFilterYear("");
                                        setFilterMonth("");
                                    }}>Clear Filters</button>
                                </div>
                            )}
                        </div>

                        {/* Stats Cards */}
                        <div className="stats-grid">
                            {(() => {
                                const userTargets = targets.filter(t => t.user_id === userId);
                                const myTarget = (!filterYear && !filterMonth) 
                                    ? userTargets.find(t => t.year === currentYear && t.month === currentMonth)
                                    : (userTargets.length > 0 ? userTargets[0] : null);
                                return (
                                    <>
                                        <div className="stat-card-primary">
                                            <div className="stat-icon">🎯</div>
                                            <div className="stat-info">
                                                <span>{!filterYear && !filterMonth ? 'Current Month Target' : 'Filtered Target'}</span>
                                                <strong>{myTarget ? myTarget.target.toLocaleString() : 0}</strong>
                                            </div>
                                        </div>
                                        <div className="stat-card-success">
                                            <div className="stat-icon">✅</div>
                                            <div className="stat-info">
                                                <span>{!filterYear && !filterMonth ? 'Current Month Achieved' : 'Filtered Achieved'}</span>
                                                <strong>{myTarget ? myTarget.achieved.toLocaleString() : 0}</strong>
                                            </div>
                                        </div>
                                        <div className="stat-card-warning">
                                            <div className="stat-icon">📊</div>
                                            <div className="stat-info">
                                                <span>{!filterYear && !filterMonth ? 'Current Month Progress' : 'Filtered Progress'}</span>
                                                <strong>{myTarget ? `${myTarget.progress}%` : "0%"}</strong>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        {/* Filter Section for User */}
                        <div className="filter-container user-filters">
                            <div className="filter-group">
                                <label>Year (Optional)</label>
                                <select className="modern-select" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                                    <option value="">All Years</option>
                                    <option value={currentYear}>{currentYear}</option>
                                    <option value={currentYear-1}>{currentYear-1}</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Month (Optional)</label>
                                <select className="modern-select" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                                    <option value="">All Months</option>
                                    {[...Array(12)].map((_, i) => <option key={i} value={i+1}>{getMonthName(i+1)}</option>)}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>&nbsp;</label>
                                <button className="clear-filters-button" onClick={() => {
                                    setFilterYear("");
                                    setFilterMonth("");
                                }}>
                                    Clear Filters
                                </button>
                            </div>
                        </div>

                        {/* Table and Chart Grid */}
                        <div className="content-grid">
                            <div className="table-wrapper">
                                <table className="modern-table user-table">
                                    <thead>
                                        <tr>
                                            <th>Month</th>
                                            <th>Year</th>
                                            <th>Target</th>
                                            <th>Achieved</th>
                                            <th>Remaining</th>
                                            <th>Progress</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            let userTargets = targets.filter(t => t.user_id === userId);
                                            
                                            if (filterYear || filterMonth) {
                                                if (filterYear) {
                                                    userTargets = userTargets.filter(t => t.year === parseInt(filterYear));
                                                }
                                                if (filterMonth) {
                                                    userTargets = userTargets.filter(t => t.month === parseInt(filterMonth));
                                                }
                                                userTargets = userTargets.sort((a, b) => {
                                                    if (a.year !== b.year) return b.year - a.year;
                                                    return b.month - a.month;
                                                });
                                            } else {
                                                const currentMonthTarget = userTargets.find(t => t.year === currentYear && t.month === currentMonth);
                                                userTargets = currentMonthTarget ? [currentMonthTarget] : [];
                                            }
                                            
                                            return userTargets.length > 0 ? (
                                                userTargets.map((t) => {
                                                    const progressStatus = getProgressStatus(t.progress);
                                                    const isCurrentMonth = (t.year === currentYear && t.month === currentMonth);
                                                    return (
                                                        <tr key={`${t.year}-${t.month}`} className={isCurrentMonth && !filterYear && !filterMonth ? 'highlighted-row' : ''}>
                                                            <td>
                                                                <span className="month-badge">
                                                                    {getMonthName(t.month)}
                                                                    {isCurrentMonth && !filterYear && !filterMonth && <span className="current-tag"> (Current)</span>}
                                                                </span>
                                                            </td>
                                                            <td>{t.year}</td>
                                                            <td className="target-value">{t.target.toLocaleString()}</td>
                                                            <td className="achieved-value">{t.achieved.toLocaleString()}</td>
                                                            <td className="remaining-value">{t.remaining.toLocaleString()}</td>
                                                            <td>
                                                                <div className="progress-cell">
                                                                    <div className="progress-bar-container">
                                                                        <div className="progress-fill" style={{ width: `${t.progress}%`, backgroundColor: progressStatus.color }}></div>
                                                                    </div>
                                                                    <span className="progress-percent" style={{ color: progressStatus.color }}>{t.progress}%</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="empty-state">
                                                        <div className="empty-message">
                                                            {!filterYear && !filterMonth ? 
                                                                `No target found for ${getMonthName(currentMonth)} ${currentYear}` : 
                                                                "No target records found for selected filters"}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })()}
                                    </tbody>
                                </table>
                            </div>

                            {/* Chart Card */}
                            <div className="chart-card">
                                <div className="chart-header">
                                    <h5>Performance Overview</h5>
                                    <span className="chart-badge">
                                        {(() => {
                                            const userTargets = targets.filter(t => t.user_id === userId);
                                            const myTarget = (!filterYear && !filterMonth) 
                                                ? userTargets.find(t => t.year === currentYear && t.month === currentMonth)
                                                : (userTargets.length > 0 ? userTargets[0] : null);
                                            return myTarget ? 
                                                `${myTarget.progress}% Complete ${!filterYear && !filterMonth ? '(Current Month)' : '(Filtered)'}` : 
                                                "No Data";
                                        })()}
                                    </span>
                                </div>
                                <div className="chart-body">
                                    {(() => {
                                        const userTargets = targets.filter(t => t.user_id === userId);
                                        const myTarget = (!filterYear && !filterMonth) 
                                            ? userTargets.find(t => t.year === currentYear && t.month === currentMonth)
                                            : (userTargets.length > 0 ? userTargets[0] : null);
                                        const chartDataLocal = myTarget && (Number(myTarget.achieved) > 0 || Number(myTarget.remaining) > 0) ? {
                                            labels: ["Achieved", "Remaining"],
                                            datasets: [{
                                                data: [Number(myTarget.achieved), Number(myTarget.remaining)],
                                                backgroundColor: ["#28a745", "#dc3545"],
                                                borderWidth: 1,
                                            }],
                                        } : null;
                                        
                                        return chartDataLocal ? (
                                            <>
                                                <div className="pie-chart-container">
                                                    <Pie data={chartDataLocal} options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom' } } }} />
                                                </div>
                                                <div className="chart-stats">
                                                    <div className="stat-item">
                                                        <span className="stat-label">Total Target</span>
                                                        <span className="stat-value">{myTarget.target.toLocaleString()}</span>
                                                    </div>
                                                    <div className="stat-item success">
                                                        <span className="stat-label">Achieved</span>
                                                        <span className="stat-value">{myTarget.achieved.toLocaleString()}</span>
                                                    </div>
                                                    <div className="stat-item danger">
                                                        <span className="stat-label">Remaining</span>
                                                        <span className="stat-value">{myTarget.remaining.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="no-chart-data">
                                                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M21 12a9 9 0 1 1-9-9"/><path d="M12 6v6l4 2"/></svg>
                                                <p>No performance data available for the selected period</p>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Message Modal */}
            {messageModal && (
                <div className="modal-overlay" onClick={closeMessageModal}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Send Message to {selectedMessageUser?.name}</h3>
                            <button className="modal-close" onClick={closeMessageModal}>×</button>
                        </div>
                        <form onSubmit={handleSendMessage}>
                            <div className="modal-body">
                                <textarea 
                                    className="modern-textarea" 
                                    rows="5" 
                                    value={messageText} 
                                    onChange={(e) => setMessageText(e.target.value)} 
                                    required 
                                    placeholder="Type your message here..." 
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={closeMessageModal}>Cancel</button>
                                <button type="submit" className="btn-primary">Send Message</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Target Modal */}
            {targetModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedUser ? `Edit Target: ${selectedUser.name}` : "Set New Target"}</h3>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSetTarget}>
                            <div className="modal-body">
                                {!selectedUser && (
                                    <div className="form-group">
                                        <label>Select User</label>
                                        <select className="modern-select" value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} required>
                                            <option value="">Choose a team member</option>
                                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Year</label>
                                        <input className="modern-input" type="number" value={year} onChange={(e) => setYear(e.target.value)} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Month</label>
                                        <select className="modern-select" value={month} onChange={(e) => setMonth(e.target.value)} required>
                                            {[...Array(12)].map((_, i) => <option key={i} value={i+1}>{getMonthName(i+1)}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Target Amount</label>
                                    <input className="modern-input" type="number" value={monthlyTarget} onChange={(e) => setMonthlyTarget(e.target.value)} required placeholder="Enter target amount" />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Target</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                /* All existing styles remain the same, add these new admin-specific styles */
                .current-month-badge-admin, .filter-badge-admin {
                    background: #eef2ff;
                    padding: 6px 12px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    color: #4f46e5;
                    margin-left: 15px;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }

                .clear-filters-btn-admin {
                    background: #4f46e5;
                    color: white;
                    border: none;
                    padding: 4px 10px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.7rem;
                }

                .clear-filters-btn-admin:hover {
                    background: #4338ca;
                }

                .clear-filters-button-admin {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 500;
                    width: 100%;
                    margin-top: 20px;
                }

                .clear-filters-button-admin:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }

                .highlighted-row-admin {
                    background: linear-gradient(90deg, #667eea08, #764ba208);
                }

                .current-tag-admin {
                    font-size: 0.65rem;
                    color: #667eea;
                    font-weight: 500;
                    margin-left: 4px;
                }

                /* Existing styles remain unchanged */
                .target-management-container {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f5f7fa 0%, #e9edf2 100%);
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .hero-section {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 20px 0;
                    text-align: center;
                    color: white;
                    margin-bottom: 20px;
                }

                .hero-content h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 10px;
                    letter-spacing: -0.5px;
                }

                .hero-content p {
                    font-size: 1.1rem;
                    opacity: 0.95;
                }

                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    flex-wrap: wrap;
                    gap: 15px;
                }

                .header-left h3 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #1e293b;
                    margin: 0 0 5px 0;
                }

                .badge-modern {
                    background: #e2e8f0;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: #475569;
                }

                .btn-primary-gradient {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border: none;
                    padding: 10px 24px;
                    border-radius: 12px;
                    color: white;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .btn-primary-gradient:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                }

                .filter-container {
                    background: white;
                    padding: 20px;
                    border-radius: 20px;
                    margin-bottom: 30px;
                    display: flex;
                    gap: 20px;
                    flex-wrap: wrap;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                }

                .filter-group {
                    flex: 1;
                    min-width: 150px;
                }

                .filter-group label {
                    display: block;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #64748b;
                    margin-bottom: 5px;
                }

                .modern-select, .modern-input {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                    background: white;
                }

                .modern-select:focus, .modern-input:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                .table-container {
                    background: white;
                    border-radius: 20px;
                    overflow-x: auto;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                }

                .modern-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .modern-table th {
                    background: #f8fafc;
                    padding: 16px 20px;
                    text-align: left;
                    font-weight: 600;
                    font-size: 0.85rem;
                    color: #475569;
                    border-bottom: 1px solid #e2e8f0;
                }

                .modern-table td {
                    padding: 16px 20px;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 0.9rem;
                }

                .user-cell {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .user-avatar {
                    width: 36px;
                    height: 36px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                }

                .user-name {
                    font-weight: 500;
                    color: #1e293b;
                }

                .period-badge {
                    background: #eef2ff;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: #4f46e5;
                    display: inline-block;
                }

                .target-value {
                    font-weight: 600;
                    color: #1e293b;
                }

                .achieved-value {
                    color: #10b981;
                    font-weight: 500;
                }

                .remaining-value {
                    color: #ef4444;
                    font-weight: 500;
                }

                .progress-cell {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .progress-bar-container {
                    width: 100px;
                    height: 6px;
                    background: #e2e8f0;
                    border-radius: 10px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    border-radius: 10px;
                    transition: width 0.3s ease;
                }

                .progress-percent {
                    font-size: 0.8rem;
                    font-weight: 600;
                    min-width: 45px;
                }

                .action-buttons {
                    display: flex;
                    gap: 8px;
                }

                .btn-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                    background: #f1f5f9;
                }

                .btn-icon.edit:hover {
                    background: #eef2ff;
                    color: #4f46e5;
                }

                .btn-icon.message:hover {
                    background: #ecfdf5;
                    color: #10b981;
                }

                .pagination-modern {
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 30px;
                }

                .pagination-modern button {
                    padding: 8px 14px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .pagination-modern button.active {
                    background: #667eea;
                    color: white;
                    border-color: #667eea;
                }

                .pagination-modern button:hover:not(:disabled) {
                    background: #f1f5f9;
                }

                .user-dashboard {
                    background: white;
                    border-radius: 24px;
                    padding: 30px;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.08);
                }

                .dashboard-header {
                    margin-bottom: 30px;
                }

                .dashboard-header h3 {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 5px 0;
                }

                .current-month-indicator, .filter-indicator {
                    background: #eef2ff;
                    padding: 8px 16px;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    color: #4f46e5;
                    margin-top: 10px;
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                }

                .clear-filters-btn {
                    background: #4f46e5;
                    color: white;
                    border: none;
                    padding: 4px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.75rem;
                }

                .clear-filters-btn:hover {
                    background: #4338ca;
                }

                .clear-filters-button {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 500;
                    width: 100%;
                    margin-top: 20px;
                }

                .clear-filters-button:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .stat-card-primary, .stat-card-success, .stat-card-warning {
                    background: white;
                    padding: 20px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
                    border: 1px solid #f1f5f9;
                }

                .stat-card-primary .stat-icon { font-size: 2rem; }
                .stat-card-success .stat-icon { font-size: 2rem; }
                .stat-card-warning .stat-icon { font-size: 2rem; }

                .stat-info span {
                    font-size: 0.8rem;
                    color: #64748b;
                }

                .stat-info strong {
                    display: block;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1e293b;
                }

                .content-grid {
                    display: grid;
                    grid-template-columns: 1fr 400px;
                    gap: 30px;
                }

                @media (max-width: 900px) {
                    .content-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .table-wrapper {
                    background: white;
                    border-radius: 16px;
                    overflow-x: auto;
                }

                .chart-card {
                    background: white;
                    border-radius: 16px;
                    padding: 20px;
                    border: 1px solid #f1f5f9;
                }

                .chart-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #e2e8f0;
                }

                .chart-badge {
                    background: #eef2ff;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: #4f46e5;
                }

                .pie-chart-container {
                    max-width: 250px;
                    margin: 0 auto 20px;
                }

                .chart-stats {
                    display: flex;
                    justify-content: space-between;
                    gap: 10px;
                    margin-top: 20px;
                }

                .stat-item {
                    flex: 1;
                    text-align: center;
                    padding: 10px;
                    background: #f8fafc;
                    border-radius: 12px;
                }

                .stat-label {
                    display: block;
                    font-size: 0.7rem;
                    color: #64748b;
                    margin-bottom: 5px;
                }

                .stat-value {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #1e293b;
                }

                .stat-item.success .stat-value { color: #10b981; }
                .stat-item.danger .stat-value { color: #ef4444; }

                .highlighted-row {
                    background: linear-gradient(90deg, #667eea08, #764ba208);
                    border-left: 3px solid #667eea;
                }

                .current-tag {
                    font-size: 0.7rem;
                    color: #667eea;
                    font-weight: 500;
                }

                .month-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .modal-container {
                    background: white;
                    border-radius: 24px;
                    width: 90%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                    animation: slideUp 0.3s ease;
                }

                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 24px;
                    border-bottom: 1px solid #e2e8f0;
                }

                .modal-header h3 {
                    margin: 0;
                    font-size: 1.25rem;
                }

                .modal-close {
                    background: none;
                    border: none;
                    font-size: 1.8rem;
                    cursor: pointer;
                    color: #94a3b8;
                }

                .modal-body {
                    padding: 24px;
                }

                .modal-footer {
                    padding: 16px 24px;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 500;
                    margin-bottom: 8px;
                    color: #334155;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }

                .modern-textarea {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    font-family: inherit;
                    resize: vertical;
                }

                .btn-secondary {
                    padding: 10px 20px;
                    background: #f1f5f9;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 500;
                }

                .btn-primary {
                    padding: 10px 20px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    cursor: pointer;
                    font-weight: 500;
                }

                .empty-state {
                    text-align: center;
                    padding: 60px;
                }

                .no-chart-data {
                    text-align: center;
                    padding: 40px 20px;
                    color: #94a3b8;
                }

                .no-chart-data svg {
                    margin-bottom: 15px;
                    color: #cbd5e1;
                }
            `}</style>
        </div>
    );
};

export default TargetManagement;