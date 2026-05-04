import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const API_BASE = import.meta.env.VITE_API_BASE_URL;

const SalesManagement = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState([]);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");

  const userRole = localStorage.getItem("userRole");
  const [editId, setEditId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const userId = Number(localStorage.getItem("userId"));

  const handleEdit = (item) => {
    setEditId(item.id);
    setName(item.name);
    setDepartmentId(item.department_id);
    setPreview(item.image);
    setShowModal(true);
  };

  const updateBanner = async () => {
    if (!departmentId) {
      toast.error("Please select a department");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("department_id", departmentId);
    formData.append("role", userRole);
    formData.append("user_id", userId);

    if (image) formData.append("image", image);

    try {
      const res = await axios.post(`${API_BASE}/update-team/${editId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.status) {
        fetchData();
        setShowModal(false);
        resetForm();
        setEditId(null);
        toast.success("Team updated successfully!");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors?.name) {
        toast.error(err.response.data.errors.name[0]);
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to add team member.");
      }
    }
  };

  const fetchData = () => {
    axios
      .get(`${API_BASE}/get-team`)
      .then((res) => {
        if (res.data.status) setData(res.data.data);
      })
      .finally(() => setLoading(false));
  };

  const fetchDepartments = () => {
    axios
      .get(`${API_BASE}/departments`)
      .then((res) => {
        if (res.data.status) setDepartments(res.data.data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchData();
    fetchDepartments();
  }, []);

  const filteredData = data.filter((item) => {
    const matchesName = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDepartment === "" || String(item.department_id) === String(filterDepartment);
    return matchesName && matchesDept;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removePreview = () => {
    setImage(null);
    setPreview(null);
    const fileInput = document.getElementById("bannerImageInput");
    if (fileInput) fileInput.value = "";
  };

  const resetForm = () => {
    setName("");
    setDepartmentId("");
    setImage(null);
    setPreview(null);
    setEditId(null);
  };

  const submitBanner = async () => {
    if (!departmentId) {
      toast.error("Please select a department");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("department_id", departmentId);
    if (image) formData.append("image", image);

    try {
      const res = await axios.post(`${API_BASE}/add-team`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.status) {
        fetchData();
        setShowModal(false);
        resetForm();
        toast.success("Team added successfully!");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors?.name) {
        toast.error(err.response.data.errors.name[0]);
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to add team member.");
      }
    }
  };

  const deleteBanner = async (id) => {
    if (!window.confirm("Are you sure you want to delete this team member?")) return;

    try {
      const res = await axios.delete(`${API_BASE}/del-team/${id}`);
      if (res.data.status) {
        fetchData();
        toast.success("Team deleted successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete team member.");
    }
  };

  return (
    <>
      <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
        <div className="container-fluid px-4 py-4">
          {/* Header Section */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm border-0 rounded-3">
                <div className="card-body py-4">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                      <h2 className="mb-1" style={{ color: '#2c3e50', fontWeight: '600' }}>
                        <i className="bi bi-people-fill me-2" style={{ color: '#3498db' }}></i>
                        Team Management
                      </h2>
                      <p className="text-muted mb-0">Manage your team members and their departments</p>
                    </div>
                    {userRole === "admin" && (
                      <button
                        className="btn btn-primary rounded-3 px-4 py-2"
                        onClick={() => {
                          setEditId(null);
                          resetForm();
                          setShowModal(true);
                        }}
                        style={{ fontWeight: '500' }}
                      >
                        <i className="bi bi-person-plus-fill me-2"></i>
                        Add Team Member
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm border-0 rounded-3">
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold mb-2">
                        <i className="bi bi-search me-1"></i> Search by Name
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0">
                          <i className="bi bi-search text-muted"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0"
                          placeholder="Type member name..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold mb-2">
                        <i className="bi bi-folder me-1"></i> Filter by Department
                      </label>
                      <select
                        className="form-select"
                        value={filterDepartment}
                        onChange={(e) => {
                          setFilterDepartment(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">All Departments</option>
                        {departments.map((dep) => (
                          <option key={dep.id} value={dep.id}>
                            {dep.department}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Members Table */}
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm border-0 rounded-3">
                <div className="card-body p-0">
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2 text-muted">Loading team members...</p>
                    </div>
                  ) : (
                    <>
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead style={{ backgroundColor: '#34495e', color: 'white' }}>
                            <tr>
                              <th className="py-3 px-4"><i className="bi bi-person-badge me-2"></i>Name</th>
                              <th className="py-3"><i className="bi bi-building me-2"></i>Department</th>
                              <th className="py-3"><i className="bi bi-image me-2"></i>Image</th>
                              {userRole === "admin" && <th className="py-3"><i className="bi bi-tools me-2"></i>Action</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {currentItems.length > 0 ? (
                              currentItems.map((item, index) => (
                                <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa' }}>
                                  <td className="py-3 px-4">
                                    <div className="d-flex align-items-center">
                                      <div className="avatar-circle me-3" style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: '#3498db',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 'bold'
                                      }}>
                                        {item.name.charAt(0).toUpperCase()}
                                      </div>
                                      <strong>{item.name}</strong>
                                    </div>
                                  </td>
                                  <td className="py-3">
                                    <span className="badge bg-info rounded-pill px-3 py-2">
                                      <i className="bi bi-building me-1"></i>
                                      {item.department_name}
                                    </span>
                                  </td>
                                  <td className="py-3">
                                    {item.image && (
                                      <img
                                        src={item.image}
                                        width="50"
                                        height="50"
                                        style={{ objectFit: "cover", borderRadius: "50%", border: "2px solid #ddd" }}
                                        alt={item.name}
                                      />
                                    )}
                                  </td>
                                  {userRole === "admin" && (
                                    <td className="py-3">
                                      <div className="btn-group btn-group-sm">
                                        <button
                                          className="btn btn-warning rounded-pill px-3 me-2"
                                          onClick={() => handleEdit(item)}
                                          title="Edit Member"
                                        >
                                          <i className="bi bi-pencil-square me-1"></i> Edit
                                        </button>
                                        <button
                                          className="btn btn-danger rounded-pill px-3"
                                          onClick={() => deleteBanner(item.id)}
                                          title="Delete Member"
                                        >
                                          <i className="bi bi-trash me-1"></i> Delete
                                        </button>
                                      </div>
                                    </td>
                                  )}
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={userRole === "admin" ? 4 : 3} className="text-center py-5">
                                  <i className="bi bi-inbox display-1 text-muted"></i>
                                  <p className="mt-2 text-muted">No team members found</p>
                                  {userRole === "admin" && (
                                    <button 
                                      className="btn btn-primary mt-2 rounded-pill"
                                      onClick={() => {
                                        setEditId(null);
                                        resetForm();
                                        setShowModal(true);
                                      }}
                                    >
                                      <i className="bi bi-person-plus-fill me-2"></i>
                                      Add your first team member
                                    </button>
                                  )}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center px-4 py-3 border-top">
                          <div className="text-muted small">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
                          </div>
                          <nav>
                            <ul className="pagination mb-0">
                              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                <button className="page-link rounded-start" onClick={prevPage} disabled={currentPage === 1}>
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
                                <button className="page-link rounded-end" onClick={nextPage} disabled={currentPage === totalPages}>
                                  Next <i className="bi bi-chevron-right"></i>
                                </button>
                              </li>
                            </ul>
                          </nav>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.5)", overflowY: "auto" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow-lg">
              <div className="modal-header" style={{ backgroundColor: '#2c3e50', color: 'white', borderRadius: '12px 12px 0 0' }}>
                <h5 className="modal-title">
                  <i className={`bi ${editId ? "bi-pencil-square" : "bi-person-plus-fill"} me-2`}></i>
                  {editId ? "Edit Team Member" : "Add Team Member"}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => { 
                    setShowModal(false); 
                    resetForm(); 
                  }}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-person me-1"></i> Full Name
                  </label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter team member name"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-building me-1"></i> Department
                  </label>
                  <select
                    className="form-select rounded-3"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dep) => (
                      <option key={dep.id} value={dep.id}>
                        {dep.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-image me-1"></i> Profile Image
                  </label>
                  <input 
                    type="file" 
                    className="form-control rounded-3" 
                    id="bannerImageInput" 
                    accept="image/*"
                    onChange={handleImageChange} 
                  />
                  <small className="text-muted">Upload a profile picture (optional)</small>
                </div>

                {preview && (
                  <div className="position-relative mt-3 d-inline-block">
                    <img
                      src={preview}
                      width="100"
                      height="100"
                      style={{ objectFit: "cover", borderRadius: "50%", border: "3px solid #3498db" }}
                      alt="Preview"
                    />
                    <button
                      type="button"
                      onClick={removePreview}
                      style={{
                        position: "absolute",
                        top: "-5px",
                        right: "-5px",
                        background: "red",
                        color: "#fff",
                        border: "none",
                        width: "25px",
                        height: "25px",
                        borderRadius: "50%",
                        cursor: "pointer",
                        fontSize: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div className="modal-footer border-0 pt-0 pb-4 px-4">
                <button 
                  className="btn btn-secondary rounded-pill px-4" 
                  onClick={() => { 
                    setShowModal(false); 
                    resetForm(); 
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary rounded-pill px-4"
                  onClick={editId ? updateBanner : submitBanner}
                >
                  <i className={`bi ${editId ? "bi-check-circle" : "bi-save"} me-2`}></i>
                  {editId ? "Update Member" : "Save Member"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default SalesManagement;