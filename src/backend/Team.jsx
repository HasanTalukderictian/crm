import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Footer from "./Footer";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DashNav from "./DasNav";

export const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Team = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState([]);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const userRole = localStorage.getItem("userRole");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch team data
  const fetchData = () => {
    axios
      .get(`${API_BASE}/get-team`)
      .then((res) => {
        if (res.data.status) setData(res.data.data);
      })
      .finally(() => setLoading(false));
  };

  // Fetch departments for dropdown
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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Image Handling
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
  };

  // Submit Team member
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
      toast.error("Failed to add team member.");
    }
  };

  // Delete
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
    <Layout>
      <div className="d-flex">
        <div className="flex-grow-1">
          <DashNav />

          <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3>Team List</h3>
              {userRole === "admin" && (
                <button className="btn btn-success" onClick={() => setShowModal(true)}>
                  + Add
                </button>
              )}
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-bordered table-striped">
                    <thead className="table-dark">
                      <tr>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Image</th>
                        {userRole === "admin" && <th>Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length > 0 ? (
                        currentItems.map((item) => (
                          <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.department_name}</td>
                            <td>
                              {item.image && (
                                <img
                                  src={item.image}
                                  width="60"
                                  height="60"
                                  style={{ objectFit: "cover" }}
                                  alt=""
                                />
                              )}
                            </td>
                            {userRole === "admin" && (
                              <td>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => deleteBanner(item.id)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={userRole === "admin" ? 4 : 3} className="text-center">
                            No Data Found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Section - Centered */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <nav>
                      <ul className="pagination align-items-center gap-1 mb-0">
                        {/* Previous Button */}
                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                          <button
                            className="page-link d-flex align-items-center justify-content-center"
                            onClick={prevPage}
                            style={{ minWidth: "40px", height: "40px" }}
                            disabled={currentPage === 1}
                          >
                            <i className="bi bi-chevron-left"></i> {/* < icon */}
                          </button>
                        </li>

                        {/* Page Numbers */}
                        {Array.from({ length: totalPages }, (_, i) => {
                          // Show limited page numbers (optional: show 5 pages at a time)
                          const pageNum = i + 1;
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
                                  style={{ minWidth: "40px", height: "40px" }}
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
                            onClick={nextPage}
                            style={{ minWidth: "40px", height: "40px" }}
                            disabled={currentPage === totalPages}
                          >
                            <i className="bi bi-chevron-right"></i> {/* > icon */}
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}

                {/* Optional: Showing entries info */}
                <div className="text-center text-muted mt-2">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, data.length)} of {data.length} entries
                </div>
              </>
            )}
          </div>

          <Footer />
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Team Member</h5>
                <button className="btn-close" onClick={() => { setShowModal(false); resetForm(); }}></button>
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter team member name"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
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
                  <label className="form-label">Image</label>
                  <input type="file" className="form-control" id="bannerImageInput" onChange={handleImageChange} />
                </div>

                {preview && (
                  <div className="position-relative mt-2 d-inline-block">
                    <img
                      src={preview}
                      width="120"
                      height="120"
                      style={{ objectFit: "cover", borderRadius: "8px", border: "1px solid #ddd" }}
                      alt="Preview"
                    />
                    <button
                      type="button"
                      onClick={removePreview}
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        background: "red",
                        color: "#fff",
                        border: "none",
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn btn-danger" onClick={() => { setShowModal(false); resetForm(); }}>
                  Close
                </button>
                <button className="btn btn-success" onClick={submitBanner}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </Layout>
  );
};

export default Team;