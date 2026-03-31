import Layout from "../components/Layout";
import DashNav from "./DasNav";
import Footer from "./Footer";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import '../assets/css/target.scss'

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export const API_BASE = import.meta.env.VITE_API_BASE_URL;





const Target = () => {

    const [users, setUsers] = useState([]);
    const [targets, setTargets] = useState([]);

    const [targetModal, setTargetModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [monthlyTarget, setMonthlyTarget] = useState("");
    const [year, setYear] = useState("");
    const [month, setMonth] = useState("");

    const userRole = localStorage.getItem("userRole");
    const userId = Number(localStorage.getItem("userId"));

    const currentYear = new Date().getFullYear();

    const [messageModal, setMessageModal] = useState(false);
    const [messageText, setMessageText] = useState("");
    const [selectedMessageUser, setSelectedMessageUser] = useState(null);

    // ✅ FILTER STATES
    const [filterYear, setFilterYear] = useState("");
    const [filterMonth, setFilterMonth] = useState("");
    const [filterUser, setFilterUser] = useState("");

    // ✅ PAGINATION
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;

    // ================= FETCH USERS =================
    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("adminToken");

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
            console.error(error);
        }
    };

    // ================= FETCH TARGETS =================
    const fetchTargets = async () => {
        try {
            const token = localStorage.getItem("adminToken");

            const response = await fetch(`${API_BASE}/get-target`, {
                headers: {
                    "Accept": "application/json",
                    "Authorization": "Bearer " + token
                }
            });

            const data = await response.json();

            if (response.ok && data.data) {
                setTargets(data.data.data || []);
            }

        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchTargets();
    }, []);

    // ================= FILTER LOGIC =================
    const applyFilters = () => {
        let data = [...users];

        // USER ROLE BASE
        if (userRole !== "admin") {
            data = data.filter(u => u.id === userId);
        }

        // ADMIN USER FILTER
        if (userRole === "admin" && filterUser) {
            data = data.filter(u => u.id === Number(filterUser));
        }

        // YEAR + MONTH FILTER (based on targets)
        if (filterYear || filterMonth) {
            data = data.filter(user => {
                const target = targets.find(t => t.user_id === user.id);

                if (!target) return false;

                const matchYear = filterYear ? target.year == filterYear : true;
                const matchMonth = filterMonth ? target.month == filterMonth : true;

                return matchYear && matchMonth;
            });
        }

        return data;
    };

    const filteredUsersList = applyFilters();

    // ================= PAGINATION =================
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsersList.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsersList.length / usersPerPage);

    // ================= TARGET HELPERS =================
    const getUserTarget = (userId) => {
        return targets.find(t => t.user_id === userId);
    };

    const getMonthName = (month) => {
        const months = [
            "January", "February", "March", "April",
            "May", "June", "July", "August",
            "September", "October", "November", "December"
        ];
        return months[month - 1];
    };

    // ================= MODAL =================
    const openModal = (user) => {
        setSelectedUser(user);

        const userTarget = getUserTarget(user.id);

        const currentDate = new Date();
        setYear(currentDate.getFullYear());
        setMonth(currentDate.getMonth() + 1);

        if (userTarget) {
            setMonthlyTarget(userTarget.target);
        } else {
            setMonthlyTarget("");
        }

        setTargetModal(true);
    };

    const closeModal = () => {
        setTargetModal(false);
        setSelectedUser(null);
        setMonthlyTarget("");
        setYear("");
        setMonth("");
    };



    const openMessageModal = (user) => {
        setSelectedMessageUser(user);
        setMessageText("");
        setMessageModal(true);
    };

    const closeMessageModal = () => {
        setMessageModal(false);
        setSelectedMessageUser(null);
        setMessageText("");
    };



    const handleSendMessage = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("adminToken");

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

            const data = await response.json();

            if (response.ok) {
                toast.success("Message sent ✅");
                closeMessageModal();
            } else {
                toast.error(data.message || "Failed");
            }

        } catch (err) {
            console.error(err);
        }
    };

    // ================= SAVE TARGET =================
    const handleSetTarget = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("adminToken");
            const userTarget = getUserTarget(selectedUser.id);

            const url = userTarget
                ? `${API_BASE}/targets/${userTarget.id}`
                : `${API_BASE}/set-target`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    user_id: selectedUser.id,
                    target: monthlyTarget,
                    year: year,
                    month: month
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(userTarget ? "Target updated ✅" : "Target created ✅");
                closeModal();
                fetchTargets();
            } else {
                toast.error(data.message || "Error");
            }

        } catch (err) {
            console.error(err);
        }
    };




    // ================= CHART DATA =================
    const userTarget = targets.find(t => t.user_id === userId);

    let chartData = null;

    if (userTarget) {
        chartData = {
            labels: ["Achieved", "Remaining"],
            datasets: [
                {
                    data: [userTarget.achieved, userTarget.remaining],
                    backgroundColor: ["#28a745", "#dc3545"],
                    borderWidth: 1,
                },
            ],
        };
    }

    // ================= STATUS =================
    const getProgressStatus = (progress) => {
        if (progress <= 30) return { label: "Poor", color: "#dc3545" };
        if (progress <= 50) return { label: "Average", color: "#fd7e14" };
        if (progress < 100) return { label: "Good Going", color: "#ffc107" };
        if (progress === 100) return { label: "Excellent", color: "#28a745" };

        return { label: "Over Achieved", color: "#20c997" }; // optional
    };


    return (
        <Layout>
            <div className="flex-grow-1">
                <DashNav />

                <div className="container mt-4">

                    {userRole === "admin" ? (

                        /* ================= ADMIN VIEW ================= */
                        <>
                            <h2 className="mb-3">Target Management</h2>

                            {/* FILTERS */}
                            <div className="row mb-3">

                                <div className="col-md-3">
                                    <select className="form-control custom-select" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                                        <option value="">All Year</option>
                                        <option value={currentYear - 1}>{currentYear - 1}</option>
                                        <option value={currentYear}>{currentYear}</option>
                                        <option value={currentYear + 1}>{currentYear + 1}</option>
                                    </select>
                                </div>

                                <div className="col-md-3">
                                    <select className="form-control custom-select" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                                        <option value="">All Month</option>
                                        {[...Array(12)].map((_, i) => (
                                            <option key={i} value={i + 1}>
                                                {getMonthName(i + 1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-3">
                                    <select className="form-control custom-select" value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
                                        <option value="">All Users</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>

                            </div>

                            {/* TABLE */}
                            <table className="table table-bordered">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Name</th>
                                        <th>Year</th>
                                        <th>Month</th>
                                        <th>Target</th>
                                        <th>Achieved</th>
                                        <th>Remaining</th>
                                        <th>Progress</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentUsers.length > 0 ? currentUsers.map(user => {

                                        const userTarget = getUserTarget(user.id);

                                        return (
                                            <tr key={user.id}>
                                                <td>{user.name}</td>
                                                <td>{userTarget ? userTarget.year : "-"}</td>
                                                <td>{userTarget ? getMonthName(userTarget.month) : "-"}</td>
                                                <td>{userTarget ? userTarget.target : 0}</td>
                                                <td>{userTarget ? userTarget.achieved : 0}</td>
                                                <td>{userTarget ? userTarget.remaining : 0}</td>

                                                <td>
                                                    {userTarget ? (
                                                        <div>
                                                            <small>{userTarget.progress}%</small>
                                                            <div className="progress" style={{ height: "8px" }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    style={{ width: `${userTarget.progress}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    ) : "0%"}
                                                </td>

                                                <td>
                                                    <button
                                                        className="btn btn-success btn-sm me-2"
                                                        onClick={() => openModal(user)}
                                                    >
                                                        {userTarget ? "Edit" : "Set"}
                                                    </button>

                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => openMessageModal(user)}
                                                    >
                                                        Message
                                                    </button>
                                                </td>
                                            </tr>
                                        );

                                    }) : (
                                        <tr>
                                            <td colSpan="8" className="text-center">
                                                No users found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* PAGINATION */}
                            <div className="text-center">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i}
                                        className="btn btn-sm btn-success m-1"
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (

                        /* ================= USER VIEW (2 COLUMN) ================= */
                        <div className="row">

                            {/* LEFT SIDE */}
                            <div className="col-lg-7 col-md-12">

                                <h4 className="mb-3">My Target</h4>

                                {/* FILTERS */}
                                <div className="row mb-3">

                                    <div className="col-md-4">
                                        <select className="form-control custom-select" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                                            <option value="">All Year</option>
                                            <option value={currentYear - 1}>{currentYear - 1}</option>
                                            <option value={currentYear}>{currentYear}</option>
                                            <option value={currentYear + 1}>{currentYear + 1}</option>
                                        </select>
                                    </div>

                                    <div className="col-md-4">
                                        <select className="form-control custom-select" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                                            <option value="">All Month</option>
                                            {[...Array(12)].map((_, i) => (
                                                <option key={i} value={i + 1}>
                                                    {getMonthName(i + 1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                </div>

                                {/* TABLE */}
                                <table className="table table-bordered">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Name</th>
                                            <th>Year</th>
                                            <th>Month</th>
                                            <th>Target</th>
                                            <th>Achieved</th>
                                            <th>Remaining</th>
                                            <th>Progress</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {currentUsers.map(user => {

                                            const userTarget = getUserTarget(user.id);

                                            return (
                                                <tr key={user.id}>
                                                    <td>{user.name}</td>
                                                    <td>{userTarget ? userTarget.year : "-"}</td>
                                                    <td>{userTarget ? getMonthName(userTarget.month) : "-"}</td>
                                                    <td>{userTarget ? userTarget.target : 0}</td>
                                                    <td>{userTarget ? userTarget.achieved : 0}</td>
                                                    <td>{userTarget ? userTarget.remaining : 0}</td>

                                                    <td>
                                                        {userTarget ? (
                                                            <div>
                                                                <small>{userTarget.progress}%</small>
                                                                <div className="progress" style={{ height: "8px" }}>
                                                                    <div
                                                                        className="progress-bar"
                                                                        style={{ width: `${userTarget.progress}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        ) : "0%"}
                                                    </td>
                                                </tr>
                                            );

                                        })}
                                    </tbody>
                                </table>

                                {/* PAGINATION - USER */}
                                <div className="text-center mt-3">
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <button
                                            key={i}
                                            className={`btn btn-sm m-1 ${currentPage === i + 1 ? "btn-success" : "btn-success"}`}
                                            onClick={() => setCurrentPage(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                            </div>

                            {/* RIGHT SIDE (GRAPH) */}
                            <div className="col-lg-5 col-md-12">
                                <div className="card p-3 shadow-sm">
                                    <h5 className="text-center mb-3">My Progress</h5>

                                    {userTarget && chartData ? (
                                        <>
                                            {/* PIE CHART */}
                                            <div style={{ maxWidth: "300px", margin: "0 auto" }}>
                                                <Pie data={chartData} />
                                            </div>

                                            {/* INFO */}
                                            <div className="mt-4">

                                                <div className="d-flex justify-content-between">
                                                    <span>Target</span>
                                                    <strong>{userTarget.target}</strong>
                                                </div>

                                                <div className="d-flex justify-content-between">
                                                    <span>Achieved</span>
                                                    <strong className="text-success">{userTarget.achieved}</strong>
                                                </div>

                                                <div className="d-flex justify-content-between">
                                                    <span>Remaining</span>
                                                    <strong className="text-danger">{userTarget.remaining}</strong>
                                                </div>

                                                <hr />

                                                <div className="text-center">
                                                    {(() => {
                                                        const status = getProgressStatus(userTarget.progress);

                                                        return (
                                                            <span
                                                                className="badge"
                                                                style={{
                                                                    backgroundColor: status.color,
                                                                    color: "#fff",
                                                                    padding: "10px 16px",
                                                                    fontSize: "14px"
                                                                }}
                                                            >
                                                                {userTarget.progress}% - {status.label}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>

                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-center">No target data found</p>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}

                </div>



                {messageModal && (
                    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
                        <div className="modal-dialog">
                            <div className="modal-content">

                                <div className="modal-header">
                                    <h5>Send Message to {selectedMessageUser?.name}</h5>
                                    <button className="btn-close" onClick={closeMessageModal}></button>
                                </div>

                                <div className="modal-body">
                                    <form onSubmit={handleSendMessage}>

                                        <div className="mb-3">
                                            <label>Message</label>
                                            <textarea
                                                className="form-control"
                                                rows="4"
                                                value={messageText}
                                                onChange={(e) => setMessageText(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <button className="btn btn-success">Send</button>

                                    </form>
                                </div>

                            </div>
                        </div>
                    </div>
                )}



                {/* MODAL */}
                {targetModal && (
                    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
                        <div className="modal-dialog">
                            <div className="modal-content">

                                <div className="modal-header">
                                    <h5>Set Target for {selectedUser?.name}</h5>
                                    <button className="btn-close" onClick={closeModal}></button>
                                </div>

                                <div className="modal-body">
                                    <form onSubmit={handleSetTarget}>

                                        <div className="mb-3">
                                            <label>Year</label>
                                            <input className="form-control" value={year} onChange={(e) => setYear(e.target.value)} />
                                        </div>

                                        <div className="mb-3">
                                            <label>Month</label>
                                            <input className="form-control" value={month} onChange={(e) => setMonth(e.target.value)} />
                                        </div>

                                        <div className="mb-3">
                                            <label>Target</label>
                                            <input className="form-control" value={monthlyTarget} onChange={(e) => setMonthlyTarget(e.target.value)} />
                                        </div>

                                        <button className="btn btn-success">Save</button>

                                    </form>
                                </div>

                            </div>
                        </div>
                    </div>
                )}

                <ToastContainer />

                <Footer />
            </div>
        </Layout>
    );
};

export default Target;