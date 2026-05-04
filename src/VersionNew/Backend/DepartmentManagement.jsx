import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const API_BASE = import.meta.env.VITE_API_BASE_URL;

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [departmentName, setDepartmentName] = useState("");
  const userRole = localStorage.getItem("userRole");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/departments`);
      if (res.data.status) setDepartments(res.data.data);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const resetForm = () => setDepartmentName("");

  const addDepartment = async () => {
    if (!departmentName.trim()) {
      toast.error("Department cannot be empty");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/add-department`, {
        department: departmentName,
      });
      if (res.data.status) {
        fetchDepartments();
        setShowModal(false);
        resetForm();
        toast.success("Department added successfully!");
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

  const deleteDepartment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?"))
      return;

    try {
      const res = await axios.delete(`${API_BASE}/delete-department/${id}`);
      if (res.data.status) {
        fetchDepartments();
        toast.success("Department deleted successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete department");
    }
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDepartments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                        <i className="bi bi-building-fill me-2" style={{ color: '#3498db' }}></i>
                        Department Management
                      </h2>
                      <p className="text-muted mb-0">Manage your organization departments and structure</p>
                    </div>
                    {userRole === "admin" && (
                      <button
                        className="btn btn-primary rounded-3 px-4 py-2"
                        onClick={() => setShowModal(true)}
                        style={{ fontWeight: '500' }}
                      >
                        <i className="bi bi-plus-circle-fill me-2"></i>
                        Add Department
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm border-0 rounded-3">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold mb-2">
                        <i className="bi bi-search me-1"></i> Search Department
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0">
                          <i className="bi bi-search text-muted"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0"
                          placeholder="Search by department name..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex justify-content-end align-items-end h-100">
                        <div className="badge bg-info rounded-pill px-3 py-2">
                          <i className="bi bi-building me-1"></i> Total Departments: {filteredDepartments.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Departments Table */}
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm border-0 rounded-3">
                <div className="card-body p-0">
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2 text-muted">Loading departments...</p>
                    </div>
                  ) : (
                    <>
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead style={{ backgroundColor: '#34495e', color: 'white' }}>
                            <tr>
                              <th className="py-3 px-4">
                                <i className="bi bi-building me-2"></i>Department Name
                              </th>
                              {userRole === "admin" && (
                                <th className="py-3 text-center" style={{ width: '150px' }}>
                                  <i className="bi bi-tools me-2"></i>Actions
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {currentItems.length > 0 ? (
                              currentItems.map((dept, index) => (
                                <tr key={dept.id} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa' }}>
                                  <td className="py-3 px-4">
                                    <div className="d-flex align-items-center">
                                      <div className="department-icon me-3" style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: '#e8f4f8',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#3498db'
                                      }}>
                                        <i className="bi bi-building fs-5"></i>
                                      </div>
                                      <div>
                                        <strong>{dept.department}</strong>
                                        
                                      </div>
                                    </div>
                                  </td>
                                  {userRole === "admin" && (
                                    <td className="py-3 text-center">
                                      <button
                                        className="btn btn-danger btn-sm rounded-pill px-3"
                                        onClick={() => deleteDepartment(dept.id)}
                                        title="Delete Department"
                                      >
                                        <i className="bi bi-trash me-1"></i> Delete
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={userRole === "admin" ? 2 : 1} className="text-center py-5">
                                  <i className="bi bi-inbox display-1 text-muted"></i>
                                  <p className="mt-2 text-muted">No departments found</p>
                                  {searchTerm && (
                                    <p className="text-muted">Try a different search term</p>
                                  )}
                                  {!searchTerm && userRole === "admin" && (
                                    <button 
                                      className="btn btn-primary mt-2 rounded-pill"
                                      onClick={() => setShowModal(true)}
                                    >
                                      <i className="bi bi-plus-circle-fill me-2"></i>
                                      Add your first department
                                    </button>
                                  )}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {filteredDepartments.length > itemsPerPage && (
                        <div className="d-flex justify-content-between align-items-center px-4 py-3 border-top">
                          <div className="text-muted small">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDepartments.length)} of {filteredDepartments.length} entries
                          </div>
                          <nav>
                            <ul className="pagination mb-0">
                              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                <button 
                                  className="page-link rounded-start" 
                                  onClick={() => paginate(currentPage - 1)}
                                  disabled={currentPage === 1}
                                >
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
                                <button 
                                  className="page-link rounded-end" 
                                  onClick={() => paginate(currentPage + 1)}
                                  disabled={currentPage === totalPages}
                                >
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

      {/* Add Department Modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)", overflowY: "auto" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow-lg">
              <div className="modal-header" style={{ backgroundColor: '#2c3e50', color: 'white', borderRadius: '12px 12px 0 0' }}>
                <h5 className="modal-title">
                  <i className="bi bi-building-add me-2"></i>
                  Add New Department
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
                    <i className="bi bi-building me-1"></i> Department Name
                  </label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    placeholder="Enter department name (e.g., IT, HR, Sales)"
                    autoFocus
                  />
                  <small className="text-muted">Department name should be unique and descriptive</small>
                </div>
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
                  onClick={addDepartment}
                >
                  <i className="bi bi-save me-2"></i>
                  Add Department
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

export default DepartmentManagement;