// import Layout from "../components/Layout";
// import DashNav from "./DasNav";
// import Footer from "./Footer";
// import { useEffect, useState } from "react";
// import { toast, ToastContainer } from "react-toastify";
// import '../assets/css/target.scss'

// // import { Pie } from "react-chartjs-2";
// // import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// import Chart from "chart.js/auto";
// import { Pie } from "react-chartjs-2";

// // ChartJS.register(ArcElement, Tooltip, Legend);

// export const API_BASE = import.meta.env.VITE_API_BASE_URL;





// const Target = () => {

//     const [users, setUsers] = useState([]);
//     const [targets, setTargets] = useState([]);

//     const [targetModal, setTargetModal] = useState(false);
//     const [selectedUser, setSelectedUser] = useState(null);

//     const [monthlyTarget, setMonthlyTarget] = useState("");
//     const [year, setYear] = useState("");
//     const [month, setMonth] = useState("");

//     const userRole = localStorage.getItem("userRole");
//     const userId = Number(localStorage.getItem("userId"));

//     const currentYear = new Date().getFullYear();

//     const [messageModal, setMessageModal] = useState(false);
//     const [messageText, setMessageText] = useState("");
//     const [selectedMessageUser, setSelectedMessageUser] = useState(null);

//     // ✅ FILTER STATES
//     const [filterYear, setFilterYear] = useState("");
//     const [filterMonth, setFilterMonth] = useState("");
//     const [filterUser, setFilterUser] = useState("");

//     const [selectedUserId, setSelectedUserId] = useState("");

//     // ✅ PAGINATION
//     const [currentPage, setCurrentPage] = useState(1);
//     const usersPerPage = 5;

//     // ================= FETCH USERS =================
//     const fetchUsers = async () => {
//         try {
//             const token = localStorage.getItem("authToken");

//             const response = await fetch(`${API_BASE}/users`, {
//                 headers: {
//                     "Accept": "application/json",
//                     "Authorization": "Bearer " + token
//                 }
//             });

//             const data = await response.json();

//             if (response.ok && data.users) {
//                 setUsers(data.users);
//             }

//         } catch (error) {
//             console.error(error);
//         }
//     };

//     // ================= FETCH TARGETS =================


//     const fetchTargets = async () => {
//         try {
//             const token = localStorage.getItem("authToken");

//             let url = `${API_BASE}/get-target?`;

//             // ✅ Admin filter
//             if (userRole === "admin") {
//                 if (filterYear) url += `year=${filterYear}&`;
//                 if (filterMonth) url += `month=${filterMonth}&`;
//                 if (filterUser) url += `user_id=${filterUser}`;
//             }

//             // ✅ Non-admin always force their own data
//             if (userRole !== "admin") {
//                 url += `user_id=${userId}`;
//                 if (filterYear) url += `&year=${filterYear}`;
//                 if (filterMonth) url += `&month=${filterMonth}`;
//             }

//             const response = await fetch(url, {
//                 headers: {
//                     "Accept": "application/json",
//                     "Authorization": "Bearer " + token
//                 }
//             });

//             const data = await response.json();

//             if (response.ok) {
//                 setTargets(data.data?.data || data.data || []);
//             }

//         } catch (error) {
//             console.error(error);
//         }
//     };



//     useEffect(() => {
//         fetchUsers();
//         fetchTargets();
//     }, [filterYear, filterMonth, filterUser]);

//     // ================= FILTER LOGIC =================
//     const applyFilters = () => {
//         let data = [...users];

//         // USER ROLE BASE
//         if (userRole !== "admin") {
//             data = data.filter(u => u.id === userId);
//         }

//         // ADMIN USER FILTER
//         if (userRole === "admin" && filterUser) {
//             data = data.filter(u => u.id === Number(filterUser));
//         }

//         // YEAR + MONTH FILTER (based on targets)
//         if (filterYear || filterMonth) {
//             data = data.filter(user => {
//                 const target = targets.find(t => t.user_id === user.id);

//                 if (!target) return false;

//                 const matchYear = filterYear ? target.year == filterYear : true;
//                 const matchMonth = filterMonth ? target.month == filterMonth : true;

//                 return matchYear && matchMonth;
//             });
//         }

//         return data;
//     };

//     const filteredUsersList = applyFilters();

//     // ================= PAGINATION =================
//     const indexOfLastUser = currentPage * usersPerPage;
//     const indexOfFirstUser = indexOfLastUser - usersPerPage;
//     const currentUsers = filteredUsersList.slice(indexOfFirstUser, indexOfLastUser);
//     const totalPages = Math.ceil(filteredUsersList.length / usersPerPage);

//     // ================= TARGET HELPERS =================


//     const getUserTarget = (uid) => {
//         return targets.find(t => t.user_id === uid);
//     };


//     const getMonthName = (month) => {
//         const months = [
//             "January", "February", "March", "April",
//             "May", "June", "July", "August",
//             "September", "October", "November", "December"
//         ];
//         return months[month - 1];
//     };

//     // ================= MODAL =================

//     const openModal = (user) => {
//         setSelectedUser(user);

//         const currentDate = new Date();
//         setYear(currentDate.getFullYear());
//         setMonth(currentDate.getMonth() + 1);

//         if (user) {
//             setSelectedUserId(user.id); // ✅ edit mode
//             const userTarget = getUserTarget(user.id);

//             if (userTarget) {
//                 setMonthlyTarget(userTarget.target);
//             } else {
//                 setMonthlyTarget("");
//             }
//         } else {
//             // ✅ NEW TARGET
//             setSelectedUserId("");
//             setMonthlyTarget("");
//         }

//         setTargetModal(true);
//     };


//     const closeModal = () => {
//         setTargetModal(false);
//         setSelectedUser(null);
//         setMonthlyTarget("");
//         setYear("");
//         setMonth("");
//     };



//     const openMessageModal = (user) => {
//         setSelectedMessageUser(user);
//         setMessageText("");
//         setMessageModal(true);
//     };

//     const closeMessageModal = () => {
//         setMessageModal(false);
//         setSelectedMessageUser(null);
//         setMessageText("");
//     };



//     const handleSendMessage = async (e) => {
//         e.preventDefault();

//         try {
//             const token = localStorage.getItem("authToken");

//             const response = await fetch(`${API_BASE}/send-notification`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": "Bearer " + token
//                 },
//                 body: JSON.stringify({
//                     user_id: selectedMessageUser.id,
//                     message: messageText
//                 })
//             });

//             const data = await response.json();

//             if (response.ok) {
//                 toast.success("Message sent ✅");
//                 closeMessageModal();
//             } else {
//                 toast.error(data.message || "Failed");
//             }

//         } catch (err) {
//             console.error(err);
//         }
//     };

//     // ================= SAVE TARGET =================
//     const handleSetTarget = async (e) => {
//         e.preventDefault();

//         try {
//             const token = localStorage.getItem("authToken");

//             const finalUserId = selectedUser ? selectedUser.id : selectedUserId;

//             if (!finalUserId) {
//                 toast.error("Please select user ❌");
//                 return;
//             }

//             const userTarget = selectedUser ? getUserTarget(selectedUser.id) : null;

//             const url = userTarget
//                 ? `${API_BASE}/targets/${userTarget.id}`
//                 : `${API_BASE}/set-target`;

//             const response = await fetch(url, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": "Bearer " + token
//                 },
//                 body: JSON.stringify({
//                     user_id: finalUserId,
//                     target: monthlyTarget,
//                     year: year,
//                     month: month
//                 })
//             });

//             const data = await response.json();

//             if (response.ok) {
//                 toast.success(userTarget ? "Target updated ✅" : "Target created ✅");
//                 closeModal();
//                 fetchTargets();
//             } else {
//                 toast.error(data.message || "Error");
//             }

//         } catch (err) {
//             console.error(err);
//         }
//     };



//     // ================= CHART DATA =================
//     // ================= CHART DATA =================

//     // ✅ current selected filter অনুযায়ী target বের করো
//     const userTarget = targets.find(t => {
//         return (
//             t.user_id === userId &&
//             (filterYear ? t.year == filterYear : true) &&
//             (filterMonth ? t.month == filterMonth : true)
//         );
//     });

//     let chartData = null;

//     if (userTarget) {
//         const achieved = Number(userTarget.achieved) || 0;
//         const remaining = Number(userTarget.remaining) || 0;

//         // ❗ IMPORTANT: chart render only if any value > 0
//         if (achieved > 0 || remaining > 0) {
//             chartData = {
//                 labels: ["Achieved", "Remaining"],
//                 datasets: [
//                     {
//                         data: [achieved, remaining],
//                         backgroundColor: ["#28a745", "#dc3545"],
//                         borderWidth: 1,
//                     },
//                 ],
//             };
//         }
//     }
//     // ================= STATUS =================
//     const getProgressStatus = (progress) => {
//         if (progress <= 30) return { label: "Poor", color: "#dc3545" };
//         if (progress <= 50) return { label: "Average", color: "#fd7e14" };
//         if (progress < 100) return { label: "Good Going", color: "#ffc107" };
//         if (progress === 100) return { label: "Excellent", color: "#28a745" };

//         return { label: "Over Achieved", color: "#20c997" }; // optional
//     };


//     return (
//         <Layout>
//             <div className="flex-grow-1">
//                 <DashNav />

//                 <div className="container mt-4">

//                     {userRole === "admin" ? (

//                         /* ================= ADMIN VIEW ================= */
//                         <>
//                             <div className="d-flex justify-content-between align-items-center mb-3">
//                                 <h2>Target Management</h2>

//                                 <button
//                                     className="btn btn-success"
//                                     onClick={() => openModal(null)} // 🔥 IMPORTANT
//                                 >
//                                     + Set New Target
//                                 </button>
//                             </div>

//                             {/* FILTERS */}
//                             <div className="row mb-3">

//                                 <div className="col-md-3">
//                                     <select className="form-control custom-select" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
//                                         <option value="">All Year</option>
//                                         <option value={currentYear - 1}>{currentYear - 1}</option>
//                                         <option value={currentYear}>{currentYear}</option>
//                                         <option value={currentYear + 1}>{currentYear + 1}</option>
//                                     </select>
//                                 </div>

//                                 <div className="col-md-3">
//                                     <select className="form-control custom-select" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
//                                         <option value="">All Month</option>
//                                         {[...Array(12)].map((_, i) => (
//                                             <option key={i} value={i + 1}>
//                                                 {getMonthName(i + 1)}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>

//                                 <div className="col-md-3">
//                                     <select className="form-control custom-select" value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
//                                         <option value="">All Users</option>
//                                         {users.map(u => (
//                                             <option key={u.id} value={u.id}>{u.name}</option>
//                                         ))}
//                                     </select>
//                                 </div>

//                             </div>

//                             {/* TABLE */}
//                             <table className="table table-bordered">
//                                 <thead className="table-dark">
//                                     <tr>
//                                         <th>Name</th>
//                                         <th>Year</th>
//                                         <th>Month</th>
//                                         <th>Target</th>
//                                         <th>Achieved</th>
//                                         <th>Remaining</th>
//                                         <th>Progress</th>
//                                         <th>Action</th>
//                                     </tr>
//                                 </thead>

//                                 <tbody>
//                                     {currentUsers.length > 0 ? currentUsers.map(user => {

//                                         const userTarget = getUserTarget(user.id);

//                                         return (
//                                             <tr key={user.id}>
//                                                 <td>{user.name}</td>
//                                                 <td>{userTarget ? userTarget.year : "-"}</td>
//                                                 <td>{userTarget ? getMonthName(userTarget.month) : "-"}</td>
//                                                 <td>{userTarget ? userTarget.target : 0}</td>
//                                                 <td>{userTarget ? userTarget.achieved : 0}</td>
//                                                 <td>{userTarget ? userTarget.remaining : 0}</td>

//                                                 <td>
//                                                     {userTarget ? (
//                                                         <div>
//                                                             <small>{userTarget.progress}%</small>
//                                                             <div className="progress" style={{ height: "8px" }}>
//                                                                 <div
//                                                                     className="progress-bar"
//                                                                     style={{ width: `${userTarget.progress}%` }}
//                                                                 ></div>
//                                                             </div>
//                                                         </div>
//                                                     ) : "0%"}
//                                                 </td>

//                                                 <td>
//                                                     <button
//                                                         className="btn btn-success
//                                                          btn-sm me-2"
//                                                         onClick={() => openModal(user)}
//                                                     >
//                                                         Edit
//                                                     </button>

//                                                     <button
//                                                         className="btn btn-success btn-sm"
//                                                         onClick={() => openMessageModal(user)}
//                                                     >
//                                                         Message
//                                                     </button>
//                                                 </td>
//                                             </tr>
//                                         );

//                                     }) : (
//                                         <tr>
//                                             <td colSpan="8" className="text-center">
//                                                 No users found
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>

//                             {/* PAGINATION */}
//                             <div className="text-center">
//                                 {Array.from({ length: totalPages }, (_, i) => (
//                                     <button
//                                         key={i}
//                                         className="btn btn-sm btn-success m-1"
//                                         onClick={() => setCurrentPage(i + 1)}
//                                     >
//                                         {i + 1}
//                                     </button>
//                                 ))}
//                             </div>
//                         </>
//                     ) : (

//                         /* ================= USER VIEW (2 COLUMN) ================= */
//                         <div className="row">

//                             {/* LEFT SIDE */}
//                             <div className="col-lg-7 col-md-12">

//                                 <h4 className="mb-3">My Target</h4>

//                                 {/* FILTERS */}
//                                 <div className="row mb-3">

//                                     <div className="col-md-4">
//                                         <select className="form-control custom-select" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
//                                             <option value="">All Year</option>
//                                             <option value={currentYear - 1}>{currentYear - 1}</option>
//                                             <option value={currentYear}>{currentYear}</option>
//                                             <option value={currentYear + 1}>{currentYear + 1}</option>
//                                         </select>
//                                     </div>

//                                     <div className="col-md-4">
//                                         <select className="form-control custom-select" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
//                                             <option value="">All Month</option>
//                                             {[...Array(12)].map((_, i) => (
//                                                 <option key={i} value={i + 1}>
//                                                     {getMonthName(i + 1)}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>

//                                 </div>

//                                 {/* TABLE */}
//                                 <table className="table table-bordered">
//                                     <thead className="table-dark">
//                                         <tr>
//                                             <th>Name</th>
//                                             <th>Year</th>
//                                             <th>Month</th>
//                                             <th>Target</th>
//                                             <th>Achieved</th>
//                                             <th>Remaining</th>
//                                             <th>Progress</th>
//                                         </tr>
//                                     </thead>

//                                     <tbody>
//                                         {currentUsers.map(user => {

//                                             const userTarget = getUserTarget(user.id);

//                                             return (
//                                                 <tr key={user.id}>
//                                                     <td>{user.name}</td>
//                                                     <td>{userTarget ? userTarget.year : "-"}</td>
//                                                     <td>{userTarget ? getMonthName(userTarget.month) : "-"}</td>
//                                                     <td>{userTarget ? userTarget.target : 0}</td>
//                                                     <td>{userTarget ? userTarget.achieved : 0}</td>
//                                                     <td>{userTarget ? userTarget.remaining : 0}</td>

//                                                     <td>
//                                                         {userTarget ? (
//                                                             <div>
//                                                                 <small>{userTarget.progress}%</small>
//                                                                 <div className="progress" style={{ height: "8px" }}>
//                                                                     <div
//                                                                         className="progress-bar"
//                                                                         style={{ width: `${userTarget.progress}%` }}
//                                                                     ></div>
//                                                                 </div>
//                                                             </div>
//                                                         ) : "0%"}
//                                                     </td>
//                                                 </tr>
//                                             );

//                                         })}
//                                     </tbody>
//                                 </table>

//                                 {/* PAGINATION - USER */}
//                                 <div className="text-center mt-3">
//                                     {Array.from({ length: totalPages }, (_, i) => (
//                                         <button
//                                             key={i}
//                                             className={`btn btn-sm m-1 ${currentPage === i + 1 ? "btn-success" : "btn-success"}`}
//                                             onClick={() => setCurrentPage(i + 1)}
//                                         >
//                                             {i + 1}
//                                         </button>
//                                     ))}
//                                 </div>

//                             </div>

//                             {/* RIGHT SIDE (GRAPH) */}
//                             <div className="col-lg-5 col-md-12">
//                                 <div className="card p-3 shadow-sm">
//                                     <h5 className="text-center mb-3">My Progress</h5>

//                                     {chartData ? (
//                                         <>
//                                             {/* PIE CHART */}
//                                             <div style={{ width: "300px", height: "300px", margin: "0 auto" }}>
//                                                 <Pie data={chartData} />
//                                             </div>
//                                             {/* INFO */}
//                                             <div className="mt-4">

//                                                 <div className="d-flex justify-content-between">
//                                                     <span>Target</span>
//                                                     <strong>{userTarget.target}</strong>
//                                                 </div>

//                                                 <div className="d-flex justify-content-between">
//                                                     <span>Achieved</span>
//                                                     <strong className="text-success">{userTarget.achieved}</strong>
//                                                 </div>

//                                                 <div className="d-flex justify-content-between">
//                                                     <span>Remaining</span>
//                                                     <strong className="text-danger">{userTarget.remaining}</strong>
//                                                 </div>

//                                                 <hr />

//                                                 <div className="text-center">
//                                                     {(() => {
//                                                         const status = getProgressStatus(userTarget.progress);

//                                                         return (
//                                                             <span
//                                                                 className="badge"
//                                                                 style={{
//                                                                     backgroundColor: status.color,
//                                                                     color: "#fff",
//                                                                     padding: "10px 16px",
//                                                                     fontSize: "14px"
//                                                                 }}
//                                                             >
//                                                                 {userTarget.progress}% - {status.label}
//                                                             </span>
//                                                         );
//                                                     })()}
//                                                 </div>

//                                             </div>
//                                         </>
//                                     ) : (
//                                         <p className="text-center">No target data found</p>
//                                     )}
//                                 </div>
//                             </div>

//                         </div>
//                     )}

//                 </div>



//                 {messageModal && (
//                     <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
//                         <div className="modal-dialog">
//                             <div className="modal-content">

//                                 <div className="modal-header">
//                                     <h5>Send Message to {selectedMessageUser?.name}</h5>
//                                     <button className="btn-close" onClick={closeMessageModal}></button>
//                                 </div>

//                                 <div className="modal-body">
//                                     <form onSubmit={handleSendMessage}>

//                                         <div className="mb-3">
//                                             <label>Message</label>
//                                             <textarea
//                                                 className="form-control"
//                                                 rows="4"
//                                                 value={messageText}
//                                                 onChange={(e) => setMessageText(e.target.value)}
//                                                 required
//                                             />
//                                         </div>

//                                         <button className="btn btn-success">Send</button>

//                                     </form>
//                                 </div>

//                             </div>
//                         </div>
//                     </div>
//                 )}



//                 {/* MODAL */}
//                 {targetModal && (
//                     <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
//                         <div className="modal-dialog">
//                             <div className="modal-content">

//                                 <div className="modal-header">
//                                     <h5>
//                                         {selectedUser
//                                             ? `Edit Target for ${selectedUser?.name}`
//                                             : "Set New Target"}
//                                     </h5>
//                                     <button className="btn-close" onClick={closeModal}></button>
//                                 </div>

//                                 <div className="modal-body">
//                                     <form onSubmit={handleSetTarget}>

//                                         {/* USER SELECT (ONLY FOR NEW TARGET) */}
//                                         {!selectedUser && (
//                                             <div className="mb-3">
//                                                 <label>User</label>
//                                                 <select
//                                                     className="form-control"
//                                                     value={selectedUserId}
//                                                     onChange={(e) => setSelectedUserId(e.target.value)}
//                                                     required
//                                                 >
//                                                     <option value="">Select User</option>
//                                                     {users.map(u => (
//                                                         <option key={u.id} value={u.id}>
//                                                             {u.name}
//                                                         </option>
//                                                     ))}
//                                                 </select>
//                                             </div>
//                                         )}

//                                         <div className="mb-3">
//                                             <label>Year</label>
//                                             <input className="form-control" value={year} onChange={(e) => setYear(e.target.value)} />
//                                         </div>

//                                         <div className="mb-3">
//                                             <label>Month</label>
//                                             <select
//                                                 className="form-control"
//                                                 value={month}
//                                                 onChange={(e) => setMonth(e.target.value)}
//                                                 required
//                                             >
//                                                 <option value="">Select Month</option>
//                                                 {[...Array(12)].map((_, i) => (
//                                                     <option key={i} value={i + 1}>
//                                                         {getMonthName(i + 1)}
//                                                     </option>
//                                                 ))}
//                                             </select>
//                                         </div>

//                                         <div className="mb-3">
//                                             <label>Target</label>
//                                             <input className="form-control" value={monthlyTarget} onChange={(e) => setMonthlyTarget(e.target.value)} />
//                                         </div>

//                                         <button className="btn btn-success">Save</button>

//                                     </form>
//                                 </div>

//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 <ToastContainer />

//                 <Footer />
//             </div>
//         </Layout>
//     );
// };

// export default Target;



import Layout from "../components/Layout";
import DashNav from "./DasNav";
import Footer from "./Footer";
import { useEffect, useState, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import '../assets/css/target.scss'
import Chart from "chart.js/auto";
import { Pie } from "react-chartjs-2";

export const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Target = () => {
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

    const getUserTarget = (uid) => {
        return targets.find(t => t.user_id === uid);
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

            const userTarget = getUserTarget(finalUserId);
            // Live server এ অনেক সময় PUT মেথড কাজ করে না, তাই POST এ ওভাররাইড করার চেষ্টা করা হয়েছে
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
    const myTarget = targets.find(t => t.user_id === userId);
    let chartData = null;
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

    return (
        <Layout>
            <ToastContainer />
            <div className="flex-grow-1">
                <DashNav />
                <div className="container mt-4">
                    {userRole === "admin" ? (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h2>Target Management</h2>
                                <button className="btn btn-success" onClick={() => openModal(null)}>+ Set New Target</button>
                            </div>
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
                                            <option key={i} value={i + 1}>{getMonthName(i + 1)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <select className="form-control custom-select" value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
                                        <option value="">All Users</option>
                                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <table className="table table-bordered">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Name</th><th>Year</th><th>Month</th><th>Target</th><th>Achieved</th><th>Remaining</th><th>Progress</th><th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentUsers.length > 0 ? currentUsers.map(user => {
                                        const t = getUserTarget(user.id);
                                        return (
                                            <tr key={user.id}>
                                                <td>{user.name}</td>
                                                <td>{t ? t.year : "-"}</td>
                                                <td>{t ? getMonthName(t.month) : "-"}</td>
                                                <td>{t ? t.target : 0}</td>
                                                <td>{t ? t.achieved : 0}</td>
                                                <td>{t ? t.remaining : 0}</td>
                                                <td>
                                                    {t ? (
                                                        <div>
                                                            <small>{t.progress}%</small>
                                                            <div className="progress" style={{ height: "8px" }}>
                                                                <div className="progress-bar" style={{ width: `${t.progress}%` }}></div>
                                                            </div>
                                                        </div>
                                                    ) : "0%"}
                                                </td>
                                                <td>
                                                    <button className="btn btn-success btn-sm me-2" onClick={() => openModal(user)}>Edit</button>
                                                    <button className="btn btn-success btn-sm" onClick={() => openMessageModal(user)}>Message</button>
                                                </td>
                                            </tr>
                                        );
                                    }) : <tr><td colSpan="8" className="text-center">No users found</td></tr>}
                                </tbody>
                            </table>
                            <div className="text-center">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button key={i} className={`btn btn-sm m-1 ${currentPage === i+1 ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="row">
                            <div className="col-lg-7 col-md-12">
                                <h4 className="mb-3">My Target</h4>
                                <div className="row mb-3">
                                    <div className="col-md-4">
                                        <select className="form-control custom-select" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                                            <option value="">All Year</option>
                                            <option value={currentYear}>{currentYear}</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <select className="form-control custom-select" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                                            <option value="">All Month</option>
                                            {[...Array(12)].map((_, i) => <option key={i} value={i + 1}>{getMonthName(i + 1)}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <table className="table table-bordered">
                                    <thead className="table-dark">
                                        <tr><th>Name</th><th>Year</th><th>Month</th><th>Target</th><th>Achieved</th><th>Remaining</th><th>Progress</th></tr>
                                    </thead>
                                    <tbody>
                                        {currentUsers.map(user => {
                                            const t = getUserTarget(user.id);
                                            return (
                                                <tr key={user.id}>
                                                    <td>{user.name}</td>
                                                    <td>{t ? t.year : "-"}</td>
                                                    <td>{t ? getMonthName(t.month) : "-"}</td>
                                                    <td>{t ? t.target : 0}</td>
                                                    <td>{t ? t.achieved : 0}</td>
                                                    <td>{t ? t.remaining : 0}</td>
                                                    <td>{t ? `${t.progress}%` : "0%"}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="col-lg-5 col-md-12">
                                <div className="card p-3 shadow-sm">
                                    <h5 className="text-center mb-3">My Progress</h5>
                                    {chartData ? (
                                        <div style={{ width: "250px", margin: "0 auto" }}>
                                            <Pie data={chartData} />
                                            <div className="mt-3">
                                                <div className="d-flex justify-content-between"><span>Target:</span> <strong>{myTarget.target}</strong></div>
                                                <div className="d-flex justify-content-between text-success"><span>Achieved:</span> <strong>{myTarget.achieved}</strong></div>
                                                <div className="d-flex justify-content-between text-danger"><span>Remaining:</span> <strong>{myTarget.remaining}</strong></div>
                                            </div>
                                        </div>
                                    ) : <p className="text-center">No chart data</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- Modals remain with same design --- */}
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
                                        <textarea className="form-control mb-3" rows="4" value={messageText} onChange={(e) => setMessageText(e.target.value)} required placeholder="Type message..." />
                                        <button className="btn btn-success w-100">Send</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {targetModal && (
                    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5>{selectedUser ? `Edit Target: ${selectedUser.name}` : "Set New Target"}</h5>
                                    <button className="btn-close" onClick={closeModal}></button>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={handleSetTarget}>
                                        {!selectedUser && (
                                            <div className="mb-3">
                                                <label>User</label>
                                                <select className="form-control" value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} required>
                                                    <option value="">Select User</option>
                                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                                </select>
                                            </div>
                                        )}
                                        <div className="mb-3"><label>Year</label><input className="form-control" value={year} onChange={(e) => setYear(e.target.value)} /></div>
                                        <div className="mb-3">
                                            <label>Month</label>
                                            <select className="form-control" value={month} onChange={(e) => setMonth(e.target.value)}>
                                                {[...Array(12)].map((_, i) => <option key={i} value={i + 1}>{getMonthName(i + 1)}</option>)}
                                            </select>
                                        </div>
                                        <div className="mb-3"><label>Target Amount</label><input className="form-control" type="number" value={monthlyTarget} onChange={(e) => setMonthlyTarget(e.target.value)} required /></div>
                                        <button className="btn btn-success w-100">Save Target</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </Layout>
    );
};

export default Target;