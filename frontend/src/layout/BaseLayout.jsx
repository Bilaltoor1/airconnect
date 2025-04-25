import { Outlet } from 'react-router-dom'
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import ScrollToTop from "../components/ScrollToTop.jsx";

const BaseLayout = () => {
    return (
        <div className="min-h-screen flex bg-base-100 overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 h-screen relative">
                <Header />
                <main className="flex-1 overflow-y-auto pb-16" id="scrollable-content">
                    <Outlet />
                    <ScrollToTop scrollContainerId="scrollable-content" />
                </main>
            </div>
        </div>
    )
}

export default BaseLayout