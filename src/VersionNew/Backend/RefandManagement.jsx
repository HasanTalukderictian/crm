import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { BsArrowLeft, BsArrowRight, BsSearch, BsCashStack, BsPlusCircle, BsEye, BsCheckCircle, BsXCircle } from "react-icons/bs";

export const API_BASE = import.meta.env.VITE_API_BASE_URL;

const RefandManagement = () => {
    // --- Auth Config ---
    const token = localStorage.getItem("authToken"); 
    const userRole = localStorage.getItem("userRole"); // Get user role from localStorage
    
    const authHeaders = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
        }
    };

    // --- States ---
    const [refunds, setRefunds] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // --- Modal Form States ---
    const [invoiceNo, setInvoiceNo] = useState("");
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [formData, setFormData] = useState({
        customerName: "",
        customerPhone: "",
        appliedCountry: "",
        salesPerson: "",
        usersName: "",
        refundNote: ""
    });

    // Check if user has approval permission
    const hasApprovalPermission = () => {
        const allowedRoles = ['admin', 'manager', 'finance_manager'];
        return allowedRoles.includes(userRole?.toLowerCase());
    };

    // --- Modal Control Handlers ---
    const handleOpenModal = () => {
        setInvoiceNo("");
        setFormData({
            customerName: "",
            customerPhone: "",
            appliedCountry: "",
            salesPerson: "",
            usersName: "",
            refundNote: ""
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    // --- Fetch Table Data ---
    const fetchRefundList = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/refund-list`, authHeaders);
            if (res.data.status) {
                setRefunds(res.data.data);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            if (err.response?.status === 401) {
                toast.error("Session expired. Please login again.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRefundList();
    }, []);

    // --- Fetch Data by Invoice (Debounced) ---
    useEffect(() => {
        const fetchDataByInvoice = async () => {
            if (invoiceNo.trim().length > 2) { 
                setIsLoadingData(true);
                try {
                    const res = await axios.get(`${API_BASE}/visa/invoice/${invoiceNo}`, authHeaders);
                    if (res.data.status) {
                        const data = res.data.data;
                        setFormData(prev => ({
                            ...prev,
                            customerName: data.customerName,
                            customerPhone: data.customerPhone,
                            appliedCountry: data.appliedCountry,
                            salesPerson: data.salesPerson,
                            usersName: data.usersName,
                        }));
                    }
                } catch (err) {
                    setFormData(prev => ({
                        ...prev,
                        customerName: "",
                        customerPhone: "",
                        appliedCountry: "",
                        salesPerson: "",
                        usersName: "",
                    }));
                    if (err.response?.status !== 404) {
                        toast.error("Error fetching invoice data");
                    }
                } finally {
                    setIsLoadingData(false);
                }
            }
        };

        const timeoutId = setTimeout(fetchDataByInvoice, 600);
        return () => clearTimeout(timeoutId);
    }, [invoiceNo]);

    // --- Submit Handler ---
    const handleRefundSubmit = async (e) => {
        e.preventDefault();
        if (!formData.customerName) {
            toast.error("Please enter a valid Invoice Number first!");
            return;
        }
        try {
            const res = await axios.post(`${API_BASE}/refund/store`, { 
                invoice: invoiceNo, 
                ...formData 
            }, authHeaders);

            if(res.data.status) {
                toast.success("Refund applied successfully!");
                handleCloseModal();
                fetchRefundList();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit refund");
        }
    };

    // --- Approval Handler ---
    const handleApproval = async (refundId, action) => {
        const actionText = action === 'approve' ? 'approve' : 'reject';
        const confirmMessage = `Are you sure you want to ${actionText} this refund?`;
        
        if (!window.confirm(confirmMessage)) return;

        try {
            const endpoint = action === 'approve' ? `${API_BASE}/refund/approve/${refundId}` : `${API_BASE}/refund/reject/${refundId}`;
            const res = await axios.put(endpoint, {}, authHeaders);
            
            if(res.data.status) {
                toast.success(`Refund ${actionText}d successfully!`);
                fetchRefundList(); // Refresh the list
            } else {
                toast.error(res.data.message || `Failed to ${actionText} refund`);
            }
        } catch (err) {
            console.error(`${actionText} Error:`, err);
            toast.error(err.response?.data?.message || `Error ${actionText}ing refund`);
        }
    };

    // --- View Details Handler ---
    const handleViewDetails = (refund) => {
        // You can implement a details modal here
        toast.info(`Viewing details for Refund #${refund.invoice}`);
    };

    // --- Pagination Logic ---
    const filteredRefunds = refunds.filter((r) =>
        r.invoice?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.phone?.includes(searchTerm)
    );
    const paginatedData = filteredRefunds.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredRefunds.length / itemsPerPage);

    // Get status badge color
    const getStatusBadge = (status) => {
        const statusMap = {
            'Pending': 'bg-warning',
            'Approved': 'bg-success',
            'Rejected': 'bg-danger',
            'Complete': 'bg-info',
            'Processing': 'bg-secondary'
        };
        return statusMap[status] || 'bg-secondary';
    };

    return (
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <div className="container-fluid px-4 py-4">
                {/* Header Card */}
                <div className="card shadow-sm border-0 rounded-3 mb-4">
                    <div className="card-body py-4">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                            <div>
                                <h2 className="mb-1" style={{ color: '#2c3e50', fontWeight: '600' }}>
                                    <BsCashStack className="me-2" style={{ color: '#e67e22', fontSize: '28px' }} />
                                    Refund Management
                                </h2>
                                <p className="text-muted mb-0">Track and manage customer refunds</p>
                            </div>
                            <button 
                                className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm"
                                onClick={handleOpenModal}
                                style={{ borderRadius: '8px', fontWeight: '500' }}
                            >
                                <BsPlusCircle /> Refund Apply
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="card shadow-sm border-0 rounded-3">
                    <div className="card-header bg-white py-3 border-0">
                        <div className="input-group" style={{ maxWidth: '300px' }}>
                            <span className="input-group-text bg-light border-end-0"><BsSearch /></span>
                            <input 
                                type="text" 
                                className="form-control bg-light border-start-0" 
                                placeholder="Search by Invoice, Name, or Phone..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="table-responsive p-0">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-muted">
                                <tr>
                                    <th className="px-4">Invoice No</th>
                                    <th>Customer Name</th>
                                    <th>Phone</th>
                                    <th>Applied Country</th>
                                    <th>Refund Amount</th>
                                    <th>Status</th>
                                    <th className="text-end px-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedData.length > 0 ? paginatedData.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-4 fw-bold text-primary">{item.invoice}</td>
                                        <td>{item.name}</td>
                                        <td>{item.phone}</td>
                                        <td>{item.country}</td>
                                        <td className="fw-bold">${item.refundAmount || '0.00'}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(item.status)} rounded-pill px-3 py-2`}>
                                                {item.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="text-end px-4">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button 
                                                    className="btn btn-info btn-sm rounded-circle" 
                                                    onClick={() => handleViewDetails(item)}
                                                    title="View Details"
                                                >
                                                    <BsEye />
                                                </button>
                                                
                                                {/* Approval/Reject buttons - Only for authorized roles and if status is Pending */}
                                                {hasApprovalPermission() && item.status === 'Pending' && (
                                                    <>
                                                        <button 
                                                            className="btn btn-success btn-sm rounded-circle" 
                                                            onClick={() => handleApproval(item.id, 'approve')}
                                                            title="Approve Refund"
                                                        >
                                                            <BsCheckCircle />
                                                        </button>
                                                        <button 
                                                            className="btn btn-danger btn-sm rounded-circle" 
                                                            onClick={() => handleApproval(item.id, 'reject')}
                                                            title="Reject Refund"
                                                        >
                                                            <BsXCircle />
                                                        </button>
                                                    </>
                                                )}
                                                
                                                {/* Show approval/reject info for non-pending status */}
                                                {item.status !== 'Pending' && (
                                                    <span className="text-muted small">
                                                        {item.status === 'Approved' ? '✓ Approved' : 
                                                         item.status === 'Rejected' ? '✗ Rejected' : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5 text-muted">
                                            No refund records found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="card-footer bg-white py-3">
                            <div className="d-flex justify-content-center align-items-center gap-2">
                                <button 
                                    className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    <BsArrowLeft className="me-1" /> Previous
                                </button>
                                <span className="mx-3 fw-bold text-muted">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button 
                                    className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next <BsArrowRight className="ms-1" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Refund Apply Modal */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px' }}>
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Refund Application Form</h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                            </div>
                            <form onSubmit={handleRefundSubmit}>
                                <div className="modal-body p-4">
                                    <div className="row g-3">
                                        <div className="col-12 mb-2">
                                            <label className="form-label fw-semibold">Invoice No</label>
                                            <div className="input-group">
                                                <input 
                                                    type="text" 
                                                    className="form-control form-control-lg border-primary" 
                                                    placeholder="Type Invoice (e.g. INV-2026-01)"
                                                    value={invoiceNo}
                                                    onChange={(e) => setInvoiceNo(e.target.value)}
                                                    required
                                                />
                                                {isLoadingData && (
                                                    <span className="input-group-text bg-white">
                                                        <div className="spinner-border spinner-border-sm text-primary"></div>
                                                    </span>
                                                )}
                                            </div>
                                            {!formData.customerName && invoiceNo.length > 2 && !isLoadingData && (
                                                <small className="text-danger mt-1 d-block">Invoice not found. Please check invoice number.</small>
                                            )}
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label small text-muted text-uppercase fw-bold">Customer Name</label>
                                            <input type="text" className="form-control bg-light" value={formData.customerName} placeholder="Auto fill" readOnly disabled />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small text-muted text-uppercase fw-bold">Customer Phone</label>
                                            <input type="text" className="form-control bg-light" value={formData.customerPhone} placeholder="Auto fill" readOnly disabled />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small text-muted text-uppercase fw-bold">Applied Country</label>
                                            <input type="text" className="form-control bg-light" value={formData.appliedCountry} placeholder="Auto fill" readOnly disabled />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small text-muted text-uppercase fw-bold">Sales Person</label>
                                            <input type="text" className="form-control bg-light" value={formData.salesPerson} placeholder="Auto fill" readOnly disabled />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small text-muted text-uppercase fw-bold">Assigned User</label>
                                            <input type="text" className="form-control bg-light" value={formData.usersName} placeholder="Auto fill" readOnly disabled />
                                        </div>
                                        <div className="col-12 mt-3">
                                            <label className="form-label fw-semibold">Refund Note / Reason</label>
                                            <textarea 
                                                className="form-control" 
                                                rows="3" 
                                                style={{ border: '1px solid #ced4da' }}
                                                placeholder="Please explain the reason for refund..."
                                                value={formData.refundNote}
                                                onChange={(e) => setFormData({...formData, refundNote: e.target.value})}
                                                required
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-light px-4" onClick={handleCloseModal}>Cancel</button>
                                    <button type="submit" className="btn btn-primary px-4" disabled={!formData.customerName}>Apply Refund</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default RefandManagement;