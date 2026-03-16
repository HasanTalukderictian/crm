import Layout from "../components/Layout";
import Dashboard from "./Dashboard";
import DashNav from "./DasNav";
import Footer from "./Footer";

const BackendHome = () => {

    const role = localStorage.getItem("adminRole");

    return (
        <Layout>
            <div className="d-flex">

                <div className="flex-grow-1">

                    <DashNav/>

                    {/* Dashboard everyone */}
                    <Dashboard />

                    {/* Only admin */}
                    {role === "admin" && (
                        <div className="p-3">
                            <h5>Admin Panel</h5>
                        </div>
                    )}

                    <Footer />

                </div>
            </div>
        </Layout>
    )
}

export default BackendHome;