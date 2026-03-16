import { useEffect, useState } from 'react';
import '../assets/css/nav.scss'

export const API_BASE = import.meta.env.VITE_API_BASE_URL;
export const API_STORE = import.meta.env.VITE_API_STORAGE_URL;

const DashNav = () => {
    const [showModal, setShowModal] = useState(false);
    const [companyName, setCompanyName] = useState('Gazi Builders');
    const [logo, setLogo] = useState('https://i.ibb.co.com/kgghmZfy/Flying-Bird-logo-design-template.png');
    const [yourName, setYourName] = useState('');
    const [image, setImage] = useState(null);

    const [formCompanyName, setFormCompanyName] = useState('');
    const [formImage, setFormImage] = useState(null);

    const userRole = localStorage.getItem("userRole");

    // Fetch company info
    const fetchCompanyInfo = async () => {
        try {
            const response = await fetch(`${API_BASE}/get-header`);
            const data = await response.json();

            if (response.ok && data.status && data.data.length > 0) {
                const header = data.data[0];

                setCompanyName(header.company_name || 'Gazi Builders');

                // API থেকে full URL already আছে, তাই সরাসরি setLogo
                setLogo(header.image || 'https://i.ibb.co.com/kgghmZfy/Flying-Bird-logo-design-template.png');

                setFormCompanyName(header.company_name);
            }
        } catch (err) {
            console.error("Failed to fetch company info:", err);
        }
    };
    useEffect(() => {
        fetchCompanyInfo();
    }, []);

    const handleOpenModal = () => {
        // যদি role admin হয়, modal না খোলে
        if (userRole === 'admin') return;

        setFormCompanyName(companyName);
        setFormImage(null);
        setShowModal(true);
    };
    const handleCloseModal = () => setShowModal(false);

    const optimizeImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    let { width, height } = img;

                    if (width > height) {
                        if (width > maxWidth) {
                            height = (height * maxWidth) / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = (width * maxHeight) / height;
                            height = maxHeight;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, 'image/jpeg', quality);
                };
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('company_name', formCompanyName);

        if (formImage instanceof File) {
            const optimizedBlob = await optimizeImage(formImage);
            const optimizedFile = new File([optimizedBlob], formImage.name, { type: 'image/jpeg' });
            formData.append('image', optimizedFile);
        }

        try {
            const response = await fetch(`${API_BASE}/add-header`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.status) {
                alert(data.message || 'Company info saved!');
                setShowModal(false);
                fetchCompanyInfo();
                setFormImage(null);
            } else {
                console.error('Error response:', data);
                alert('Failed to save: ' + (data.message || 'Check console'));
            }
        } catch (error) {
            console.error('Fetch error:', error);
            alert('An error occurred while saving the form.');
        }
    };

    return (
        <>
            <div className="d-flex container justify-content-center">
                <nav className="navbar bg-white shadow-sm py-2 px-4 d-flex justify-content-between align-items-center" style={{ maxWidth: "1500px", width: "100%" }}>
                    <div className="d-flex align-items-center">
                        <img src={logo} alt="Company Logo" className="me-2" style={{ height: "40px" }} />
                        <h4 className="fw-bold text-primary">{companyName}</h4>

                    </div>

                    <div className="d-flex align-items-center">
                        <div className="mt-1 mb-1">
                            <span className="d-block text-muted">Hello,</span>
                            <span
                                className="fw-bold"
                                style={{ cursor: userRole === 'admin' ? 'pointer' : 'default', color: "#0d6efd" }}
                                onClick={() => {
                                    if (userRole === 'admin') {
                                        setFormCompanyName(companyName);
                                        setFormImage(null);
                                        setShowModal(true);
                                    }
                                }}
                            >
                                {yourName || 'Admin'}
                            </span>
                            <p className="small text-muted m-0 d-flex align-items-center">
                                Welcome to our panel
                                {/* <span className="ms-2">😊</span> */}
                            </p>
                        </div>
                    </div>
                </nav>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">User Info</h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Company Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formCompanyName}
                                            onChange={(e) => setFormCompanyName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Image</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={(e) => e.target.files && setFormImage(e.target.files[0])}
                                            accept="image/*"
                                        />
                                        {formImage && (
                                            <div className="mt-2 position-relative d-inline-block">
                                                <img
                                                    src={URL.createObjectURL(formImage)}
                                                    alt="Preview"
                                                    style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "5px" }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormImage(null)}
                                                    style={{
                                                        position: "absolute",
                                                        top: "-5px",
                                                        right: "-5px",
                                                        borderRadius: "50%",
                                                        border: "none",
                                                        background: "red",
                                                        color: "white",
                                                        width: "20px",
                                                        height: "20px",
                                                        cursor: "pointer",
                                                        padding: 0,
                                                        lineHeight: "18px",
                                                        fontSize: "14px"
                                                    }}
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="modal-footer px-0">
                                        <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                                        <button type="submit" className="btn btn-primary">Save</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DashNav;