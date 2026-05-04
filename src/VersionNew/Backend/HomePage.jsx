import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend,
    CategoryScale, LinearScale, BarElement, LineElement, PointElement
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
    ArcElement, Tooltip, Legend, CategoryScale,
    LinearScale, BarElement, LineElement, PointElement
);

export const API_BASE = import.meta.env.VITE_API_BASE_URL;

const HomePage = () => {
    const navigate = useNavigate();
    // লেআউট থেকে darkMode স্টেট পাওয়ার জন্য context ব্যবহার করা হয়েছে
    const [darkMode] = useOutletContext(); 

    // Data States
    const [monthlyProperties, setMonthlyProperties] = useState([]);
    const [topUsers, setTopUsers] = useState([]);
    const [summary, setSummary] = useState({ today_achieved: 0, total_achieved: 0, monthly_achieved: 0 });
    const [summaryMonth, setSummaryMonth] = useState({ total_target: 0, total_achieved: 0, total_remaining: 0 });
    const [visaStatus, setVisaStatus] = useState({ pending: 0, processing: 0, complete: 0, cancle: 0 });
    const [remainders, setRemainders] = useState([]);
    const [topSales, setTopSales] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            navigate("/admin");
        } else {
            fetchAllData();
        }
    }, []);

    const fetchAllData = () => {
        fetchMonthlyProperties();
        fetchTopUsers();
        fetchSummary();
        fetchMonthlySummary();
        fetchVisaStatus();
        fetchRemainders();
        fetchTopSales();
    };

    const fetchMonthlyProperties = async () => {
        const res = await fetch(`${API_BASE}/monthly-achieved`, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });
        const json = await res.json();
        if (json.status) setMonthlyProperties(json.data.map(item => item.achieved));
    };

    const fetchTopUsers = async () => {
        const res = await fetch(`${API_BASE}/top-users-achieved`, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });
        const json = await res.json();
        if (json.status) {
            const currentMonth = new Date().getMonth() + 1;
            const monthData = json.data.find(item => item.month === currentMonth);
            setTopUsers(monthData?.top_users || []);
        }
    };

    const fetchSummary = async () => {
        const res = await fetch(`${API_BASE}/achieved-summary`, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });
        const json = await res.json();
        if (json.status) setSummary(json.data);
    };

    const fetchMonthlySummary = async () => {
        const res = await fetch(`${API_BASE}/monthly-summary`, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });
        const json = await res.json();
        if (json.status) setSummaryMonth(json.data);
    };

    const fetchVisaStatus = async () => {
        const res = await fetch(`${API_BASE}/monthly-visa-status-summary`, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });
        const json = await res.json();
        if (json.status) setVisaStatus(json.data);
    };

    const fetchRemainders = async () => {
        const res = await fetch(`${API_BASE}/get-reviews`, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });
        const json = await res.json();
        if (json.status) setRemainders(json.data);
    };

    const fetchTopSales = async () => {
        const res = await fetch(`${API_BASE}/get-topsales`, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });
        const json = await res.json();
        if (json.status) setTopSales(json.data);
    };

    const getColor = (days) => days <= 3 ? "#ff4d4d" : days <= 7 ? "#ffa502" : "#2ed573";
    const getMedal = (index) => ["🥇", "🥈", "🥉", "🏅", "🏅"][index] || "🏅";

    const pieSummaryData = {
        labels: ["Target", "Achieved", "Remaining"],
        datasets: [{
            data: [summaryMonth.total_target, summaryMonth.total_achieved, summaryMonth.total_remaining],
            backgroundColor: ["#4e73df", "#1cc88a", "#f6c23e"],
            borderWidth: 0
        }]
    };

    const barData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [{ label: "Collection", data: monthlyProperties, backgroundColor: "#4e73df", borderRadius: 5 }]
    };

    const currentItems = remainders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div style={{ color: darkMode ? '#ffffff' : '#212529' }}>
            <div className="row g-4">
                <div className="col-md-4">
                    <div className="card glass-card p-4 border-0 shadow-sm rounded-4 h-100">
                        <h6 className={`fw-bold mb-3 ${darkMode ? 'text-info' : 'text-success'}`}>Daily Achieved</h6>
                        <h5 className="fw-bold">Today: {summary.today_achieved}</h5>
                        <h5 className="fw-bold">Monthly: {summary.monthly_achieved}</h5>
                        <p className={`small mb-0 ${darkMode ? 'text-light-50' : 'text-muted'}`}>Total: {summary.total_achieved}</p>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card glass-card p-4 border-0 shadow-sm rounded-4 h-100 d-flex flex-row align-items-center">
                        <div style={{ width: '80px' }}>
                            <Doughnut data={pieSummaryData} options={{ plugins: { legend: { display: false } } }} />
                        </div>
                        <div className="ms-3">
                            <h6 className="small fw-bold mb-2">Monthly Performance</h6>
                            <div className="small text-primary">Target: {summaryMonth.total_target}</div>
                            <div className="small text-success fw-bold">Achieved: {summaryMonth.total_achieved}</div>
                            <div className="small text-warning">Remaining: {summaryMonth.total_remaining}</div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card glass-card p-4 border-0 shadow-sm rounded-4 h-100">
                        <h6 className="fw-bold mb-3">Visa Status Overview</h6>
                        <div className="d-flex flex-column gap-1 small">
                            <div className="d-flex justify-content-between"><span>Processing:</span> <b className="text-primary">{visaStatus.processing}</b></div>
                            <div className="d-flex justify-content-between"><span>Completed:</span> <b className="text-success">{visaStatus.complete}</b></div>
                            <div className="d-flex justify-content-between"><span>Cancelled:</span> <b className="text-danger">{visaStatus.cancle}</b></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top 5 Visa Sales Performer Section */}
            <div className="card glass-card border-0 shadow-sm rounded-4 mt-4 p-4">
                <h6 className="fw-bold mb-4 text-uppercase">
                    <i className="bi bi-trophy-fill text-warning me-2"></i>Top 5 Visa Sales Performer
                </h6>
                <div className="row g-3">
                    {topSales.slice(0, 5).map((item, index) => (
                        <div key={index} className="col-lg col-md-6 col-sm-12">
                            <div className={`text-center p-3 rounded-4 border transition-hover h-100 ${darkMode ? 'border-secondary' : ''}`}>
                                <div className="fs-3 mb-1">{getMedal(index)}</div>
                                <div className="small fw-bold text-truncate">{item.team?.name || "N/A"}</div>
                                <div className="text-primary fw-bold mt-1 fs-5">{item.total_visas} <span className="small fw-normal">Visas</span></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="row g-4 mt-2">
                <div className="col-lg-8">
                    <div className="card glass-card p-4 border-0 shadow-sm rounded-4">
                        <h6 className="fw-bold mb-4">Collection Analytics</h6>
                        <div style={{ height: '300px' }}>
                            <Bar data={barData} options={{
                                maintainAspectRatio: false, 
                                scales: {
                                    y: { ticks: { color: darkMode ? '#fff' : '#666' } },
                                    x: { ticks: { color: darkMode ? '#fff' : '#666' } }
                                }
                            }} />
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card glass-card p-4 border-0 shadow-sm rounded-4 h-100">
                        <h6 className="fw-bold mb-3">Monthly Top Achievers</h6>
                        {topUsers.map((user, i) => (
                            <div key={i} className={`d-flex align-items-center justify-content-between mb-3 border-bottom pb-2 ${darkMode ? 'border-secondary' : ''}`}>
                                <span className="small">{getMedal(i)} {user.name}</span>
                                <span className="badge bg-primary-soft text-primary">{user.total_achieved}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="card glass-card border-0 shadow-sm rounded-4 mt-4 p-4 mb-4">
                <h6 className="fw-bold mb-3">Customer Remainder List</h6>
                <div className="table-responsive">
                    <table className={`table table-hover small ${darkMode ? 'table-dark' : ''}`}>
                        <thead>
                            <tr><th>Customer</th><th>Phone</th><th>Remaining</th><th>Invoice</th><th>Passport</th></tr>
                        </thead>
                        <tbody>
                            {currentItems.map((item, idx) => (
                                <tr key={idx}>
                                    <td className={darkMode ? 'text-light' : ''}>{item.name}</td>
                                    <td className={darkMode ? 'text-light' : ''}>{item.phone}</td>
                                    <td><span className="badge px-2 py-1" style={{ backgroundColor: getColor(item.remainder_days) + '22', color: getColor(item.remainder_days) }}>{item.remainder_days} Days</span></td>
                                    <td className={darkMode ? 'text-light' : ''}>#{item.invoice}</td>
                                    <td className={darkMode ? 'text-light' : ''}>#{item.passport}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx>{`
                .glass-card { background: ${darkMode ? '#1e1e1e' : '#ffffff'}; color: ${darkMode ? '#ffffff' : '#212529'} !important; }
                .bg-primary-soft { background: #4e73df22; }
                .transition-hover:hover { transform: translateY(-5px); border-color: #4e73df !important; transition: 0.3s; }
                .table-dark { --bs-table-bg: #1e1e1e; color: #fff; }
            `}</style>
        </div>
    );
};

export default HomePage;