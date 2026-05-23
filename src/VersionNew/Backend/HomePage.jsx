

import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend,
    CategoryScale, LinearScale, BarElement, LineElement, PointElement
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { BsArrowLeft, BsArrowRight, BsChevronDoubleLeft, BsChevronDoubleRight } from "react-icons/bs";

ChartJS.register(
    ArcElement, Tooltip, Legend, CategoryScale,
    LinearScale, BarElement, LineElement, PointElement
);

export const API_BASE = import.meta.env.VITE_API_BASE_URL;

const HomePage = () => {
    const navigate = useNavigate();
    const [darkMode] = useOutletContext(); 

    // Data States
    const [monthlyProperties, setMonthlyProperties] = useState([]);
    const [topUsers, setTopUsers] = useState([]);
    const [summary, setSummary] = useState({ today_achieved: 0, total_achieved: 0, monthly_achieved: 0 });
    const [summaryMonth, setSummaryMonth] = useState({ total_target: 0, total_achieved: 0, total_remaining: 0 });
    const [visaStatus, setVisaStatus] = useState({ pending: 0, processing: 0, complete: 0, cancle: 0 });
    const [remainders, setRemainders] = useState([]);
    const [topSales, setTopSales] = useState([]);
    
    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // প্রতি পেজে ৮টি রেকর্ড দেখাবে


// ১. মাস অনুযায়ী ফিল্টার করার জন্য নতুন স্টেট (উপরে ডিফাইন করুন)
const [selectedMonth, setSelectedMonth] = useState(""); 

// ২. অরিজিনাল remainders থেকে ফিল্টার করা ডাটা বের করা
const monthlyFilteredList = remainders.filter(item => {
    if (!selectedMonth) return true;
    // আপনার item এ যদি date ফিল্ড থাকে (উদা: "2024-05-10")
    const month = new Date(item.date).getMonth() + 1; 
    return month === parseInt(selectedMonth);
});

// ৩. নতুন নামে ক্যালকুলেশন (যাতে আগের লজিক ডিস্টার্ব না হয়)
const filteredTotalPages = Math.ceil(monthlyFilteredList.length / itemsPerPage);
const filteredStartIndex = (currentPage - 1) * itemsPerPage;
const filteredEndIndex = filteredStartIndex + itemsPerPage;

// ৪. টেবিলের জন্য বর্তমান ডাটা
const displayRemainders = monthlyFilteredList.slice(filteredStartIndex, filteredEndIndex);




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

    // Pagination Logic
    const totalPages = Math.ceil(remainders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRemainders = remainders.slice(startIndex, endIndex);

    // Pagination Handlers
    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    // Generate Page Numbers
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        
        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        return pageNumbers;
    };

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
                             <div className="d-flex justify-content-between"><span>Pending:</span> <b className="text-primary">{visaStatus.pending}</b></div>
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
                                <div className="text-primary fw-bold mt-1 fs-5">{item.total_member} <span className="small fw-normal">Visas</span></div>
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

            {/* Customer Remainder List with Pagination */}

            {/* Customer Remainder List with Pagination */}
<div className="card glass-card border-0 shadow-sm rounded-4 mt-4 p-4 mb-4">
    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
            <h6 className="fw-bold mb-0">Customer Remainder List</h6>
            
            {/* মাসের ড্রপডাউন ফিল্টার */}
            <select 
                className={`form-select form-select-sm w-auto ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                value={selectedMonth}
                onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    setCurrentPage(1); 
                }}
            >
                <option value="">All Months</option>
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

        <div className="text-muted small">
            Showing {monthlyFilteredList.length > 0 ? filteredStartIndex + 1 : 0} - {Math.min(filteredEndIndex, monthlyFilteredList.length)} of {monthlyFilteredList.length} entries
        </div>
    </div>
    
    <div className="table-responsive">
        <table className={`table table-hover small ${darkMode ? 'table-dark' : ''}`}>
            <thead>
                <tr className={darkMode ? 'border-secondary' : ''}>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Remaining</th>
                    <th>Invoice</th>
                    <th>Passport</th>
                </tr>
            </thead>
            <tbody>
                {displayRemainders.length > 0 ? (
                    displayRemainders.map((item, idx) => (
                        <tr key={idx}>
                            <td className={darkMode ? 'text-light' : ''}>{item.name}</td>
                            <td className={darkMode ? 'text-light' : ''}>{item.phone}</td>
                            <td>
                                <span className="badge px-2 py-1" style={{ 
                                    backgroundColor: getColor(item.remainder_days) + '22', 
                                    color: getColor(item.remainder_days) 
                                }}>
                                    {item.remainder_days} Days
                                </span>
                            </td>
                            <td className={darkMode ? 'text-light' : ''}>#{item.invoice}</td>
                            <td className={darkMode ? 'text-light' : ''}>#{item.passport}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">No records found</td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>

    {/* Pagination Component */}
    {monthlyFilteredList.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-3">
            <div className="text-muted small">
                Page {currentPage} of {filteredTotalPages}
            </div>
            
            <div className="d-flex gap-2 align-items-center">
                <button 
                    onClick={goToFirstPage} 
                    disabled={currentPage === 1} 
                    className="btn btn-sm btn-outline-primary rounded-circle d-flex align-items-center justify-content-center" 
                    style={{ width: '32px', height: '32px' }}
                >
                    <BsChevronDoubleLeft size={14} />
                </button>
                
                <button 
                    onClick={goToPreviousPage} 
                    disabled={currentPage === 1} 
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 px-3 rounded-pill"
                >
                    <BsArrowLeft size={14} /> Previous
                </button>
                
                <div className="d-flex gap-1 mx-2">
                    {getPageNumbers(filteredTotalPages).map(pageNum => (
                        <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`btn btn-sm rounded-circle d-flex align-items-center justify-content-center ${currentPage === pageNum ? 'btn-primary text-white' : 'btn-outline-primary'}`}
                            style={{ width: '35px', height: '35px' }}
                        >
                            {pageNum}
                        </button>
                    ))}
                </div>
                
                <button 
                    onClick={goToNextPage} 
                    disabled={currentPage === filteredTotalPages} 
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 px-3 rounded-pill"
                >
                    Next <BsArrowRight size={14} />
                </button>
                
                <button 
                    onClick={goToLastPage} 
                    disabled={currentPage === filteredTotalPages} 
                    className="btn btn-sm btn-outline-primary rounded-circle d-flex align-items-center justify-content-center" 
                    style={{ width: '32px', height: '32px' }}
                >
                    <BsChevronDoubleRight size={14} />
                </button>
            </div>
        </div>
    )}
</div>

            <style jsx>{`
                .glass-card { background: ${darkMode ? '#1e1e1e' : '#ffffff'}; color: ${darkMode ? '#ffffff' : '#212529'} !important; }
                .bg-primary-soft { background: #4e73df22; }
                .transition-hover:hover { transform: translateY(-5px); border-color: #4e73df !important; transition: 0.3s; }
                .table-dark { --bs-table-bg: #1e1e1e; color: #fff; }
                .table-dark td, .table-dark th { border-color: #2d2d2d; }
                .btn-outline-primary:hover { background: #4e73df; border-color: #4e73df; }
                .btn-outline-primary:disabled { opacity: 0.5; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default HomePage;