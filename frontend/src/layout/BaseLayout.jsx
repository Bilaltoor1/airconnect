import { Outlet } from 'react-router-dom'
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";

const BaseLayout = () => {
    return (
        <div className="min-h-screen flex bg-base-100">
            <Sidebar />
            <div className="flex flex-col flex-1 h-screen">
                <Header />
                <main className="flex-1 overflow-y-auto pb-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default BaseLayout