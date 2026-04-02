import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import "../../src/assets/css/dashboard.scss";
import Layout from "../components/Layout";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement
);

export const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
    const navigate = useNavigate();

    const [data, setData] = useState({
        orders: 0,
        products: 0,
        users: 0,
        review: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem("authToken");

        if (!token) {
            navigate("/admin");
            return;
        }

        const res = await fetch(`${API_BASE}/dashboard-data`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const json = await res.json();

        setData({
            orders: json.orders.length,
            products: json.products.length,
            users: json.users.length,
            review: json.review?.length || 0
        });
    };


    const [monthlySales, setMonthlySales] = useState([]);


    const fetchMonthlySales = async () => {
        const token = localStorage.getItem("authToken");

        const res = await fetch(`${API_BASE}/monthly-visa-stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const json = await res.json();

        if (json.status) {
            setMonthlySales(json.data); // [0,2,5,3,...]
        }
    };


    const [monthlyProperties, setMonthlyProperties] = useState([]);

    const fetchMonthlyProperties = async () => {
        const token = localStorage.getItem("authToken");

        const res = await fetch(`${API_BASE}/monthly-achieved`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const json = await res.json();

        if (json.status) {
            // 🔥 extract only achieved values
            const values = json.data.map(item => item.achieved);

            setMonthlyProperties(values);
        }
    };


    const [topUsers, setTopUsers] = useState([]);

    const fetchTopUsers = async () => {
        const token = localStorage.getItem("authToken");

        const res = await fetch(`${API_BASE}/top-users-achieved`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const json = await res.json();

        if (json.status) {

            const currentMonth = new Date().getMonth() + 1;

            const monthData = json.data.find(item => item.month === currentMonth);

            setTopUsers(monthData?.top_users || []);
        }
    };


    const [summary, setSummary] = useState({
        today_achieved: 0,
        total_achieved: 0,
        total_target: 0,
        total_remaining: 0,
        monthly_achieved: 0
    });



    const fetchSummary = async () => {
        const token = localStorage.getItem("authToken");

        const res = await fetch(`${API_BASE}/achieved-summary`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const json = await res.json();

        if (json.status) {
            setSummary(json.data);
        }
    };



    const [summaryMonth, setSummaryMonth] = useState({});

    const fetchMonthlySummary = async () => {
        const token = localStorage.getItem("authToken");

        const res = await fetch(`${API_BASE}/monthly-summary`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const json = await res.json();

        if (json.status) {
            setSummaryMonth(json.data);
        }
    };



    const [visaStatus, setVisaStatus] = useState({
        pending: 0,
        processing: 0,
        complete: 0,
        total: 0
    });


    const fetchVisaStatus = async () => {
        const token = localStorage.getItem("authToken");

        const res = await fetch(`${API_BASE}/monthly-visa-status-summary`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const json = await res.json();

        if (json.status) {
            setVisaStatus(json.data);
        }
    };


    const [remainders, setRemainders] = useState([]);


    const fetchRemainders = async () => {
        const token = localStorage.getItem("authToken");

        const res = await fetch(`${API_BASE}/get-reviews`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const json = await res.json();

        if (json.status) {
            setRemainders(json.data);
        }
    };


    const getColor = (days) => {
        if (days < 3) return "red";
        if (days >= 5 && days <= 7) return "orange";
        return "green";
    };


    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;



    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const currentItems = remainders.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(remainders.length / itemsPerPage);


    useEffect(() => {
        fetchData();
        fetchMonthlySales();
        fetchMonthlyProperties();
        fetchTopUsers();
        fetchSummary();
        fetchMonthlySummary();
        fetchVisaStatus();
        fetchRemainders();// 👈 add this
    }, []);

    // 🔵 Doughnut (Leads)


    // 🔴 Line (Sales)
    const lineData = {
        labels: [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ],
        datasets: [
            {
                label: "Visa Sales",
                data: monthlySales,
                borderColor: "#e74a3b",
                backgroundColor: "rgba(231, 74, 59, 0.1)",
                fill: true,
                tension: 0.4
            }
        ]
    };


    const lineOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false // ❌ remove "undefined"
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };


    const getMedal = (index) => {
        if (index === 0) return "🥇";
        if (index === 1) return "🥈";
        if (index === 2) return "🥉";
        return "🏅";
    };


    const pieSummaryData = {
        labels: ["Target", "Achieved", "Remaining"],
        datasets: [
            {
                data: [
                    summaryMonth.total_target,
                    summaryMonth.total_achieved,
                    summaryMonth.total_remaining
                ],
                backgroundColor: ["#4e73df", "#1cc88a", "#f6c23e"]
            }
        ]
    };


    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom"
            }
        }
    };


    // 🟢 Bar (Properties)
    const barData = {
        labels: [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ],
        datasets: [
            {
                label: "Monthly Properties",
                data: monthlyProperties,
                backgroundColor: "#1cc88a"
            }
        ]
    };

    return (
        <Layout>
            <div className="dashboard-wrapper mt-4">

                {/* TOP ROW */}
                <div className="row g-4 align-items-stretch">

                    <div className="row g-4 align-items-stretch">

                        {/* Welcome Card */}
                        <div className="col-lg-4 d-flex">
                            <div className="card p-4 shadow-sm text-center w-100 h-100">

                                <p>
                                    You have <strong>{summary.today_achieved}</strong> member achieved today
                                </p>

                                <h5 className="mt-3">
                                    {summary.total_achieved} Total Achieved
                                </h5>

                                <div className="d-flex justify-content-center align-items-center mt-2 text-muted gap-3">
                                    <div
                                        style={{
                                            backgroundColor: "green",
                                            padding: "4px 6px",
                                            borderRadius: "6px",
                                            color: "white",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                    >
                                        <i className="bi bi-graph-up-arrow"></i>
                                    </div>

                                    <span>
                                        This month: {summary.monthly_achieved}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Leads */}
                        <div className="col-lg-4 d-flex">
                            <div className="card p-3 shadow-sm text-center w-100 h-100">

                                {/* Header with Icon */}
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <p className="mb-0 fw-semibold">Monthly Performance</p>

                                    <div
                                        style={{
                                            backgroundColor: "green",
                                            padding: "6px 8px",
                                            borderRadius: "8px",
                                            color: "white",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                    >
                                        <i className="bi bi-activity"></i>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                    <p className="m-0">Target: {summaryMonth.total_target}</p>
                                    <p className="m-0">Achieve: {summaryMonth.total_achieved}</p>
                                    <p className="m-0">Remaining: {summaryMonth.total_remaining}</p>
                                </div>

                                {/* Chart */}
                                <div style={{ height: "150px", width: "150px", margin: "0 auto" }}>
                                    <Doughnut data={pieSummaryData} options={pieOptions} />
                                </div>

                            </div>
                        </div>

                        {/* Sales */}
                        <div className="col-lg-4 d-flex">
                            <div className="card p-3 shadow-sm text-center w-100 h-100">

                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <p className="mb-0 fw-semibold">Total Visa Sales</p>

                                    <div
                                        style={{
                                            backgroundColor: "green",
                                            padding: "6px 8px",
                                            borderRadius: "6px",
                                            color: "white",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                    >
                                        <i className="bi bi-house-fill"></i>
                                    </div>
                                </div>

                                <div style={{ height: "150px" }}>
                                    <Line data={lineData} options={lineOptions} />
                                </div>
                            </div>
                        </div>

                    </div>


                </div>



                <div className="row g-4 mt-2 align-items-stretch">

                    {/* LEFT: Big Chart */}
                    <div className="col-lg-8 d-flex">
                        <div className="card p-4 shadow-sm w-100 h-100">

                            {/* Header */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">Total Member Collection</h5>

                                <div
                                    style={{
                                        backgroundColor: "green",
                                        padding: "8px 10px",
                                        borderRadius: "8px",
                                        color: "white",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}
                                >
                                    <i className="bi bi-people-fill"></i>
                                </div>
                            </div>

                            {/* Chart */}
                            <div style={{ height: "100%" }}>
                                <Bar data={barData} />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="col-lg-4 d-flex flex-column gap-4">

                        {/* Top Performer */}
                        <div className="card p-4 shadow-sm flex-fill">

                            {/* Header with icon */}
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h5 className="mb-0">Top Performer</h5>

                                <div
                                    style={{
                                        backgroundColor: "#ffc107", // yellow
                                        padding: "8px 10px",
                                        borderRadius: "8px",
                                        color: "#000",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}
                                >
                                    <i className="bi bi-trophy-fill"></i>
                                </div>
                            </div>

                            {/* List */}
                            <ul className="list-group mt-3">
                                {topUsers.length > 0 ? (
                                    topUsers.map((user, index) => (
                                        <li
                                            key={index}
                                            className="list-group-item d-flex justify-content-between align-items-center"
                                        >
                                            <span>
                                                {getMedal(index)} {index + 1}. {user.name}
                                            </span>

                                            <span className="badge bg-success">
                                                {user.total_achieved}
                                            </span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="list-group-item text-center">
                                        No data found
                                    </li>
                                )}
                            </ul>
                        </div>


                        {/* Status Box */}


                        <div className="card p-4 shadow-sm flex-fill">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h5 className="mb-0">Monthly Visa Status</h5>

                                <div
                                    style={{
                                        backgroundColor: "green",
                                        padding: "6px 8px",
                                        borderRadius: "8px",
                                        color: "white",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}
                                >
                                    <i className="bi bi-activity"></i>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between mt-3">
                                <span style={{ color: "#ffc107", fontWeight: "500" }}>Pending</span>
                                <b style={{ color: "#ffc107" }}>{visaStatus.pending}</b>
                            </div>

                            <div className="d-flex justify-content-between mt-3">
                                <span style={{ color: "#12b0d8", fontWeight: "500" }}>Processing</span>
                                <b style={{ color: "#12b0d8" }}>{visaStatus.processing}</b>
                            </div>


                            <div className="d-flex justify-content-between mt-3">
                                <span style={{ color: "#1f4b03", fontWeight: "500" }}>Complete</span>
                                <b style={{ color: "#1f4b03" }}>{visaStatus.complete}</b>
                            </div>

                             <div className="d-flex justify-content-between mt-3">
                                <span style={{ color: "#f83a00", fontWeight: "500" }}>Cancle</span>
                                <b style={{ color: "#f83a00" }}>{visaStatus.cancle}</b>
                            </div>
                            <hr />

                            <div className="d-flex justify-content-between">
                                <span>Total</span>
                                <b>{visaStatus.total}</b>
                            </div>
                        </div>




                    </div>

                </div>

                <div className="card p-4 shadow-sm mt-4">

                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0"> Customer Remainder Info</h5>

                        <div
                            style={{
                                backgroundColor: "#0d6efd",
                                padding: "8px 10px",
                                borderRadius: "8px",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <i className="bi bi-bell-fill"></i>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-responsive">
                        

                        {/* TABLE */}
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover align-middle text-center">
                                <thead className="table-light">
                                    <tr>
                                        <th>Customer Name</th>
                                        <th>Phone</th>
                                        <th>Remainder Date Remaining</th>
                                        <th>Invoice</th>
                                        <th>Passport</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentItems.length > 0 ? (
                                        currentItems.map((item, index) => {
                                            const color = getColor(item.remainder_days);

                                            return (
                                                <tr key={index}>
                                                    <td>{item.name}</td>
                                                    <td>{item.phone}</td>

                                                    <td style={{ color: color, fontWeight: "bold" }}>
                                                        {item.remainder_days} Days
                                                    </td>

                                                    <td>{item.invoice}</td>
                                                    <td>{item.passport}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center">
                                                No remainder data found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION (ONLY ONCE) */}
                        <div className="d-flex justify-content-center mt-3">
                            <nav>
                                <ul className="pagination">

                                    {/* Prev */}
                                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage(prev => prev - 1)}
                                        >
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                    </li>

                                    {/* Pages */}
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <li
                                            key={i}
                                            className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                                        >
                                            <button
                                                className="page-link"
                                                onClick={() => setCurrentPage(i + 1)}
                                            >
                                                {i + 1}
                                            </button>
                                        </li>
                                    ))}

                                    {/* Next */}
                                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                        >
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </li>

                                </ul>
                            </nav>
                        </div>
                    </div>

                </div>

            </div>
        </Layout>

    );
};


export default Dashboard;