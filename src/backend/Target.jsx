import Layout from "../components/Layout";
import DashNav from "./DasNav";
import Footer from "./Footer";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

export const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Target = () => {

    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);

    const currentYear = new Date().getFullYear();
    // TARGET MODAL
    const [targetModal, setTargetModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [monthlyTarget, setMonthlyTarget] = useState("");
    const [year, setYear] = useState("");
    const [month, setMonth] = useState("");

    const userRole = localStorage.getItem("userRole"); // "admin" or "user"
    const userId = Number(localStorage.getItem("userId"));



    useEffect(() => {
        if (userRole === "admin") {
            setFilteredUsers(users);
        } else {
            const myUser = users.filter(u => u.id === userId);
            setFilteredUsers(myUser);
        }
    }, [users, userRole, userId]);



    const [targets, setTargets] = useState([]);

    const getVisibleTargets = () => {
        if (userRole === "admin") {
            return targets;
        }

        return targets.filter(t => t.user_id === userId);
    };

    const visibleTargets = getVisibleTargets();

    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;



    const openModal = (user) => {
        resetModal();
        setSelectedUser(user);

        const userTarget = getUserTarget(user.id);

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        setYear(currentYear);
        setMonth(currentMonth);

        // 🔥 if exists → prefill
        if (userTarget) {
            setMonthlyTarget(userTarget.target);
        }

        setTargetModal(true);
    };


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
                setTargets(data.data.data || []); // paginate response
            }

        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchTargets(); // 🔥 add this
    }, []);


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
                setFilteredUsers(data.users);
            }

        } catch (error) {
            console.error(error);
        }
    };



    // ================= RESET FUNCTION =================
    const resetModal = () => {
        setSelectedUser(null);
        setMonthlyTarget("");
        setYear("");
        setMonth("");
    };

    // ================= OPEN MODAL =================

    // ================= CLOSE MODAL =================
    const closeModal = () => {
        setTargetModal(false);
        resetModal(); // 🔥 clear when closing
    };



    const getMonthName = (month) => {
        const months = [
            "January", "February", "March", "April",
            "May", "June", "July", "August",
            "September", "October", "November", "December"
        ];
        return months[month - 1];
    };


    // ================= SET TARGET =================
    const handleSetTarget = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("adminToken");

            const userTarget = getUserTarget(selectedUser.id);

            const url = userTarget
                ? `${API_BASE}/targets/${userTarget.id}`   // 🔥 update
                : `${API_BASE}/set-target`;               // 🔥 create

            const method = "POST";

            const response = await fetch(url, {
                method: method,
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
                await fetchTargets();
            } else {
                toast.error(data.message || "Something went wrong");
            }

        } catch (err) {
            console.error(err);
        }
    };


    const getUserTarget = (userId) => {
        return targets.find(t => t.user_id === userId);
    };

    // ================= PAGINATION =================
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    return (
        <Layout>
            <div className="flex-grow-1">
                <DashNav />

                <div className="container mt-4">

                    <h2 className="mb-3">
                        {userRole === "admin" ? "Target Management" : "My Target"}
                    </h2>
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
                            {filteredUsers.length > 0 ? (
                                currentUsers.map(user => {

                                    const userTarget = visibleTargets.find(
                                        t => t.user_id === user.id
                                    );

                                    return (
                                        <tr key={user.id}>
                                            <td>{user.name}</td>

                                            <td>{userTarget ? userTarget.year : "-"}</td>

                                            <td>
                                                {userTarget
                                                    ? getMonthName(userTarget.month)
                                                    : "-"}
                                            </td>

                                            <td>{userTarget ? userTarget.target : 0}</td>

                                            <td>{userTarget ? userTarget.achieved : 0}</td>

                                            <td>{userTarget ? userTarget.remaining : 0}</td>

                                            <td>
                                                {userTarget ? (
                                                    <>
                                                        {userTarget.progress}%
                                                        <div
                                                            className="progress mt-1"
                                                            style={{ height: "6px" }}
                                                        >
                                                            <div
                                                                className="progress-bar bg-success"
                                                                style={{
                                                                    width: `${userTarget.progress}%`
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </>
                                                ) : "0%"}
                                            </td>

                                            <td>
                                                {userRole === "admin" && (
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => openModal(user)}
                                                    >
                                                        {userTarget
                                                            ? "Edit Target"
                                                            : "Set Target"}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
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

                </div>

                {/* TARGET MODAL */}
                {targetModal && (
                    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
                        <div className="modal-dialog">
                            <div className="modal-content">

                                <div className="modal-header">
                                    <p>
                                        Set Target for {selectedUser?.name}
                                    </p>
                                    <button
                                        className="btn-close"
                                        onClick={closeModal} // 🔥 updated
                                    ></button>
                                </div>

                                <div className="modal-body">
                                    <form onSubmit={handleSetTarget}>

                                        {/* YEAR */}
                                        <div className="mb-3">
                                            <label>Year</label>
                                            <select
                                                className="form-control"
                                                value={year}
                                                onChange={(e) => setYear(e.target.value)}
                                                required
                                            >
                                                <option value="">Select Year</option>
                                                <option value={currentYear - 1}>{currentYear - 1}</option>
                                                <option value={currentYear}>{currentYear}</option>
                                                <option value={currentYear + 1}>{currentYear + 1}</option>
                                            </select>
                                        </div>

                                        {/* MONTH */}
                                        <div className="mb-3">
                                            <label>Month</label>
                                            <select
                                                className="form-control"
                                                value={month}
                                                onChange={(e) => setMonth(e.target.value)}
                                                required
                                            >
                                                <option value="">Select Month</option>
                                                <option value="1">January</option>
                                                <option value="2">February</option>
                                                <option value="3">March</option>
                                                <option value="4">April</option>
                                                <option value="5">May</option>
                                                <option value="6">June</option>
                                                <option value="7">July</option>
                                                <option value="8">August</option>
                                                <option value="9">September</option>
                                                <option value="10">October</option>
                                                <option value="11">November</option>
                                                <option value="12">December</option>
                                            </select>
                                        </div>

                                        {/* TARGET */}
                                        <div className="mb-3">
                                            <label>Monthly Target</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={monthlyTarget}
                                                onChange={(e) => setMonthlyTarget(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <button className="btn btn-success btn-sm">
                                            Save Target
                                        </button>

                                    </form>
                                </div>

                            </div>
                        </div>
                    </div>
                )}

                <ToastContainer position="top-right" autoClose={3000} />

                <Footer />
            </div>
        </Layout>
    );
};

export default Target;