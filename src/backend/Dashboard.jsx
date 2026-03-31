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
            setTopUsers(json.data);
        }
    };


    const [summary, setSummary] = useState({
        today_achieved: 0,
        total_achieved: 0,
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




    useEffect(() => {
        fetchData();
        fetchMonthlySales();
        fetchMonthlyProperties();
        fetchTopUsers();
        fetchSummary(); // 👈 add this
    }, []);

    // 🔵 Doughnut (Leads)
    const doughnutData = {
        labels: ["Orders", "Products", "Users"],
        datasets: [
            {
                data: [data.orders, data.products, data.users],
                backgroundColor: ["#4e73df", "#1cc88a", "#36b9cc"]
            }
        ]
    };

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
        <div className="dashboard-wrapper">

            {/* TOP ROW */}
            <div className="row g-4 align-items-stretch">

                {/* Welcome Card */}
                <div className="col-lg-4">
                    <div className="card p-4 shadow-sm text-center">
                        <p>You have {summary.today_achieved} member achieved today</p>

                        <h5 className="mt-3">
                            {summary.total_achieved} Total Achieved
                        </h5>

                        <p className="mt-2 text-muted">
                            This month: {summary.monthly_achieved}
                        </p>
                    </div>
                </div>

                {/* Leads */}
                <div className="col-lg-4">
                    <div className="card p-3 shadow-sm text-center">
                        <h5>{data.orders}</h5>
                        <p>New Leads</p>
                        <div style={{ height: "150px" }}>
                            <Doughnut data={doughnutData} />
                        </div>
                    </div>
                </div>

                {/* Sales */}
                <div className="col-lg-4">
                    <div className="card p-3 shadow-sm text-center">
                        <h5>{data.products}</h5>
                        <p>Total Visa Sales </p>
                        <div style={{ height: "150px" }}>
                            <Line data={lineData} options={lineOptions} />
                        </div>
                    </div>
                </div>
            </div>



            <div className="row g-4 mt-2 align-items-stretch">

                {/* LEFT: Big Chart */}
                <div className="col-lg-8 d-flex">
                    <div className="card p-4 shadow-sm w-100 h-100">
                        <h5>Total Member</h5>
                        <div style={{ height: "100%" }}>
                            <Bar data={barData} />
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="col-lg-4 d-flex flex-column gap-4">

                    {/* Top Performer */}
                    <div className="card p-4 shadow-sm flex-fill">
                        <h5>Top Performer</h5>

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
                        <h5>Status</h5>

                        <div className="d-flex justify-content-between mt-3">
                            <span>Products</span>
                            <b>{data.products}</b>
                        </div>

                        <div className="d-flex justify-content-between mt-2">
                            <span>Orders</span>
                            <b>{data.orders}</b>
                        </div>

                        <div className="d-flex justify-content-between mt-2">
                            <span>Users</span>
                            <b>{data.users}</b>
                        </div>

                        <div className="d-flex justify-content-between mt-2">
                            <span>Reviews</span>
                            <b>{data.review}</b>
                        </div>
                    </div>




                </div>

            </div>

        </div>
    );
};

export default Dashboard;