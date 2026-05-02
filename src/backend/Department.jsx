// import { useEffect, useState } from "react";
// import Layout from "../components/Layout";
// import Footer from "./Footer";
// import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import DashNav from "./DasNav";

// export const API_BASE = import.meta.env.VITE_API_BASE_URL;

// const Department = () => {
//   const [departments, setDepartments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [departmentName, setDepartmentName] = useState("");
//   const userRole = localStorage.getItem("userRole");

//   // Fetch all departments
//   const fetchDepartments = async () => {
//     try {
//       const res = await axios.get(`${API_BASE}/departments`);
//       if (res.data.status) setDepartments(res.data.data);
//     } catch (err) {
//             console.error(err);

//             // ✅ Laravel validation error handle
//             if (err.response?.data?.errors) {

//                 const errors = err.response.data.errors;

//                 // First error message show
//                 const firstError = Object.values(errors)[0][0];

//                 toast.error(firstError);

//             }
//             // ✅ General message (like "message")
//             else if (err.response?.data?.message) {

//                 toast.error(err.response.data.message);

//             }
//             // fallback
//             else {
//                 toast.error("Something went wrong!");
//             }
//         } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDepartments();
//   }, []);

//   const resetForm = () => setDepartmentName("");

//   // Add department
//   const addDepartment = async () => {
//     if (!departmentName.trim()) {
//       toast.error("Department cannot be empty");
//       return;
//     }

//     try {
//       const res = await axios.post(`${API_BASE}/add-department`, {
//         department: departmentName,
//       });
//       if (res.data.status) {
//         fetchDepartments();
//         setShowModal(false);
//         resetForm();
//         toast.success("Department added successfully!");
//       }
//     } catch (err) {
//             console.error(err);

//             // ✅ Laravel validation error handle
//             if (err.response?.data?.errors) {

//                 const errors = err.response.data.errors;

//                 // First error message show
//                 const firstError = Object.values(errors)[0][0];

//                 toast.error(firstError);

//             }
//             // ✅ General message (like "message")
//             else if (err.response?.data?.message) {

//                 toast.error(err.response.data.message);

//             }
//             // fallback
//             else {
//                 toast.error("Something went wrong!");
//             }
//         }
//   };

//   // Delete department
//   const deleteDepartment = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this department?"))
//       return;

//     try {
//       const res = await axios.delete(`${API_BASE}/delete-department/${id}`);
//       if (res.data.status) {
//         fetchDepartments();
//         toast.success("Department deleted successfully!");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to delete department");
//     }
//   };

//   return (
//     <Layout>
//       <div className="d-flex">
//         <div className="flex-grow-1">
//           <DashNav />

//           <div className="container mt-4">
//             <div className="d-flex justify-content-between align-items-center mb-3">
//               <h3>Department List</h3>
//               {userRole === "admin" && (
//                 <button
//                   className="btn btn-success"
//                   onClick={() => setShowModal(true)}
//                 >
//                   + Add
//                 </button>
//               )}
//             </div>

//             {loading ? (
//               <p>Loading...</p>
//             ) : (
//               <div className="table-responsive">
//                 <table className="table table-bordered table-striped">
//                   <thead className="table-dark">
//                     <tr>
//                       <th>Department</th>
//                       {userRole === "admin" && <th>Action</th>}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {departments.length > 0 ? (
//                       departments.map((dept) => (
//                         <tr key={dept.id}>
//                           <td>{dept.department}</td>
//                           {userRole === "admin" && (
//                             <td>
//                               <button
//                                 className="btn btn-danger btn-sm"
//                                 onClick={() => deleteDepartment(dept.id)}
//                               >
//                                 <i className="bi bi-trash"></i>
//                               </button>
//                             </td>
//                           )}
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan={userRole === "admin" ? 2 : 1} className="text-center">
//                           No Departments Found
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>

//           <Footer />
//         </div>
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <div
//           className="modal fade show"
//           style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
//         >
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">Add Department</h5>
//                 <button
//                   className="btn-close"
//                   onClick={() => {
//                     setShowModal(false);
//                     resetForm();
//                   }}
//                 ></button>
//               </div>

//               <div className="modal-body">
//                 <div className="mb-3">
//                   <label className="form-label">Department</label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     value={departmentName}
//                     onChange={(e) => setDepartmentName(e.target.value)}
//                     placeholder="Enter Department Name"
//                   />
//                 </div>
//               </div>

//               <div className="modal-footer">
//                 <button
//                   className="btn btn-danger"
//                   onClick={() => {
//                     setShowModal(false);
//                     resetForm();
//                   }}
//                 >
//                   Close
//                 </button>
//                 <button className="btn btn-success" onClick={addDepartment}>
//                   Save
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <ToastContainer position="top-right" autoClose={3000} />
//     </Layout>
//   );
// };

// export default Department;

import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Footer from "./Footer";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DashNav from "./DasNav";

export const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [departmentName, setDepartmentName] = useState("");
  const userRole = localStorage.getItem("userRole");

  // --- Search and Pagination States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all departments
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

  // Add department
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

  // Delete department
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

  // --- Search Logic ---
  const filteredDepartments = departments.filter((dept) =>
    dept.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDepartments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Layout>
      <div className="d-flex">
        <div className="flex-grow-1">
          <DashNav />

          <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3>Department List</h3>
              {userRole === "admin" && (
                <button
                  className="btn btn-success"
                  onClick={() => setShowModal(true)}
                >
                  + Add
                </button>
              )}
            </div>

            {/* --- Search Box --- */}
            <div className="row mb-3">
              <div className="col-md-4">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search Department..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1); // Search korle 1st page-e niye jabe
                    }}
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                <div className="table-responsive shadow-sm rounded">
                  <table className="table table-bordered table-striped align-middle">
                    <thead className="table-dark text-center">
                      <tr>
                        <th>Department</th>
                        {userRole === "admin" && <th>Action</th>}
                      </tr>
                    </thead>
                    <tbody className="text-center">
                      {currentItems.length > 0 ? (
                        currentItems.map((dept) => (
                          <tr key={dept.id}>
                            <td>{dept.department}</td>
                            {userRole === "admin" && (
                              <td>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => deleteDepartment(dept.id)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={userRole === "admin" ? 2 : 1} className="text-center">
                            No Departments Found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* --- Pagination Controls --- */}
                {filteredDepartments.length > itemsPerPage && (
                  <nav className="mt-4">
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button 
                          className="page-link shadow-none" 
                          onClick={() => paginate(currentPage - 1)}
                        >
                          &laquo;
                        </button>
                      </li>
                      
                      {[...Array(totalPages)].map((_, i) => (
                        <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                          <button 
                            className="page-link shadow-none" 
                            onClick={() => paginate(i + 1)}
                          >
                            {i + 1}
                          </button>
                        </li>
                      ))}

                      <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                        <button 
                          className="page-link shadow-none" 
                          onClick={() => paginate(currentPage + 1)}
                        >
                          &raquo;
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </>
            )}
          </div>

          <Footer />
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Department</h5>
                <button
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                ></button>
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-control"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    placeholder="Enter Department Name"
                  />
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
                <button className="btn btn-success" onClick={addDepartment}>
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

export default Department;