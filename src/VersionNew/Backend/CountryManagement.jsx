import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { BsTrash, BsArrowLeft, BsArrowRight, BsSearch, BsGlobe, BsPlusCircle } from "react-icons/bs";

export const API_BASE = import.meta.env.VITE_API_BASE_URL;

const CountryManagement = () => {
    const [countries, setCountries] = useState([]);
    const [countryName, setCountryName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [countryPage, setCountryPage] = useState(1);
    const itemsPerPage = 8;

    const userRole = localStorage.getItem("userRole");

    const fetchCountries = async () => {
        try {
            const res = await axios.get(`${API_BASE}/all-country`);
            if (res.data.success) {
                setCountries(res.data.data);
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

    useEffect(() => {
        fetchCountries();
    }, []);

    const handleCountrySubmit = async (e) => {
        e.preventDefault();
        if (!countryName.trim()) {
            toast.error("Country cannot be empty");
            return;
        }
        try {
            const res = await axios.post(`${API_BASE}/country/store`, {
                name: countryName
            });
            toast.success(res.data.message || "Country created!");
            setCountryName("");
            fetchCountries();
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

    const handleDeleteCountry = (id) => {
        if (window.confirm("Are you sure you want to delete this country?")) {
            axios
                .delete(`${API_BASE}/delete-country/${id}`)
                .then(() => {
                    toast.success("Country deleted!");
                    fetchCountries();
                })
                .catch(() => toast.error("Failed to delete country"));
        }
    };

    const filteredCountries = countries.filter((country) =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedCountries = filteredCountries.slice(
        (countryPage - 1) * itemsPerPage,
        countryPage * itemsPerPage
    );
    const countryTotalPages = Math.ceil(filteredCountries.length / itemsPerPage);

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
                                                <BsGlobe className="me-2" style={{ color: '#3498db', fontSize: '28px' }} />
                                                Country Management
                                            </h2>
                                            <p className="text-muted mb-0">Manage countries and their configurations</p>
                                        </div>
                                        <div className="badge bg-info rounded-pill px-3 py-2">
                                            <i className="bi bi-flag me-1"></i> Total Countries: {filteredCountries.length}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4">
                        {/* Add Country Form */}
                        {userRole === "admin" && (
                            <div className="col-lg-5 col-md-12">
                                <div className="card shadow-sm border-0 rounded-3 h-100">
                                    <div className="card-body p-4">
                                        <div className="text-center mb-4">
                                            <div style={{
                                                width: '70px',
                                                height: '70px',
                                                backgroundColor: '#e8f4f8',
                                                borderRadius: '50%',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: '10px'
                                            }}>
                                                <BsPlusCircle style={{ fontSize: '35px', color: '#3498db' }} />
                                            </div>
                                            <h5 className="mb-1" style={{ color: '#2c3e50' }}>Add New Country</h5>
                                            <p className="text-muted small mb-0">Enter country details to add to the list</p>
                                        </div>

                                        <form onSubmit={handleCountrySubmit}>
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold">
                                                    <BsGlobe className="me-1" /> Country Name
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control rounded-3"
                                                    placeholder="Enter country name (e.g., United States, Bangladesh)"
                                                    value={countryName}
                                                    onChange={(e) => setCountryName(e.target.value)}
                                                    required
                                                />
                                                <small className="text-muted">Country name should be unique</small>
                                            </div>
                                            <button type="submit" className="btn btn-primary w-100 rounded-3 py-2">
                                                <BsPlusCircle className="me-2" /> Add Country
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Country Table */}
                        <div className={`${userRole === "admin" ? "col-lg-7" : "col-12"} col-md-12`}>
                            <div className="card shadow-sm border-0 rounded-3">
                                <div className="card-body p-0">
                                    <div className="p-4 border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
                                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                            <h5 className="mb-0" style={{ color: '#2c3e50' }}>
                                                <BsGlobe className="me-2" /> Countries List
                                            </h5>
                                            <div className="input-group" style={{ maxWidth: '300px' }}>
                                                <span className="input-group-text bg-white border-end-0">
                                                    <BsSearch className="text-muted" />
                                                </span>
                                                <input
                                                    type="text"
                                                    className="form-control border-start-0"
                                                    placeholder="Search by country name..."
                                                    value={searchTerm}
                                                    onChange={(e) => {
                                                        setSearchTerm(e.target.value);
                                                        setCountryPage(1);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead style={{ backgroundColor: '#34495e', color: 'white' }}>
                                                <tr>
                                                    <th className="py-3 px-4" style={{ width: '80px' }}>#</th>
                                                    <th className="py-3">Country Name</th>
                                                    <th className="py-3 text-center" style={{ width: '100px' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedCountries.length > 0 ? (
                                                    paginatedCountries.map((country, idx) => (
                                                        <tr key={country.id} style={{ cursor: 'pointer' }}>
                                                            <td className="py-3 px-4">
                                                                <span className="badge bg-secondary rounded-pill px-3">
                                                                    {(countryPage - 1) * itemsPerPage + idx + 1}
                                                                </span>
                                                             </td>
                                                            <td className="py-3">
                                                                <div className="d-flex align-items-center">
                                                                    <div style={{
                                                                        width: '35px',
                                                                        height: '35px',
                                                                        backgroundColor: '#e8f4f8',
                                                                        borderRadius: '8px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        marginRight: '12px'
                                                                    }}>
                                                                        <BsGlobe style={{ color: '#3498db' }} />
                                                                    </div>
                                                                    <strong>{country.name}</strong>
                                                                </div>
                                                             </td>
                                                            <td className="py-3 text-center">
                                                                {userRole === "admin" && (
                                                                    <button
                                                                        className="btn btn-danger btn-sm rounded-pill px-3"
                                                                        title="Delete Country"
                                                                        onClick={() => handleDeleteCountry(country.id)}
                                                                    >
                                                                        <BsTrash className="me-1" /> Delete
                                                                    </button>
                                                                )}
                                                             </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="3" className="text-center py-5">
                                                            <BsGlobe style={{ fontSize: '48px', color: '#ccc' }} />
                                                            <p className="mt-2 text-muted">No countries found</p>
                                                            {searchTerm && (
                                                                <p className="text-muted small">Try a different search term</p>
                                                            )}
                                                            {!searchTerm && userRole === "admin" && (
                                                                <button 
                                                                    className="btn btn-primary btn-sm mt-2 rounded-pill"
                                                                    onClick={() => document.querySelector('input[type="text"]')?.focus()}
                                                                >
                                                                    <BsPlusCircle className="me-1" /> Add your first country
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {filteredCountries.length > 0 && (
                                        <div className="d-flex justify-content-between align-items-center px-4 py-3 border-top">
                                            <div className="text-muted small">
                                                Showing {(countryPage - 1) * itemsPerPage + 1} to {Math.min(countryPage * itemsPerPage, filteredCountries.length)} of {filteredCountries.length} entries
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <button
                                                    className="btn btn-outline-secondary btn-sm rounded-pill"
                                                    disabled={countryPage === 1}
                                                    onClick={() => setCountryPage(prev => prev - 1)}
                                                    title="Previous Page"
                                                >
                                                    <BsArrowLeft /> Previous
                                                </button>
                                                
                                                <div className="px-3 py-1 bg-light rounded-pill">
                                                    <span className="fw-semibold">{countryPage}</span>
                                                    <span className="text-muted"> / {countryTotalPages}</span>
                                                </div>

                                                <button
                                                    className="btn btn-outline-secondary btn-sm rounded-pill"
                                                    disabled={countryPage === countryTotalPages}
                                                    onClick={() => setCountryPage(prev => prev + 1)}
                                                    title="Next Page"
                                                >
                                                    Next <BsArrowRight />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
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

export default CountryManagement;