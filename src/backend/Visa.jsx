import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Footer from "./Footer";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DashNav from "./DasNav";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import '../assets/css/visa.scss'



export const API_BASE = import.meta.env.VITE_API_BASE_URL;




const Visa = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const today = new Date();



    const userRole = localStorage.getItem("userRole"); // "admin" or "user"
    const userId = Number(localStorage.getItem("userId"));

    // console.log("Logged-in User Role:", userRole);
    // console.log("Logged-in User ID:", userId);
    // console.log("All Reviews Data:", reviews);

    // Text / number fields
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [passport, setPassport] = useState("");
    const [invoice, setInvoice] = useState("");
    const [country, setCountry] = useState("");
    const [salesPerson, setSalesPerson] = useState("");
    const [date, setDate] = useState("");
    const [assetValuation, setAssetValuation] = useState("");
    const [salaryAmount, setSalaryAmount] = useState("");
    const [memberName, setMemberName] = useState("");

    const [viewData, setViewData] = useState(null);
    const [viewModal, setViewModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [selectedYear, setSelectedYear] = useState("");

    const [selectedMonth, setSelectedMonth] = useState("");
    const [applicantType, setApplicantType] = useState(""); // "job" or "business"

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

    const [searchQuery, setSearchQuery] = useState("");

    const [note, setNote] = useState("");


    const [showMsgModal, setShowMsgModal] = useState(false);
    const [messages, setMessages] = useState([]);
    const [loadingMsg, setLoadingMsg] = useState(false);








    // Files grouped in one state object
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


    // const [fileChecks, setFileChecks] = useState({});

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
    });

    const [preview, setPreview] = useState(null);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];


    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        setDate(today);
    }, []);


    // Fetch Team Members
    const [teamMembers, setTeamMembers] = useState([]);
    const fetchTeam = async () => {
        try {
            const res = await axios.get(`${API_BASE}/get-team`);
            if (res.data.status) setTeamMembers(res.data.data);
        } catch (err) {
            console.error(err);

            // ✅ Laravel validation error handle
            if (err.response?.data?.errors) {

                const errors = err.response.data.errors;

                // First error message show
                const firstError = Object.values(errors)[0][0];

                toast.error(firstError);

            }
            // ✅ General message (like "message")
            else if (err.response?.data?.message) {

                toast.error(err.response.data.message);

            }
            // fallback
            else {
                toast.error("Something went wrong!");
            }
        }
    };

    // Inside your Visa component, after fetching reviews:
    const exportAllToExcel = () => {
        if (reviews.length === 0) {
            toast.error("No data available to export");
            return;
        }

        // Flatten reviews for Excel
        const data = reviews.map((review) => {
            const flatReview = { ...review };

            // Flatten nested objects
            if (review.country) flatReview.country = review.country.name;
            if (review.team) flatReview.team = review.team.name;

            // Remove any unnecessary nested objects if you want
            // You can keep other fields like image URLs as-is

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
                headers: {
                    Authorization: `Bearer ${token}`
                }
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



    const filteredReviews = reviews
        // Role-based filter
        .filter((review) => {
            if (userRole === "admin") return true; // admin sees all

            // normal user sees only their own reviews
            return review.user?.id === userId || review.user_id === userId;
        })
        // Search + Month + Year filter
        .filter((review) => {
            const query = searchQuery.toLowerCase();

            const matchesSearch =
                review.invoice?.toLowerCase() === query || // exact match fast
                review.invoice?.toLowerCase().includes(query) ||
                review.name?.toLowerCase().includes(query) ||
                review.phone?.toLowerCase().includes(query) ||
                review.team?.name?.toLowerCase().includes(query) ||
                review.passport?.toLowerCase().includes(query);

            const reviewDate = review.date ? new Date(review.date) : null;

            const matchesMonth =
                !selectedMonth ||
                (reviewDate &&
                    reviewDate.toLocaleString("default", { month: "long" }) === selectedMonth);

            const matchesYear =
                !selectedYear ||
                (reviewDate && reviewDate.getFullYear().toString() === selectedYear);

            return matchesSearch && matchesMonth && matchesYear;
        });


    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // Pagination logic: current page এর items slice করা
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReviews = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const [status, setStatus] = useState("Pending");

    const [remainderDays, setRemainderDays] = useState("");


    // Fetch Countries
    const [countries, setCountries] = useState([]);
    const fetchCountries = async () => {
        try {
            const res = await axios.get(`${API_BASE}/all-country`);
            if (res.data.success) setCountries(res.data.data);
        } catch (err) {
            console.error(err);

            // ✅ Laravel validation error handle
            if (err.response?.data?.errors) {

                const errors = err.response.data.errors;

                // First error message show
                const firstError = Object.values(errors)[0][0];

                toast.error(firstError);

            }
            // ✅ General message (like "message")
            else if (err.response?.data?.message) {

                toast.error(err.response.data.message);

            }
            // fallback
            else {
                toast.error("Something went wrong!");
            }
        }
    };

    const formatDate = (date) => {
        const d = new Date(date);

        const day = String(d.getDate()).padStart(2, "0");

        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const month = months[d.getMonth()];
        const year = d.getFullYear();

        return `${day}-${month}-${year}`;  // This will output: 04-Apr-2026
    };


    useEffect(() => {
        if (viewData) {
            setStatus(viewData.status || "Pending");
        }
    }, [viewData]);

    // Fetch Reviews
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

            if (res.data.status) setReviews(res.data.data);

        } catch (err) {
            console.error(err);

            if (err.response?.data?.errors) {
                const errors = err.response.data.errors;
                const firstError = Object.values(errors)[0][0];
                toast.error(firstError);
            }
            else if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            }
            else {
                toast.error("Something went wrong!");
            }

        } finally {
            setLoading(false);
        }
    };

    const viewVisa = async (id) => {
        try {

            const token = localStorage.getItem("authToken");

            const res = await axios.get(`${API_BASE}/visa-view/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
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
            }
            else if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            }
            else {
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



    const editVisa = async (id) => {
        try {

            const token = localStorage.getItem("authToken");

            const res = await axios.get(`${API_BASE}/visa-view/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.data.status) {

                const data = res.data.data;

                setViewData(data);

                setEditId(data.id);
                setName(data.name);
                setPhone(data.phone);
                setPassport(data.passport);
                setInvoice(data.invoice);
                setCountry(data.country_id);
                setSalesPerson(data.team_id);
                setDate(data.date);
                setAssetValuation(data.asset_valuation);
                setSalaryAmount(data.salary_amount);
                setApplicantType(data.applicant_type);
                setMemberName(data.member || "");
                setNote(data.note || "");

                // 🔥 ✅ Use your existing function
                const remainingText = calculateRemainingDays(data);

                // 👉 Option 1: show text (recommended)
                // setRemainderDays(remainingText);

                // 👉 Option 2: only number (if needed)
                const remainingNumber = parseInt(remainingText) || 0;
                setRemainderDays(remainingNumber);

                // Preview image
                if (data.image) {
                    setPreview(data.image);
                }

                setShowModal(true);
            }

        } catch (err) {
            console.error(err);

            if (err.response?.data?.errors) {
                const errors = err.response.data.errors;
                const firstError = Object.values(errors)[0][0];
                toast.error(firstError);
            }
            else if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            }
            else {
                toast.error("Something went wrong!");
            }
        }
    };


    useEffect(() => {
        fetchTeam();
        fetchCountries();
        fetchReviews();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedMonth, selectedYear]);


    useEffect(() => {
        const today = new Date();
        const formattedDate = formatDate(today);  // This will give "04-Apr-2026"
        setDate(formattedDate);
    }, []);


    const renderFile = (file, label) => {

        if (!file) return null;

        const ext = file.split('.').pop().toLowerCase();

        const isImage = ["jpg", "jpeg", "png", "webp"].includes(ext);

        return (
            <div className="col-md-6 mb-3">
                <label className="form-label">{label}</label>
                <div>

                    {isImage ? (

                        <img
                            src={file}
                            width="120"
                            style={{ borderRadius: "6px" }}
                        />

                    ) : (

                        <a
                            href={file}
                            download
                            className="btn btn-outline-primary btn-sm"
                        >
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

    // Handle file changes
    // const handleFileChange = (field, file) => {
    //     setFiles({ ...files, [field]: file });

    //     if (field === "image") setPreview(URL.createObjectURL(file));
    // };


    const handleFileChange = (field, file) => {
        setFiles((prev) => ({
            ...prev,
            [field]: file
        }));
    };


    const handleCheckChange = (field) => {
        setFileChecks((prev) => ({
            ...prev,
            [field]: !prev[field]
        }));
    };




    const resetForm = () => {

        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

        setName("");
        setPhone("");
        setPassport("");
        setInvoice("");
        setCountry("");
        setSalesPerson("");
        setApplicantType("");

        setDate(today);   // এখানে fix

        setAssetValuation("");
        setSalaryAmount("");
        setMemberName(1);

        setNote("");
        setRemainderDays("");

        setEditId(null);
        setViewData(null);

        setFiles({
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

        setPreview(null);
    };



    //Submit function 

    const submitReview = async () => {

        if (phone.length !== 11) {
            toast.error("Customer Phone number must be exactly 11 digits");
            return;
        }

        if (passport.length < 6 || passport.length > 10) {
            toast.error("Passport Number must be between 6 and 10 digits");
            return;
        }

        const formData = new FormData();

        formData.append("name", name);
        formData.append("phone", phone);
        formData.append("passport", passport);
        formData.append("invoice", invoice);
        formData.append("country", country);
        formData.append("salesPerson", salesPerson);
        formData.append("date", date);
        formData.append("assetValuation", assetValuation || 0);
        formData.append("salaryAmount", salaryAmount || 0);
        formData.append("member", memberName);
        formData.append("applicantType", applicantType);
        formData.append("status", status);
        formData.append("remainder_days", remainderDays);
        formData.append("note", note);

        formData.append("fileChecks", JSON.stringify(fileChecks));

        Object.entries(files).forEach(([key, file]) => {
            if (file) formData.append(key, file);
        });

        try {

            const token = localStorage.getItem("authToken");

            let res;

            if (editId) {

                res = await axios.post(
                    `${API_BASE}/visa-update/${editId}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

            } else {

                res = await axios.post(
                    `${API_BASE}/add-reviews`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

            }

            if (res.data.status) {

                toast.success(editId ? "Visa updated successfully!" : "Visa applied successfully!");

                setShowModal(false);
                resetForm();
                setEditId(null);
                fetchReviews();

            }

        } catch (err) {
            console.error(err);

            if (err.response?.data?.errors) {
                const errors = err.response.data.errors;
                const firstError = Object.values(errors)[0][0];
                toast.error(firstError);
            }
            else if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            }
            else {
                toast.error("Something went wrong!");
            }
        }
    };




    // Delete Review




    const deleteReview = async (id) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;

        try {
            const token = localStorage.getItem("authToken"); // ✅ GET TOKEN

            const res = await axios.delete(`${API_BASE}/del-reviews/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}` // ✅ ADD TOKEN
                }
            });

            if (res.data.status) {
                toast.success("Review deleted successfully!");
                fetchReviews();
            }

        } catch (err) {
            console.error(err);

            if (err.response?.data?.errors) {
                const errors = err.response.data.errors;
                const firstError = Object.values(errors)[0][0];
                toast.error(firstError);
            }
            else if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            }
            else {
                toast.error("Something went wrong!");
            }
        }
    };






    return (
        <Layout>
            <div className="d-flex">
                <div className="flex-grow-1">
                    <DashNav />
                    <div className="container mt-4">
                        <div className="d-flex justify-content-end">
                            <nav>
                                <ul className="pagination align-items-center gap-1 mb-0">
                                    {/* Previous Button */}
                                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                        <button
                                            className="page-link d-flex align-items-center justify-content-center"
                                            onClick={() => paginate(currentPage - 1)}
                                            style={{ minWidth: "30px", height: "30px", width: "30px", padding: "0", fontSize: "12px" }}
                                            disabled={currentPage === 1}
                                        >
                                            <i className="bi bi-chevron-left" style={{ fontSize: "10px" }}></i>
                                        </button>
                                    </li>

                                    {/* Page Numbers */}
                                    {Array.from({ length: totalPages }, (_, i) => {
                                        const pageNum = i + 1;
                                        // Optional: Show limited page numbers (e.g., 5 at a time)
                                        const maxVisible = 5;
                                        const halfVisible = Math.floor(maxVisible / 2);

                                        let startPage = Math.max(1, currentPage - halfVisible);
                                        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

                                        if (endPage - startPage + 1 < maxVisible) {
                                            startPage = Math.max(1, endPage - maxVisible + 1);
                                        }

                                        if (pageNum >= startPage && pageNum <= endPage) {
                                            return (
                                                <li
                                                    key={pageNum}
                                                    className={`page-item ${currentPage === pageNum ? "active" : ""}`}
                                                >
                                                    <button
                                                        className="page-link d-flex align-items-center justify-content-center"
                                                        onClick={() => paginate(pageNum)}
                                                        style={{ minWidth: "30px", height: "30px", width: "30px", padding: "0", fontSize: "12px" }}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                </li>
                                            );
                                        }
                                        return null;
                                    })}

                                    {/* Next Button */}
                                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                        <button
                                            className="page-link d-flex align-items-center justify-content-center"
                                            onClick={() => paginate(currentPage + 1)}
                                            style={{ minWidth: "30px", height: "30px", width: "30px", padding: "0", fontSize: "12px" }}
                                            disabled={currentPage === totalPages}
                                        >
                                            <i className="bi bi-chevron-right" style={{ fontSize: "10px" }}></i>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3>Visa Management</h3>
                            <div className="d-flex align-items-center">

                                {/* Year Filter */}
                                <select
                                    className="form-select me-2"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    style={{ width: "100px" }}
                                >
                                    <option value="">All Years</option>
                                    {years.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>

                                {/* Month Filter */}
                                <select
                                    className="form-select me-2"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    style={{ width: "150px" }}
                                >
                                    <option value="">All Months</option>
                                    {months.map((month, idx) => (
                                        <option key={idx} value={month}>{month}</option>
                                    ))}
                                </select>

                                {/* Excel Download Button */}
                                <button
                                    className="btn btn-success me-2 d-flex align-items-center"
                                    onClick={exportAllToExcel}
                                >
                                    <i className="bi bi-download me-1"></i> Download
                                </button>

                                <input
                                    type="text"
                                    className="form-control me-2"
                                    placeholder="Search by name, phone, sales person, invoice"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />



                                <button
                                    className="btn btn-success"
                                    onClick={() => setShowModal(true)}
                                    style={{ width: "180px" }}
                                >
                                    + Apply
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Customer Name</th>
                                            <th>Customer Phone</th>
                                            <th>Passport</th>
                                            <th>Invoice</th>
                                            <th>Member</th>
                                            <th>Country</th>
                                            <th>Sales Person</th>
                                            <th>Date</th>
                                            <th>C.Picture</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {currentReviews.length > 0 ? (
                                            currentReviews.map((review) => (
                                                <tr key={review.id}>
                                                    <td>{review.name}</td>
                                                    <td>{review.phone}</td>
                                                    <td>{review.passport}</td>
                                                    <td>{review.invoice}</td>
                                                    <td>{review.member}</td>
                                                    <td>{review.country?.name}</td>
                                                    <td>{review.team?.name}</td>
                                                    <td>{review.date}</td>
                                                    <td>
                                                        {review.image && (
                                                            <img
                                                                src={review.image}
                                                                width="60"
                                                                height="60"
                                                                style={{ objectFit: "cover", borderRadius: "6px" }}
                                                                alt="customer"
                                                            />
                                                        )}
                                                    </td>
                                                    <td>{review.status}</td>
                                                    <td>
                                                        <button className="btn btn-info btn-sm me-2" onClick={() => viewVisa(review.id)}>
                                                            <i className="bi bi-eye"></i>
                                                        </button>
                                                        <button className="btn btn-warning btn-sm me-2" onClick={() => editVisa(review.id)}>
                                                            <i className="bi bi-pencil"></i>
                                                        </button>

                                                        {userRole === "admin" && (
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => deleteReview(review.id)}
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        )}

                                                        <button
                                                            className="btn btn-success btn-sm me-2"
                                                            onClick={() => fetchMessages(review.id)}
                                                        >
                                                            <i className="bi bi-chat-dots"></i>
                                                        </button>

                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={9} className="text-center">No Reviews Found</td>
                                            </tr>
                                        )}
                                    </tbody>

                                </table>



                            </div>
                        )}

                    </div>

                    <div className="d-flex justify-content-center mt-3">
                        <nav>
                            <ul className="pagination align-items-center gap-1">

                                {/* Previous Button */}
                                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                    <button
                                        className="page-link d-flex align-items-center justify-content-center"
                                        onClick={() => paginate(currentPage - 1)}
                                    >
                                        <i className="bi bi-chevron-left"></i>
                                    </button>
                                </li>

                                {/* Page Numbers */}
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <li
                                        key={i + 1}
                                        className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                                    >
                                        <button
                                            className="page-link d-flex align-items-center justify-content-center"
                                            onClick={() => paginate(i + 1)}
                                            style={{ minWidth: "40px" }}
                                        >
                                            {i + 1}
                                        </button>
                                    </li>
                                ))}

                                {/* Next Button */}
                                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                    <button
                                        className="page-link d-flex align-items-center justify-content-center"
                                        onClick={() => paginate(currentPage + 1)}
                                    >
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                </li>

                            </ul>
                        </nav>
                    </div>


                    <Footer />
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editId ? "Edit Visa Application" : "Visa Apply"}
                                </h5>
                                <button
                                    className="btn-close"
                                    onClick={() => {
                                        setShowModal(false);
                                        setApplicantType("");
                                        resetForm();
                                    }}
                                ></button>
                            </div>

                            <div className="modal-body">
                                <div className="row">

                                    {/* ================= Customer Information ================= */}

                                    <div className="col-12">
                                        <h5 className="text-success border-bottom pb-2 mb-3">
                                            Customer Information
                                        </h5>


                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Customer Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Customer Phone</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={phone}
                                            onChange={(e) => {
                                                if (e.target.value.length <= 11) setPhone(e.target.value)
                                            }}
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Passport Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={passport}
                                            onChange={(e) => {
                                                if (e.target.value.length <= 9) setPassport(e.target.value)
                                            }}
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Invoice Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={invoice}
                                            onChange={(e) => setInvoice(e.target.value)}
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Country</label>
                                        <select
                                            className="form-control"
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                        >
                                            <option value="">Select Country</option>
                                            {countries.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Sales Person</label>
                                        <select
                                            className="form-control"
                                            value={salesPerson}
                                            onChange={(e) => setSalesPerson(e.target.value)}
                                        >
                                            <option value="">Select Sales Person</option>
                                            {teamMembers.map((member) => (
                                                <option key={member.id} value={member.id}>
                                                    {member.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Date</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formatDate(today)}
                                            readOnly
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Member Number</label>

                                        <div className="d-flex align-items-center justify-content-center gap-3">

                                            {/* Minus Button */}
                                            <button
                                                type="button"
                                                className="btn rounded-circle border"
                                                style={{ width: "40px", height: "40px" }}
                                                onClick={() => {
                                                    setMemberName((prev) => Math.max(1, Number(prev || 1) - 1));
                                                }}
                                            >
                                                -
                                            </button>

                                            <span style={{ fontSize: "18px", minWidth: "20px", textAlign: "center" }}>
                                                {memberName || 1}
                                            </span>

                                            <button
                                                type="button"
                                                className="btn rounded-circle border"
                                                style={{ width: "40px", height: "40px" }}
                                                onClick={() => {
                                                    setMemberName((prev) => Number(prev || 1) + 1);
                                                }}
                                            >
                                                +
                                            </button>

                                        </div>
                                    </div>



                                    <div className="col-12 mb-3">
                                        <label className="form-label me-3">Applicant Type:</label>
                                        <div className="form-check form-check-inline">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="applicantType"
                                                id="jobHolder"
                                                value="job"
                                                checked={applicantType === "job"}
                                                onChange={(e) => setApplicantType(e.target.value)}
                                            />
                                            <label className="form-check-label" htmlFor="jobHolder">
                                                Job Holder
                                            </label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="applicantType"
                                                id="businessOwner"
                                                value="business"
                                                checked={applicantType === "business"}
                                                onChange={(e) => setApplicantType(e.target.value)}
                                            />
                                            <label className="form-check-label" htmlFor="businessOwner">
                                                Business Owner
                                            </label>
                                        </div>



                                        <div className="row">

                                            {/* STATUS */}
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Status</label>

                                                <select
                                                    className="form-control"
                                                    value={status}
                                                    onChange={(e) => setStatus(e.target.value)}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Complete">Complete</option>
                                                    <option value="Cancle">Cancle</option>
                                                </select>
                                            </div>

                                            {/* NOTE → ONLY Pending & Processing */}
                                            {(status === "Pending" || status === "Processing" || status === "Cancle") && (
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Note</label>
                                                    <textarea
                                                        className="form-control"
                                                        rows="2"
                                                        value={note}
                                                        onChange={(e) => setNote(e.target.value)}
                                                        placeholder="Write note..."
                                                    />
                                                </div>
                                            )}

                                        </div>



                                        {/* REMAINDER DAYS FIELD */}
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Reminders Days</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={remainderDays}
                                                onChange={(e) => setRemainderDays(e.target.value)}
                                                placeholder="Enter Reminders days"
                                                min="0"
                                            />
                                        </div>



                                    </div>


                                    {/* ================= Personal Documents ================= */}

                                    <div className="col-12 mt-4">
                                        <h5 className="text-primary border-bottom pb-2 mb-3">
                                            Personal Documents
                                        </h5>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Customer Image</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={(e) => handleFileChange("image", e.target.files[0])}
                                        />

                                        {/* Image preview */}
                                        {editId && preview && (
                                            <div className="mt-2">
                                                <img
                                                    src={preview}
                                                    alt="Preview"
                                                    width="120"
                                                    style={{ borderRadius: "6px" }}
                                                />
                                            </div>
                                        )}
                                    </div>


                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Bank Certificate</label>

                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <input
                                                type="checkbox"
                                                checked={fileChecks.bankCertificate || false}
                                                onChange={() => handleCheckChange("bankCertificate")}
                                            />
                                            <small>Include in SMS</small>
                                        </div>
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={(e) => handleFileChange("bankCertificate", e.target.files[0])}
                                        />

                                        {editId && viewData?.bank_certificate && (
                                            <small className="text-success">
                                                Current File: {getFileName(viewData.bank_certificate)}
                                            </small>
                                        )}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">NID Copy</label>

                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <input
                                                type="checkbox"
                                                checked={fileChecks.nidFile || false}
                                                onChange={() => handleCheckChange("nidFile")}
                                            />
                                            <small>Include in SMS</small>
                                        </div>
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={(e) => handleFileChange("nidFile", e.target.files[0])}
                                        />
                                        {editId && viewData?.nid_file && (
                                            <small className="text-success">
                                                Current File: {getFileName(viewData.nid_file)}
                                            </small>
                                        )}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Asset Valuation</label>
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <input
                                                type="checkbox"
                                                checked={fileChecks.assetValuation || false}
                                                onChange={() => handleCheckChange("assetValuation")}
                                            />
                                            <small>Include in SMS</small>
                                        </div>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={assetValuation}
                                            onChange={(e) => setAssetValuation(e.target.value)}
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Birth Certificate</label>
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <input
                                                type="checkbox"
                                                checked={fileChecks.birthCertificate || false}
                                                onChange={() => handleCheckChange("birthCertificate")}
                                            />
                                            <small>Include in SMS</small>
                                        </div>
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={(e) => handleFileChange("birthCertificate", e.target.files[0])}
                                        />

                                        {editId && viewData?.birth_certificate && (
                                            <small className="text-success">
                                                Current File: {getFileName(viewData.birth_certificate)}
                                            </small>
                                        )}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Marriage Certificate</label>
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <input
                                                type="checkbox"
                                                checked={fileChecks.marriageCertificate || false}
                                                onChange={() => handleCheckChange("marriageCertificate")}
                                            />
                                            <small>Include in SMS</small>
                                        </div>
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={(e) => handleFileChange("marriageCertificate", e.target.files[0])}
                                        />

                                        {editId && viewData?.marriage_certificate && (
                                            <small className="text-success">
                                                Current File: {getFileName(viewData.marriage_certificate)}
                                            </small>
                                        )}
                                    </div>


                                    {/* ================= Job Holder Documents ================= */}

                                    {applicantType === "job" && (
                                        <>

                                            <div className="col-12 mt-4">
                                                <h5 className="text-primary border-bottom pb-2 mb-3">
                                                    For Job Holder
                                                </h5>
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">NOC Letter</label>
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={fileChecks.nocLetter || false}
                                                        onChange={() => handleCheckChange("nocLetter")}
                                                    />
                                                    <small>Include in SMS</small>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    onChange={(e) => handleFileChange("nocLetter", e.target.files[0])}
                                                />
                                                {editId && viewData?.noc_letter && (
                                                    <small className="text-success">
                                                        Current File: {getFileName(viewData.noc_letter)}
                                                    </small>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Office ID</label>
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={fileChecks.officeId || false}
                                                        onChange={() => handleCheckChange("officeId")}
                                                    />
                                                    <small>Include in SMS</small>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    onChange={(e) => handleFileChange("officeId", e.target.files[0])}
                                                />
                                                {editId && viewData?.office_id && (
                                                    <small className="text-success">
                                                        Current File: {getFileName(viewData.office_id)}
                                                    </small>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Salary Slips</label>
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={fileChecks.salarySlips || false}
                                                        onChange={() => handleCheckChange("salarySlips")}
                                                    />
                                                    <small>Include in SMS</small>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    onChange={(e) => handleFileChange("salarySlips", e.target.files[0])}
                                                />
                                                {editId && viewData?.salary_slips && (
                                                    <small className="text-success">
                                                        Current File: {getFileName(viewData.salary_slips)}
                                                    </small>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Government Order</label>
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={fileChecks.governmentOrder || false}
                                                        onChange={() => handleCheckChange("governmentOrder")}
                                                    />
                                                    <small>Include in SMS</small>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    onChange={(e) => handleFileChange("governmentOrder", e.target.files[0])}
                                                />
                                                {editId && viewData?.government_order && (
                                                    <small className="text-success">
                                                        Current File: {getFileName(viewData.government_order)}
                                                    </small>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Visiting Card</label>
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={fileChecks.visitingCard || false}
                                                        onChange={() => handleCheckChange("visitingCard")}
                                                    />
                                                    <small>Include in SMS</small>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    onChange={(e) => handleFileChange("visitingCard", e.target.files[0])}
                                                />
                                                {editId && viewData?.visiting_card && (
                                                    <small className="text-success">
                                                        Current File: {getFileName(viewData.visiting_card)}
                                                    </small>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Salary Amount</label>
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={fileChecks.salaryAmount || false}
                                                        onChange={() => handleCheckChange("salaryAmount")}
                                                    />
                                                    <small>Include in SMS</small>
                                                </div>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={salaryAmount}
                                                    onChange={(e) => setSalaryAmount(e.target.value)}
                                                />
                                            </div>

                                        </>
                                    )}

                                    {/* ================= Business Documents ================= */}

                                    {applicantType === "business" && (
                                        <>
                                            <div className="col-12 mt-4">
                                                <h5 className="text-primary border-bottom pb-2 mb-3">
                                                    For Business Owner
                                                </h5>
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Company Bank Statement</label>
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={fileChecks.companyBankStatement || false}
                                                        onChange={() => handleCheckChange("companyBankStatement")}
                                                    />
                                                    <small>Include in SMS</small>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    onChange={(e) => handleFileChange("companyBankStatement", e.target.files[0])}
                                                />
                                                {editId && viewData?.company_bank_statement && (
                                                    <small className="text-success">
                                                        Current File: {getFileName(viewData.company_bank_statement)}
                                                    </small>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Blank Office Pad</label>
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={fileChecks.blankOfficePad || false}
                                                        onChange={() => handleCheckChange("blankOfficePad")}
                                                    />
                                                    <small>Include in SMS</small>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    onChange={(e) => handleFileChange("blankOfficePad", e.target.files[0])}
                                                />
                                                {editId && viewData?.blank_office_pad && (
                                                    <small className="text-success">
                                                        Current File: {getFileName(viewData.blank_office_pad)}
                                                    </small>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Renewal Trade License</label>
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={fileChecks.renewalTradeLicense || false}
                                                        onChange={() => handleCheckChange("renewalTradeLicense")}
                                                    />
                                                    <small>Include in SMS</small>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    onChange={(e) => handleFileChange("renewalTradeLicense", e.target.files[0])}
                                                />
                                                {editId && viewData?.renewal_trade_license && (
                                                    <small className="text-success">
                                                        Current File: {getFileName(viewData.renewal_trade_license)}
                                                    </small>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Memorandum Limited</label>
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={fileChecks.memorandumLimited || false}
                                                        onChange={() => handleCheckChange("memorandumLimited")}
                                                    />
                                                    <small>Include in SMS</small>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    onChange={(e) => handleFileChange("memorandumLimited", e.target.files[0])}
                                                />
                                                {editId && viewData?.memorandum_limited && (
                                                    <small className="text-success">
                                                        Current File: {getFileName(viewData.memorandum_limited)}
                                                    </small>
                                                )}
                                            </div>
                                        </>
                                    )}

                                </div>


                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-danger"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                >
                                    Close
                                </button>
                                <button className="btn btn-success" onClick={submitReview}>
                                    Save Review
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {viewModal && viewData && (
                <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title">Visa Details</h5>
                                <button className="btn-close" onClick={() => setViewModal(false)}></button>
                            </div>

                            <div className="modal-body">

                                <div className="row">

                                    {/* ================= Basic Info ================= */}

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Customer Name</label>
                                        <input className="form-control" value={viewData.name} readOnly />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Phone</label>
                                        <input className="form-control" value={viewData.phone} readOnly />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Passport</label>
                                        <input className="form-control" value={viewData.passport} readOnly />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Invoice</label>
                                        <input className="form-control" value={viewData.invoice} readOnly />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Country</label>
                                        <input className="form-control" value={viewData.country?.name} readOnly />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Sales Person</label>
                                        <input className="form-control" value={viewData.team?.name} readOnly />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Date</label>
                                        <input className="form-control" value={formatDate(viewData.date)} readOnly />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Salary Amount</label>
                                        <input className="form-control" value={viewData.salary_amount} readOnly />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Asset Valuation</label>
                                        <input className="form-control" value={viewData.asset_valuation} readOnly />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Member Number</label>
                                        <input
                                            className="form-control"
                                            value={viewData.member || "N/A"}
                                            readOnly
                                        />
                                    </div>


                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Status</label>
                                        <input
                                            className="form-control"
                                            value={viewData.status || "N/A"}
                                            readOnly
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Note</label>
                                        <input
                                            className="form-control"
                                            value={viewData.note || "N/A"}
                                            readOnly
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Remaining Days</label>
                                        <input
                                            className="form-control"
                                            value={calculateRemainingDays(viewData)}
                                            readOnly
                                        />
                                    </div>

                                    {/* ================= Personal Documents ================= */}

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

                                    {/* ================= Job Holder ================= */}

                                    <div className="col-12 mt-3">
                                        <h5 className="text-primary border-bottom pb-2">Job Holder Documents</h5>
                                    </div>

                                    {renderFile(viewData.noc_letter, "NOC Letter")}
                                    {renderFile(viewData.office_id, "Office ID")}
                                    {renderFile(viewData.salary_slips, "Salary Slips")}
                                    {renderFile(viewData.government_order, "Government Order")}
                                    {renderFile(viewData.visiting_card, "Visiting Card")}

                                    {/* ================= Business Documents ================= */}

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
                                <button className="btn btn-success" onClick={() => setViewModal(false)}>
                                    Close
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}


            {showMsgModal && (
                <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title">Message History</h5>
                                <button className="btn-close" onClick={() => setShowMsgModal(false)}></button>
                            </div>

                            <div className="modal-body" style={{ maxHeight: "400px", overflowY: "auto" }}>

                                {loadingMsg ? (
                                    <p>Loading...</p>
                                ) : messages.length > 0 ? (
                                    messages.map((msg, index) => (
                                        <div key={index} className="border-bottom mb-3 pb-2">
                                            <div className="d-flex justify-content-between">
                                                <small className="text-muted">
                                                    {new Date(msg.created_at).toLocaleString()}
                                                </small>
                                                <span className="badge bg-secondary">{msg.type}</span>
                                            </div>

                                            <p className="mb-1">{msg.message}</p>

                                            <small className="text-muted">
                                                Phone: {msg.phone}
                                            </small>
                                        </div>
                                    ))
                                ) : (
                                    <p>No messages found</p>
                                )}

                            </div>

                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="top-right" autoClose={3000} />
        </Layout>
    );
};

export default Visa;