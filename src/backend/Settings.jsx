import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import DashNav from "./DasNav";
import Footer from "./Footer";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { BsTrash, BsArrowLeft, BsArrowRight } from "react-icons/bs";

export const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Settings = () => {
    const [countries, setCountries] = useState([]);
    const [countryName, setCountryName] = useState("");
    const [searchTerm, setSearchTerm] = useState(""); // 🔹 search term
    const [countryPage, setCountryPage] = useState(1);
    const itemsPerPage = 8;

   const userRole = localStorage.getItem("userRole");
    // Fetch countries
    const fetchCountries = () => {
        axios
            .get(`${API_BASE}/all-country`) // backend endpoint should return countries
            .then((res) => {
                if (res.data.success) setCountries(res.data.data);
            })
            .catch(() => toast.error("Failed to fetch countries"));
    };

    useEffect(() => {
        fetchCountries();
    }, []);

    // Add country
    const handleCountrySubmit = (e) => {
        e.preventDefault();
        if (!countryName.trim()) {
            toast.error("Country cannot be empty");
            return;
        }

        axios
            .post(`${API_BASE}/country/store`, { name: countryName }) // backend endpoint to store country
            .then((res) => {
                toast.success(res.data.message || "Country created!");
                setCountryName("");
                fetchCountries();
            })
            .catch(() => toast.error("Failed to create country"));
    };

    // Delete country
    const handleDeleteCountry = (id) => {
        if (window.confirm("Are you sure you want to delete this country?")) {
            axios
                .delete(`${API_BASE}/delete-country/${id}`) // backend endpoint to delete country
                .then(() => {
                    toast.success("Country deleted!");
                    fetchCountries();
                })
                .catch(() => toast.error("Failed to delete country"));
        }
    };

    // Filter countries by search term
    const filteredCountries = countries.filter((country) =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const paginatedCountries = filteredCountries.slice(
        (countryPage - 1) * itemsPerPage,
        countryPage * itemsPerPage
    );
    const countryTotalPages = Math.ceil(filteredCountries.length / itemsPerPage);

    return (
        <Layout>
            <div className="d-flex">
                <div className="flex-grow-1">
                    <DashNav />
                    <div className="container mt-4">

                        {/* Left-side: Form + Table */}
                        <div className="row g-4">
                            <h3>Country Settings</h3>

                            {/* Add Country Form */}

                            {userRole === "admin" && (
                            <div className="col-md-6">
                                <form className="shadow p-4 rounded bg-light" onSubmit={handleCountrySubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="country_name" className="form-label">Add Country</label>
                                        <input
                                            type="text"
                                            id="country_name"
                                            className="form-control"
                                            placeholder="Enter Country"
                                            value={countryName}
                                            onChange={(e) => setCountryName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-success">Submit</button>
                                </form>
                            </div>

                               )}

                            
                            {/* Country Table */}
                            <div className="col-md-6 d-flex flex-column">
                                {/* 🔹 Header + Search */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="m-0">Countries</h5>
                                    <input
                                        type="text"
                                        className="form-control w-auto"
                                        placeholder="Search by country name..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCountryPage(1);
                                        }}
                                    />
                                </div>

                                <div className="table-responsive shadow-sm">
                                    <table className="table table-bordered table-striped text-center">
                                        <thead className="table-dark">
                                            <tr>
                                                <th>#</th>
                                                <th>Country</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedCountries.length > 0 ? paginatedCountries.map((country, idx) => (
                                                <tr key={country.id}>
                                                    <td>{(countryPage - 1) * itemsPerPage + idx + 1}</td>
                                                    <td>{country.name}</td>
                                                    <td>  
                                                        {userRole === "admin" && (
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            title="Delete"
                                                            onClick={() => handleDeleteCountry(country.id)}
                                                        >
                                                            <BsTrash />
                                                        </button>
                                                           )}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="3">No countries found</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination buttons */}
                                <div className="d-flex justify-content-center align-items-center mt-2">
                                    <button
                                        className="btn btn-sm btn-dark me-2"
                                        disabled={countryPage === 1}
                                        onClick={() => setCountryPage(prev => prev - 1)}
                                        title="Previous Page"
                                    >
                                        <BsArrowLeft />
                                    </button>

                                    <span className="mx-2">
                                        Page {countryPage} of {countryTotalPages}
                                    </span>

                                    <button
                                        className="btn btn-sm btn-dark ms-2"
                                        disabled={countryPage === countryTotalPages}
                                        onClick={() => setCountryPage(prev => prev + 1)}
                                        title="Next Page"
                                    >
                                        <BsArrowRight />
                                    </button>
                                </div>
                            </div>

                        </div>

                        

                    </div>
                    <Footer />
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
            />
        </Layout>
    );
};

export default Settings;