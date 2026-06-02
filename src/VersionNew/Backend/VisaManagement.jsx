import { useEffect, useState } from "react";
import Footer from "./Footer";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import '../../assets/css/visa.scss'

export const API_BASE = import.meta.env.VITE_API_BASE_URL;

const VisaManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const today = new Date();

    const userRole = localStorage.getItem("userRole");
    const userId = Number(localStorage.getItem("userId"));

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [passport, setPassport] = useState("");
    const [invoice, setInvoice] = useState("");
    const [country, setCountry] = useState([]);
    const [salesPerson, setSalesPerson] = useState("");
    const [date, setDate] = useState("");
    const [assetValuation, setAssetValuation] = useState("");
    const [salaryAmount, setSalaryAmount] = useState("");
    const [memberName, setMemberName] = useState(1);

    const [viewData, setViewData] = useState(null);
    const [viewModal, setViewModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [applicantType, setApplicantType] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [note, setNote] = useState("");
    const [professionName, setProfessionName] = useState("");
    const [missingFile, setMissingFile] = useState("");
    const [showMsgModal, setShowMsgModal] = useState(false);
    const [messages, setMessages] = useState([]);
    const [loadingMsg, setLoadingMsg] = useState(false);
    const [status, setStatus] = useState("Pending");
    const [remainderDays, setRemainderDays] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentMonthName = new Date().toLocaleString("default", { month: "long" });
    
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const [files, setFiles] = useState({
        image: null,
        bankCertificate: null,
        nidFile: null,
        birthCertificate: null,
        marriageCertificate: null,
        fixedDepositCertificate: null,
        taxCertificate: null,
        tinCertificate: null,
        creditCardCopy: null,
        covidCertificate: null,
        nocLetter: null,
        officeId: null,
        salarySlips: null,
        governmentOrder: null,
        visitingCard: null,
        companyBankStatement: null,
        blankOfficePad: null,
        renewalTradeLicense: null,
        memorandumLimited: null,
    });

    const [fileChecks, setFileChecks] = useState({
        bankCertificate: false,
        nidFile: false,
        assetValuation: false,
        birthCertificate: false,
        marriageCertificate: false,
        nocLetter: false,
        officeId: false,
        salarySlips: false,
        governmentOrder: false,
        visitingCard: false,
        salaryAmount: false,
        companyBankStatement: false,
        blankOfficePad: false,
        renewalTradeLicense: false,
        memorandumLimited: false,
        fatherNid: false,
        motherNid: false,
    });

    const [preview, setPreview] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [countries, setCountries] = useState([]);

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        setDate(today);
        fetchTeam();
        fetchCountries();
        fetchReviews();
    }, []);

    useEffect(() => {
        if (viewData) {
            setStatus(viewData.status || "Pending");
        }
    }, [viewData]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedMonth, selectedYear]);

    useEffect(() => {
        const today = new Date();
        const formattedDate = formatDate(today);
        setDate(formattedDate);
    }, []);

    const fetchTeam = async () => {
        try {
            const res = await axios.get(`${API_BASE}/get-team`);
            if (res.data.status) setTeamMembers(res.data.data);
        } catch (err) {
            console.error(err);
            if (err.response?.data?.errors) {
                const errors = err.response.data.errors;
                const firstError = Object.values(errors)[0][0];
                toast.error(firstError);
            } else if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error("Something went wrong!");
            }
        }
    };

    const fetchCountries = async () => {
        try {
            const res = await axios.get(`${API_BASE}/all-country`);
            if (res.data.success) setCountries(res.data.data);
        } catch (err) {
            console.error(err);
            if (err.response?.data?.errors) {
                const errors = err.response.data.errors;
                const firstError = Object.values(errors)[0][0];
                toast.error(firstError);
            } else if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error("Something went wrong!");
            }
        }
    };

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const res = await axios.get(`${API_BASE}/get-reviews`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json"
                }
            });
            if (res.data?.status) {
                setReviews(res.data.data);
            } else {
                toast.error(res.data?.message || "No data found");
            }
        } catch (err) {
            console.error("FETCH REVIEWS ERROR:", err);
            if (err.response) {
                toast.error(err.response.data?.message || "Server error");
            } else {
                toast.error("Network error / API not reachable");
            }
        } finally {
            setLoading(false);
        }
    };

    const getCountries = (item) => {
        try {
            const ids = typeof item.country_id === "string"
                ? JSON.parse(item.country_id)
                : item.country_id;
            if (!Array.isArray(ids) || ids.length === 0) return "N/A";
            const names = ids.map(id => {
                const country = countries.find(c => c.id == id);
                return country ? country.name : null;
            }).filter(Boolean);
            return names.length ? names.join(", ") : "N/A";
        } catch (e) {
            return "N/A";
        }
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const exportAllToExcel = () => {
        if (reviews.length === 0) {
            toast.error("No data available to export");
            return;
        }
        const data = reviews.map((review) => {
            const flatReview = { ...review };
            if (review.country) flatReview.country = review.country.name;
            if (review.team) flatReview.team = review.team.name;
            return flatReview;
        });
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Visa Data");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, "Visa_Data.xlsx");
    };

    const fetchMessages = async (visaId) => {
        try {
            setLoadingMsg(true);
            const token = localStorage.getItem("authToken");
            const res = await axios.get(`${API_BASE}/visa/${visaId}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.status) {
                setMessages(res.data.data);
                setShowMsgModal(true);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load messages");
        } finally {
            setLoadingMsg(false);
        }
    };

    const viewVisa = async (id) => {
        try {
            const token = localStorage.getItem("authToken");
            const res = await axios.get(`${API_BASE}/visa-view/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.status) {
                setViewData(res.data.data);
                setViewModal(true);
            }
        } catch (err) {
            console.error(err);
            if (err.response?.data?.errors) {
                const errors = err.response.data.errors;
                const firstError = Object.values(errors)[0][0];
                toast.error(firstError);
            } else if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error("Something went wrong!");
            }
        }
    };

    const editVisa = async (id) => {
        try {
            const token = localStorage.getItem("authToken");
            const res = await axios.get(`${API_BASE}/visa-view/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data?.data || res.data;
            if (!data) {
                toast.error("No data found from API");
                return;
            }
            setViewData(data);
            setEditId(data.id);
            setName(data.name || "");
            setPhone(data.phone || "");
            setPassport(data.passport || "");
            setInvoice(data.invoice || "");
            let parsedCountry = [];
            try {
                parsedCountry = typeof data.country_id === "string"
                    ? JSON.parse(data.country_id)
                    : data.country_id || [];
            } catch (e) {
                parsedCountry = [];
            }
            setCountry(parsedCountry);
            setSalesPerson(data.team_id || "");
            setDate(data.date || "");
            setAssetValuation(data.asset_valuation || "");
            setSalaryAmount(data.salary_amount || "");
            setApplicantType(data.applicant_type || "");
            setMemberName(data.member || "");
            setNote(data.note || "");
            setShowModal(true);
        } catch (err) {
            console.error("EDIT ERROR:", err);
            if (err.response) {
                toast.error(err.response.data.message || "Server error");
            } else {
                toast.error("Network error / API not reachable");
            }
        }
    };

    const deleteReview = async (id) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        try {
            const token = localStorage.getItem("authToken");
            const res = await axios.delete(`${API_BASE}/del-reviews/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.status) {
                toast.success("Visa deleted successfully!");
                fetchReviews();
            }
        } catch (err) {
            console.error(err);
            if (err.response?.data?.errors) {
                const errors = err.response.data.errors;
                const firstError = Object.values(errors)[0][0];
                toast.error(firstError);
            } else if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error("Something went wrong!");
            }
        }
    };

    const calculateRemainingDays = (data) => {
        if (!data?.date || !data?.remainder_days) return "N/A";
        const passingDate = new Date(data.date);
        const today = new Date();
        const diffTime = today - passingDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const remaining = data.remainder_days - diffDays;
        return remaining > 0 ? remaining + " days left" : "Expired";
    };

    const renderFile = (file, label) => {
        if (!file) return null;
        const ext = file.split('.').pop().toLowerCase();
        const isImage = ["jpg", "jpeg", "png", "webp"].includes(ext);
        return (
            <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">{label}</label>
                <div>
                    {isImage ? (
                        <img src={file} width="120" style={{ borderRadius: "6px", border: "1px solid #ddd", padding: "5px" }} alt={label} />
                    ) : (
                        <a href={file} download className="btn btn-outline-primary btn-sm">
                            <i className="bi bi-download"></i> Download
                        </a>
                    )}
                </div>
            </div>
        );
    };

    const getFileName = (url) => {
        if (!url) return "";
        return url.split("/").pop();
    };

    const handleFileChange = (field, file) => {
        setFiles((prev) => ({ ...prev, [field]: file }));
    };

    const handleCheckChange = (key) => {
        setFileChecks((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const resetForm = () => {
        const today = new Date().toISOString().split("T")[0];
        setName("");
        setPhone("");
        setPassport("");
        setInvoice("");
        setCountry([]);
        setSalesPerson("");
        setApplicantType("");
        setDate(today);
        setAssetValuation("");
        setSalaryAmount("");
        setMemberName(1);
        setNote("");
        setRemainderDays("");
        setMissingFile("");
        setProfessionName("");
        setStatus("Pending");
        setEditId(null);
        setViewData(null);
        setFiles({
            image: null, bankCertificate: null, nidFile: null, birthCertificate: null,
            marriageCertificate: null, fixedDepositCertificate: null, taxCertificate: null,
            tinCertificate: null, creditCardCopy: null, covidCertificate: null, nocLetter: null,
            officeId: null, salarySlips: null, governmentOrder: null, visitingCard: null,
            companyBankStatement: null, blankOfficePad: null, renewalTradeLicense: null,
            memorandumLimited: null,
        });
        setFileChecks({
            bankCertificate: false, nidFile: false, assetValuation: false, birthCertificate: false,
            marriageCertificate: false, nocLetter: false, officeId: false, salarySlips: false,
            governmentOrder: false, visitingCard: false, salaryAmount: false, companyBankStatement: false,
            blankOfficePad: false, renewalTradeLicense: false, memorandumLimited: false,
            fatherNid: false, motherNid: false,
        });
        setPreview(null);
    };

    const submitReview = async () => {
        if (phone.length !== 11) {
            toast.error("Phone number must be exactly 11 digits");
            return;
        }
        if (passport.length < 6 || passport.length > 10) {
            toast.error("Passport Number must be 6-10 characters");
            return;
        }
        const memberCount = parseInt(memberName);
        if (isNaN(memberCount) || memberCount < 1) {
            toast.error("Member count must be at least 1");
            return;
        }
        const formData = new FormData();
        formData.append("name", name);
        formData.append("phone", phone);
        formData.append("passport", passport);
        formData.append("invoice", invoice);
        country.forEach((c, index) => {
            formData.append(`country[${index}]`, c);
        });
        formData.append("salesPerson", salesPerson);
        formData.append("date", date);
        formData.append("assetValuation", parseFloat(assetValuation) || 0);
        formData.append("salaryAmount", parseFloat(salaryAmount) || 0);
        formData.append("member", memberCount);
        formData.append("applicantType", applicantType);
        formData.append("status", status);
        formData.append("remainder_days", remainderDays || 0);
        formData.append("note", note);
        formData.append("profession_name", professionName);
        formData.append("missing_file", missingFile);
        formData.append("fileChecks", JSON.stringify(fileChecks));
        Object.entries(files).forEach(([key, file]) => {
            if (file instanceof File) {
                formData.append(key, file);
            }
        });
        try {
            const token = localStorage.getItem("authToken");
            const url = editId ? `${API_BASE}/visa-update/${editId}` : `${API_BASE}/add-reviews`;
            const res = await axios.post(url, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.status) {
                toast.success(editId ? "Updated Successfully!" : "Applied Successfully!");
                setShowModal(false);
                resetForm();
                fetchReviews();
            } else {
                toast.error(res.data.message || "Something went wrong!");
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Something went wrong!";
            toast.error(errorMsg);
        }
    };

    // FIXED: Filter logic - Show current month by default, show old data only when filters are applied
    const filteredReviews = reviews
        .filter((review) => {
            if (userRole === "admin") return true;
            return review.user?.id === userId || review.user_id === userId;
        })
        .filter((review) => {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                review.invoice?.toLowerCase().includes(query) ||
                review.name?.toLowerCase().includes(query) ||
                review.phone?.toLowerCase().includes(query) ||
                review.team?.name?.toLowerCase().includes(query) ||
                review.passport?.toLowerCase().includes(query);
            
            const reviewDate = review.date ? new Date(review.date) : null;
            
            // If filters are applied, show filtered results
            if (selectedYear || selectedMonth) {
                const matchesMonth = !selectedMonth || (reviewDate && reviewDate.toLocaleString("default", { month: "long" }) === selectedMonth);
                const matchesYear = !selectedYear || (reviewDate && reviewDate.getFullYear().toString() === selectedYear);
                return matchesSearch && matchesMonth && matchesYear;
            }
            
            // No filters - show ONLY current month's data
            const isCurrentMonth = reviewDate && 
                reviewDate.getFullYear() === currentYear && 
                reviewDate.toLocaleString("default", { month: "long" }) === currentMonthName;
            
            return matchesSearch && isCurrentMonth;
        });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReviews = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <>
            <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
                <div className="container-fluid px-4 py-4">
                    {/* Header Section */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card shadow-sm border-0">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                        <div>
                                            <h3 className="mb-0" style={{ color: '#2c3e50' }}>
                                                <i className="bi bi-passport me-2"></i>
                                                Visa Management
                                            </h3>
                                            {!selectedYear && !selectedMonth && (
                                                <small className="text-muted mt-1 d-block">
                                                    <i className="bi bi-calendar-check me-1"></i>
                                                    Showing current month: {currentMonthName} {currentYear}
                                                </small>
                                            )}
                                            {(selectedYear || selectedMonth) && (
                                                <small className="text-muted mt-1 d-block">
                                                    <i className="bi bi-funnel me-1"></i>
                                                    Showing filtered results
                                                    <button 
                                                        className="btn btn-link btn-sm p-0 ms-2" 
                                                        onClick={() => {
                                                            setSelectedYear("");
                                                            setSelectedMonth("");
                                                        }}
                                                        style={{ textDecoration: 'none' }}
                                                    >
                                                        <i className="bi bi-x-circle"></i> Clear Filters
                                                    </button>
                                                </small>
                                            )}
                                        </div>
                                        <div className="d-flex gap-2 flex-wrap">
                                            <select
                                                className="form-select form-select-sm"
                                                value={selectedYear}
                                                onChange={(e) => setSelectedYear(e.target.value)}
                                                style={{ width: "100px" }}
                                            >
                                                <option value="">All Years</option>
                                                {years.map((year) => (<option key={year} value={year}>{year}</option>))}
                                            </select>
                                            <select
                                                className="form-select form-select-sm"
                                                value={selectedMonth}
                                                onChange={(e) => setSelectedMonth(e.target.value)}
                                                style={{ width: "130px" }}
                                            >
                                                <option value="">All Months</option>
                                                {months.map((month, idx) => (<option key={idx} value={month}>{month}</option>))}
                                            </select>
                                            <div className="input-group input-group-sm" style={{ width: "250px" }}>
                                                <span className="input-group-text"><i className="bi bi-search"></i></span>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Search..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                            </div>
                                            <button className="btn btn-sm btn-success" onClick={exportAllToExcel}>
                                                <i className="bi bi-download me-1"></i> Export
                                            </button>
                                            <button className="btn btn-sm btn-primary" onClick={() => setShowModal(true)}>
                                                <i className="bi bi-plus-circle me-1"></i> Apply Visa
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="row">
                        <div className="col-12">
                            <div className="card shadow-sm border-0">
                                <div className="card-body p-0">
                                    {loading ? (
                                        <div className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <p className="mt-2">Loading data...</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover table-striped mb-0">
                                                <thead style={{ backgroundColor: '#34495e', color: 'white' }}>
                                                    <tr>
                                                        <th className="py-3">Customer Name</th>
                                                        <th className="py-3">Phone</th>
                                                        <th className="py-3">Passport</th>
                                                        <th className="py-3">Invoice</th>
                                                        <th className="py-3">Member</th>
                                                        <th className="py-3">Country</th>
                                                        <th className="py-3">Sales Person</th>
                                                        <th className="py-3">Process Person</th>
                                                        <th className="py-3">Date</th>
                                                        <th className="py-3">Photo</th>
                                                        <th className="py-3">Status</th>
                                                        <th className="py-3">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentReviews.length > 0 ? (
                                                        currentReviews.map((review) => (
                                                            <tr key={review.id}>
                                                                <td className="align-middle">{review.name}</td>
                                                                <td className="align-middle">{review.phone}</td>
                                                                <td className="align-middle">{review.passport}</td>
                                                                <td className="align-middle">{review.invoice}</td>
                                                                <td className="align-middle">{review.member}</td>
                                                                <td className="align-middle">{getCountries(review)}</td>
                                                                <td className="align-middle">{review.team?.name}</td>
                                                                <td className="align-middle">{review.user?.name}</td>
                                                                <td className="align-middle">{review.date}</td>
                                                                <td className="align-middle">
                                                                    {review.image && (
                                                                        <img
                                                                            src={review.image}
                                                                            width="50"
                                                                            height="50"
                                                                            style={{ objectFit: "cover", borderRadius: "50%", border: "2px solid #ddd" }}
                                                                            alt="customer"
                                                                        />
                                                                    )}
                                                                </td>
                                                                <td className="align-middle">
                                                                    <span className={`badge ${review.status === 'Pending' ? 'bg-warning' : review.status === 'Processing' ? 'bg-info' : review.status === 'Complete' ? 'bg-success' : 'bg-danger'}`}>
                                                                        {review.status}
                                                                    </span>
                                                                </td>
                                                                <td className="align-middle">
                                                                    <div className="btn-group btn-group-sm">
                                                                        <button className="btn btn-info" onClick={() => viewVisa(review.id)} title="View">
                                                                            <i className="bi bi-eye"></i>
                                                                        </button>
                                                                        <button className="btn btn-warning" onClick={() => editVisa(review.id)} title="Edit">
                                                                            <i className="bi bi-pencil"></i>
                                                                        </button>
                                                                        <button className="btn btn-success" onClick={() => fetchMessages(review.id)} title="Messages">
                                                                            <i className="bi bi-chat-dots"></i>
                                                                        </button>
                                                                        {userRole === "admin" && (
                                                                            <button className="btn btn-danger" onClick={() => deleteReview(review.id)} title="Delete">
                                                                                <i className="bi bi-trash"></i>
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="12" className="text-center py-5">
                                                                <i className="bi bi-inbox display-1 text-muted"></i>
                                                                <p className="mt-2">
                                                                    {!selectedYear && !selectedMonth ? 
                                                                        `No visa applications found for ${currentMonthName} ${currentYear}` : 
                                                                        "No visa applications found for selected filters"}
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pagination Section */}
                    {totalPages > 1 && (
                        <div className="row mt-4">
                            <div className="col-12">
                                <div className="d-flex justify-content-center">
                                    <nav>
                                        <ul className="pagination">
                                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                                <button className="page-link" onClick={() => paginate(currentPage - 1)}>
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
                                                            <button className="page-link" onClick={() => paginate(1)}>1</button>
                                                        </li>
                                                    );
                                                }
                                                if (i === 6 && totalPages > 7 && currentPage < totalPages - 3) {
                                                    return (
                                                        <li key={totalPages} className="page-item">
                                                            <button className="page-link" onClick={() => paginate(totalPages)}>{totalPages}</button>
                                                        </li>
                                                    );
                                                }
                                                return (
                                                    <li key={pageNum} className={`page-item ${currentPage === pageNum ? "active" : ""}`}>
                                                        <button className="page-link" onClick={() => paginate(pageNum)}>
                                                            {pageNum}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                                <button className="page-link" onClick={() => paginate(currentPage + 1)}>
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

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.5)", overflowY: "auto" }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header" style={{ backgroundColor: '#34495e', color: 'white' }}>
                                <h5 className="modal-title">
                                    <i className="bi bi-passport me-2"></i>
                                    {editId ? "Edit Visa Application" : "New Visa Application"}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => { setShowModal(false); resetForm(); }}></button>
                            </div>
                            <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                                <div className="row">
                                    <div className="col-12 mb-3">
                                        <h5 className="text-primary border-bottom pb-2">
                                            <i className="bi bi-person-badge me-2"></i>Customer Information
                                        </h5>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Customer Name <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" placeholder="Enter customer name" value={name} onChange={(e) => setName(e.target.value)} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Customer Phone <span className="text-danger">*</span></label>
                                        <input type="tel" className="form-control" placeholder="11 digit phone number" value={phone} onChange={(e) => { if (e.target.value.length <= 11) setPhone(e.target.value) }} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Passport Number <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" placeholder="6-10 characters" value={passport} onChange={(e) => { if (e.target.value.length <= 10) setPassport(e.target.value) }} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Invoice Number</label>
                                        <input type="text" className="form-control" placeholder="Enter invoice number" value={invoice} onChange={(e) => setInvoice(e.target.value)} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Country <span className="text-danger">*</span></label>
                                        <select
                                            className="form-select"
                                            multiple
                                            style={{ height: '150px' }}
                                            value={country}
                                            onChange={(e) => {
                                                const selected = Array.from(e.target.selectedOptions, option => option.value);
                                                setCountry(selected);
                                            }}
                                        >
                                            <option value="" disabled>Select Country</option>
                                            {countries.map((c) => (
                                                <option key={c.id} value={c.id} className="py-1 px-2 border-bottom">
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                        <small className="text-muted"><i className="bi bi-info-circle me-1"></i>Hold Ctrl to select multiple</small>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Sales Person</label>
                                        <select className="form-select" value={salesPerson} onChange={(e) => setSalesPerson(e.target.value)}>
                                            <option value="">Select Sales Person</option>
                                            {teamMembers.map((member) => (<option key={member.id} value={member.id}>{member.name}</option>))}
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Date</label>
                                        <input type="text" className="form-control bg-light" value={formatDate(today)} readOnly />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Member Number</label>
                                        <div className="d-flex align-items-center gap-3">
                                            <button type="button" className="btn btn-outline-secondary rounded-circle" style={{ width: "35px", height: "35px" }} onClick={() => setMemberName((prev) => Math.max(1, Number(prev) - 1))}>
                                                <i className="bi bi-dash"></i>
                                            </button>
                                            <span style={{ fontSize: "20px", minWidth: "40px", textAlign: "center", fontWeight: "bold" }}>{memberName}</span>
                                            <button type="button" className="btn btn-outline-secondary rounded-circle" style={{ width: "35px", height: "35px" }} onClick={() => setMemberName((prev) => Number(prev) + 1)}>
                                                <i className="bi bi-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label className="form-label fw-bold me-3">Applicant Type:</label>
                                        <div className="form-check form-check-inline">
                                            <input className="form-check-input" type="radio" name="applicantType" value="job" checked={applicantType === "job"} onChange={(e) => setApplicantType(e.target.value)} />
                                            <label className="form-check-label">Job Holder</label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <input className="form-check-input" type="radio" name="applicantType" value="business" checked={applicantType === "business"} onChange={(e) => setApplicantType(e.target.value)} />
                                            <label className="form-check-label">Business Owner</label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <input className="form-check-input" type="radio" name="applicantType" value="others" checked={applicantType === "others"} onChange={(e) => setApplicantType(e.target.value)} />
                                            <label className="form-check-label">Others</label>
                                        </div>
                                        {applicantType === "others" && (
                                            <div className="row mt-3">
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Profession Name</label>
                                                    <input type="text" className="form-control" value={professionName} onChange={(e) => setProfessionName(e.target.value)} />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Missing File</label>
                                                    <input type="text" className="form-control" value={missingFile} onChange={(e) => setMissingFile(e.target.value)} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Status</label>
                                        <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                                            <option value="Pending">Pending</option>
                                            <option value="Processing">Processing</option>
                                            <option value="Complete">Complete</option>
                                            <option value="Cancle">Cancle</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Reminder Days</label>
                                        <input type="number" className="form-control" placeholder="Enter reminder days" value={remainderDays} onChange={(e) => setRemainderDays(e.target.value)} min="0" />
                                    </div>
                                    {(status === "Pending" || status === "Processing" || status === "Cancle") && (
                                        <div className="col-12 mb-3">
                                            <label className="form-label fw-bold">Note</label>
                                            <textarea className="form-control" rows="2" placeholder="Write note..." value={note} onChange={(e) => setNote(e.target.value)}></textarea>
                                        </div>
                                    )}

                                    <div className="col-12 mt-3">
                                        <h5 className="text-primary border-bottom pb-2">
                                            <i className="bi bi-file-earmark-person me-2"></i>Personal Documents
                                        </h5>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Customer Image</label>
                                        <input type="file" className="form-control" accept="image/*" onChange={(e) => handleFileChange("image", e.target.files[0])} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Bank Certificate</label>
                                        <div className="mb-1">
                                            <input type="checkbox" checked={fileChecks.bankCertificate} onChange={() => handleCheckChange("bankCertificate")} />
                                            <small className="ms-2">Include in SMS</small>
                                        </div>
                                        <input type="file" className="form-control" onChange={(e) => handleFileChange("bankCertificate", e.target.files[0])} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">NID Copy</label>
                                        <div className="mb-1">
                                            <input type="checkbox" checked={fileChecks.nidFile} onChange={() => handleCheckChange("nidFile")} />
                                            <small className="ms-2">Include in SMS</small>
                                        </div>
                                        <input type="file" className="form-control" onChange={(e) => handleFileChange("nidFile", e.target.files[0])} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Tax Certificate</label>
                                        <div className="mb-1">
                                            <input type="checkbox" checked={fileChecks.assetValuation} onChange={() => handleCheckChange("assetValuation")} />
                                            <small className="ms-2">Include in SMS</small>
                                        </div>
                                        <input type="number" className="form-control" placeholder="Enter tax amount" value={assetValuation} onChange={(e) => setAssetValuation(e.target.value)} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Birth Certificate</label>
                                        <div className="mb-1">
                                            <input type="checkbox" checked={fileChecks.birthCertificate} onChange={() => handleCheckChange("birthCertificate")} />
                                            <small className="ms-2">Include in SMS</small>
                                        </div>
                                        <input type="file" className="form-control" onChange={(e) => handleFileChange("birthCertificate", e.target.files[0])} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Marriage Certificate</label>
                                        <div className="mb-1">
                                            <input type="checkbox" checked={fileChecks.marriageCertificate} onChange={() => handleCheckChange("marriageCertificate")} />
                                            <small className="ms-2">Include in SMS</small>
                                        </div>
                                        <input type="file" className="form-control" onChange={(e) => handleFileChange("marriageCertificate", e.target.files[0])} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Father NID</label>
                                        <div className="mb-1">
                                            <input type="checkbox" checked={fileChecks.fatherNid} onChange={() => handleCheckChange("fatherNid")} />
                                            <small className="ms-2">Include in SMS</small>
                                        </div>
                                        <input type="file" className="form-control" onChange={(e) => handleFileChange("nidFile", e.target.files[0])} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Mother NID</label>
                                        <div className="mb-1">
                                            <input type="checkbox" checked={fileChecks.motherNid} onChange={() => handleCheckChange("motherNid")} />
                                            <small className="ms-2">Include in SMS</small>
                                        </div>
                                        <input type="file" className="form-control" onChange={(e) => handleFileChange("nidFile", e.target.files[0])} />
                                    </div>

                                    {applicantType === "job" && (
                                        <>
                                            <div className="col-12 mt-3">
                                                <h5 className="text-primary border-bottom pb-2">
                                                    <i className="bi bi-briefcase me-2"></i>Job Holder Documents
                                                </h5>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">NOC Letter</label>
                                                <div className="mb-1">
                                                    <input type="checkbox" checked={fileChecks.nocLetter} onChange={() => handleCheckChange("nocLetter")} />
                                                    <small className="ms-2">Include in SMS</small>
                                                </div>
                                                <input type="file" className="form-control" onChange={(e) => handleFileChange("nocLetter", e.target.files[0])} />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Office ID</label>
                                                <div className="mb-1">
                                                    <input type="checkbox" checked={fileChecks.officeId} onChange={() => handleCheckChange("officeId")} />
                                                    <small className="ms-2">Include in SMS</small>
                                                </div>
                                                <input type="file" className="form-control" onChange={(e) => handleFileChange("officeId", e.target.files[0])} />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Salary Slips</label>
                                                <div className="mb-1">
                                                    <input type="checkbox" checked={fileChecks.salarySlips} onChange={() => handleCheckChange("salarySlips")} />
                                                    <small className="ms-2">Include in SMS</small>
                                                </div>
                                                <input type="file" className="form-control" onChange={(e) => handleFileChange("salarySlips", e.target.files[0])} />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Government Order</label>
                                                <div className="mb-1">
                                                    <input type="checkbox" checked={fileChecks.governmentOrder} onChange={() => handleCheckChange("governmentOrder")} />
                                                    <small className="ms-2">Include in SMS</small>
                                                </div>
                                                <input type="file" className="form-control" onChange={(e) => handleFileChange("governmentOrder", e.target.files[0])} />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Visiting Card</label>
                                                <div className="mb-1">
                                                    <input type="checkbox" checked={fileChecks.visitingCard} onChange={() => handleCheckChange("visitingCard")} />
                                                    <small className="ms-2">Include in SMS</small>
                                                </div>
                                                <input type="file" className="form-control" onChange={(e) => handleFileChange("visitingCard", e.target.files[0])} />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Salary Amount</label>
                                                <div className="mb-1">
                                                    <input type="checkbox" checked={fileChecks.salaryAmount} onChange={() => handleCheckChange("salaryAmount")} />
                                                    <small className="ms-2">Include in SMS</small>
                                                </div>
                                                <input type="number" className="form-control" placeholder="Enter salary amount" value={salaryAmount} onChange={(e) => setSalaryAmount(e.target.value)} />
                                            </div>
                                        </>
                                    )}

                                    {applicantType === "business" && (
                                        <>
                                            <div className="col-12 mt-3">
                                                <h5 className="text-primary border-bottom pb-2">
                                                    <i className="bi bi-building me-2"></i>Business Documents
                                                </h5>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Company Bank Statement</label>
                                                <div className="mb-1">
                                                    <input type="checkbox" checked={fileChecks.companyBankStatement} onChange={() => handleCheckChange("companyBankStatement")} />
                                                    <small className="ms-2">Include in SMS</small>
                                                </div>
                                                <input type="file" className="form-control" onChange={(e) => handleFileChange("companyBankStatement", e.target.files[0])} />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Blank Office Pad</label>
                                                <div className="mb-1">
                                                    <input type="checkbox" checked={fileChecks.blankOfficePad} onChange={() => handleCheckChange("blankOfficePad")} />
                                                    <small className="ms-2">Include in SMS</small>
                                                </div>
                                                <input type="file" className="form-control" onChange={(e) => handleFileChange("blankOfficePad", e.target.files[0])} />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Renewal Trade License</label>
                                                <div className="mb-1">
                                                    <input type="checkbox" checked={fileChecks.renewalTradeLicense} onChange={() => handleCheckChange("renewalTradeLicense")} />
                                                    <small className="ms-2">Include in SMS</small>
                                                </div>
                                                <input type="file" className="form-control" onChange={(e) => handleFileChange("renewalTradeLicense", e.target.files[0])} />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Memorandum Limited</label>
                                                <div className="mb-1">
                                                    <input type="checkbox" checked={fileChecks.memorandumLimited} onChange={() => handleCheckChange("memorandumLimited")} />
                                                    <small className="ms-2">Include in SMS</small>
                                                </div>
                                                <input type="file" className="form-control" onChange={(e) => handleFileChange("memorandumLimited", e.target.files[0])} />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
                                <button className="btn btn-primary" onClick={submitReview}>{editId ? "Update" : "Submit"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {viewModal && viewData && (
                <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header" style={{ backgroundColor: '#34495e', color: 'white' }}>
                                <h5 className="modal-title">
                                    <i className="bi bi-eye me-2"></i>Visa Details
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setViewModal(false)}></button>
                            </div>
                            <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Customer Name</label>
                                        <input className="form-control bg-light" value={viewData.name} readOnly />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Phone</label>
                                        <input className="form-control bg-light" value={viewData.phone} readOnly />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Passport</label>
                                        <input className="form-control bg-light" value={viewData.passport} readOnly />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Invoice</label>
                                        <input className="form-control bg-light" value={viewData.invoice} readOnly />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Country</label>
                                        <div className="form-control bg-light">{viewData.countries?.length > 0 ? viewData.countries.map((c) => c.name).join(", ") : "N/A"}</div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Sales Person</label>
                                        <input className="form-control bg-light" value={viewData.team?.name} readOnly />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Date</label>
                                        <input className="form-control bg-light" value={formatDate(viewData.date)} readOnly />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Member Number</label>
                                        <input className="form-control bg-light" value={viewData.member || "N/A"} readOnly />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Status</label>
                                        <input className="form-control bg-light" value={viewData.status || "N/A"} readOnly />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Note</label>
                                        <input className="form-control bg-light" value={viewData.note || "N/A"} readOnly />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Remaining Days</label>
                                        <input className="form-control bg-light" value={calculateRemainingDays(viewData)} readOnly />
                                    </div>
                                    <div className="col-12 mt-3">
                                        <h5 className="text-primary border-bottom pb-2">Personal Documents</h5>
                                    </div>
                                    {renderFile(viewData.image, "Customer Image")}
                                    {renderFile(viewData.bank_certificate, "Bank Certificate")}
                                    {renderFile(viewData.nid_file, "NID Copy")}
                                    {renderFile(viewData.birth_certificate, "Birth Certificate")}
                                    {renderFile(viewData.marriage_certificate, "Marriage Certificate")}
                                    {renderFile(viewData.fixed_deposit_certificate, "Fixed Deposit Certificate")}
                                    {renderFile(viewData.tax_certificate, "Tax Certificate")}
                                    {renderFile(viewData.tin_certificate, "TIN Certificate")}
                                    {renderFile(viewData.credit_card_copy, "Credit Card Copy")}
                                    {renderFile(viewData.covid_certificate, "Covid Certificate")}
                                    {renderFile(viewData.father_nid, "Father NID")}
                                    {renderFile(viewData.mother_nid, "Mother NID")}
                                    <div className="col-12 mt-3">
                                        <h5 className="text-primary border-bottom pb-2">Job Holder Documents</h5>
                                    </div>
                                    {renderFile(viewData.noc_letter, "NOC Letter")}
                                    {renderFile(viewData.office_id, "Office ID")}
                                    {renderFile(viewData.salary_slips, "Salary Slips")}
                                    {renderFile(viewData.government_order, "Government Order")}
                                    {renderFile(viewData.visiting_card, "Visiting Card")}
                                    <div className="col-12 mt-3">
                                        <h5 className="text-primary border-bottom pb-2">Business Documents</h5>
                                    </div>
                                    {renderFile(viewData.company_bank_statement, "Company Bank Statement")}
                                    {renderFile(viewData.blank_office_pad, "Blank Office Pad")}
                                    {renderFile(viewData.renewal_trade_license, "Renewal Trade License")}
                                    {renderFile(viewData.memorandum_limited, "Memorandum Limited")}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setViewModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages Modal */}
            {showMsgModal && (
                <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header" style={{ backgroundColor: '#34495e', color: 'white' }}>
                                <h5 className="modal-title">
                                    <i className="bi bi-chat-dots me-2"></i>Message History
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowMsgModal(false)}></button>
                            </div>
                            <div className="modal-body" style={{ maxHeight: "400px", overflowY: "auto" }}>
                                {loadingMsg ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : messages.length > 0 ? (
                                    messages.map((msg, index) => (
                                        <div key={index} className="card mb-3">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between mb-2">
                                                    <small className="text-muted">
                                                        <i className="bi bi-clock me-1"></i>
                                                        {new Date(msg.created_at).toLocaleString()}
                                                    </small>
                                                    <span className={`badge ${msg.type === 'incoming' ? 'bg-info' : 'bg-success'}`}>
                                                        {msg.type}
                                                    </span>
                                                </div>
                                                <p className="mb-2">{msg.message}</p>
                                                <small className="text-muted">
                                                    <i className="bi bi-telephone me-1"></i>Phone: {msg.phone}
                                                </small>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-5">
                                        <i className="bi bi-chat-dots display-1 text-muted"></i>
                                        <p className="mt-2">No messages found</p>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowMsgModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
};

export default VisaManagement;