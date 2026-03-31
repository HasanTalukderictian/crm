import { useEffect, useState } from 'react';
import '../assets/css/nav.scss'

export const API_BASE = import.meta.env.VITE_API_BASE_URL;
export const API_STORE = import.meta.env.VITE_API_STORAGE_URL;

const DashNav = () => {
    const [showModal, setShowModal] = useState(false);
    const [companyName, setCompanyName] = useState('Gazi Builders');
    const [logo, setLogo] = useState('https://i.ibb.co.com/kgghmZfy/Flying-Bird-logo-design-template.png');



    const [yourName, setYourName] = useState('');

    const [formCompanyName, setFormCompanyName] = useState('');
    const [formImage, setFormImage] = useState(null);

    const userRole = localStorage.getItem("userRole");


    const [notifications, setNotifications] = useState([]);

    const [headerId, setHeaderId] = useState(null);

    console.log("Header ID:", headerId);


    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("authToken");// যদি auth token থাকে

            const res = await fetch(`${API_BASE}/notifications`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json"
                }
            });

            const data = await res.json();

            if (res.ok && data.status) {
                setNotifications(data.data);
            }
        } catch (error) {
            console.error("Notification fetch error:", error);
        }
    };


    const fetchUser = async () => {
        try {
            const token = localStorage.getItem("authToken");

            const res = await fetch(`${API_BASE}/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json"
                }
            });

            const data = await res.json();

            if (res.ok && data.status) {
                setYourName(data.data.name);

                // optional: localStorage update
                localStorage.setItem("userName", data.data.name);
            }

        } catch (error) {
            console.error("User fetch error:", error);
        }
    };



    useEffect(() => {
        fetchNotifications();
        fetchUser()
    }, []);


    const handleNotificationClick = async () => {
        const token = localStorage.getItem("authToken");

        try {
            const res = await fetch(`${API_BASE}/notifications`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            const data = await res.json();

            if (data.status) {
                const notis = data.data || [];

                setNotifications(notis);

                // 👉 unread notifications
                const unread = notis.filter(n => !n.is_read);

                // 👉 show messages
                unread.forEach(n => alert(n.message));

                // 👉 mark all as read (optional best practice)
                await fetch(`${API_BASE}/notifications/read-all`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });

                // 👉 update UI instantly
                setNotifications(prev =>
                    prev.map(n => ({ ...n, is_read: true }))
                );
            }

        } catch (error) {
            console.error(error);
        }
    };

    // Fetch company info
    const fetchCompanyInfo = async () => {
    try {
        const response = await fetch(`${API_BASE}/get-header`);
        const data = await response.json();

        console.log("API Response:", data);

        const header = Array.isArray(data.data) ? data.data[0] : data.data;

        if (header) {
            setCompanyName(header.company_name || 'Gazi Builders');
            setLogo(
                header.image
                    ? (header.image.startsWith('http')
                        ? header.image
                        : `${API_STORE}/${header.image}`)
                    : 'https://i.ibb.co.com/kgghmZfy/Flying-Bird-logo-design-template.png'
            );

            setFormCompanyName(header.company_name);
            setHeaderId(header.id);

            console.log("Header ID set:", header.id);
        } else {
            console.warn("No header found");
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


    useEffect(() => {
        const name = localStorage.getItem("userName");
        if (name) {
            setYourName(name);
        }
    }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");

    const formData = new FormData();
    formData.append('company_name', formCompanyName);

    if (formImage instanceof File) {
        const optimizedBlob = await optimizeImage(formImage);
        const optimizedFile = new File([optimizedBlob], formImage.name, { type: 'image/jpeg' });
        formData.append('image', optimizedFile);
    }

    // 👉 Decide create or update
    let url = `${API_BASE}/add-header`;
    let method = "POST";

    if (headerId) {
        url = `${API_BASE}/edit-userInfo/${headerId}`;
        formData.append('_method', 'POST'); // Laravel convention
    }

    try {
        const response = await fetch(url, {
            method: "POST", // always POST for FormData
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok && data.status) {
            alert(data.message || 'Saved successfully');
            setShowModal(false);
            fetchCompanyInfo(); // refresh
        } else {
            alert('Failed: ' + (data.message || 'Error'));
        }

    } catch (error) {
        console.error(error);
        alert('Request failed');
    }
};

    return (
        <>
            <div className="d-flex container justify-content-center">
                <nav
                    className="navbar bg-white shadow-sm py-2 px-4 d-flex justify-content-between align-items-center"
                    style={{ maxWidth: "1500px", width: "100%" }}
                >

                    {/* 🔵 Left Side (Logo + Name) */}
                    <div className="d-flex align-items-center">
                        <img src={logo} alt="Company Logo" className="me-2" style={{ height: "40px" }} />
                        <h4 className="fw-bold text-primary m-0">{companyName}</h4>
                    </div>

                    {/* 🔵 Right Side (Notification + User) */}
                    <div className="d-flex align-items-center gap-4">

                        {/* 🔔 Notification Icon */}


                        <div
                            style={{ position: "relative", cursor: "pointer" }}
                            onClick={handleNotificationClick}
                        >
                            <i className="bi bi-bell fs-4"></i>

                            <span
                                style={{
                                    position: "absolute",
                                    top: "-5px",
                                    right: "-8px",
                                    background: "red",
                                    color: "white",
                                    borderRadius: "50%",
                                    fontSize: "10px",
                                    padding: "2px 6px",
                                    minWidth: "18px",
                                    textAlign: "center"
                                }}
                            >
                                {notifications.filter(n => !n.is_read).length || 0}
                            </span>
                        </div>



                        {/* 👤 User Info */}
                        <div className="mt-1 mb-1">
                            <span className="d-block text-muted">Hello,</span>
                            <span
                                className="fw-bold"
                                style={{
                                    cursor: userRole === 'admin' ? 'pointer' : 'default',
                                    color: "#0d6efd"
                                }}
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
                            <p className="small text-muted m-0">
                                Welcome to our panel
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