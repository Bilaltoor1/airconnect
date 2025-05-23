import { useState, useEffect } from 'react';
import {
    Home,
    Settings,
    Menu,
    User,
    FileText,
    HelpCircle,
    BookCheck,
    SquarePen,
    Award,
    BadgePlus,
    Plus,
    ChevronLeft,
    Bell,
    Briefcase,
    MessageSquare,
    FileSpreadsheet,
    History,
    GraduationCap,
    UserPlus,
    Layout,
    UserCheck,
    ChevronDown,
    ChevronRight,
    Layers,
    Grid,
    Lock
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from "@/context/AuthContext.jsx";
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
    const location = useLocation();
    const [activeLink, setActiveLink] = useState(location.pathname);
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedItems, setExpandedItems] = useState({});
    const { user } = useAuth(); // Get the authenticated user

    useEffect(() => {
        setActiveLink(location.pathname);
        
        // Close sidebar on route change in mobile view
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsExpanded(false);
            }
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [location.pathname]);

    const toggleSubMenu = (text) => {
        setExpandedItems(prev => ({
            ...prev,
            [text]: !prev[text]
        }));
    };

    const getLinkItems = (role) => {
        let roleSpecificLinks = [];
        
        switch (role) {
            case 'student':
                roleSpecificLinks = [
                    { icon: Bell, text: 'Notification', link: '/' },
                    { icon: Briefcase, text: 'Jobs & interns', link: '/job-listings' },
                    // { icon: MessageSquare, text: 'Complaints', link: '/complaints' },
                    { icon: FileSpreadsheet, text: 'Application', link: '/application' },
                    { icon: History, text: 'Application history', link: '/student-applications-history' },
                ];
                break;
            case 'teacher':
                roleSpecificLinks = [
                    { icon: Bell, text: 'Notification', link: '/' },
                    { icon: Briefcase, text: 'Jobs & interns', link: '/job-listings' },
                    { icon: BadgePlus, text: 'Announcement', link: '/create-announcement' },
                    { icon: FileSpreadsheet, text: 'Application', link: '/teacher-applications' },
                    { icon: History, text: 'Application history', link: '/teacher-applications-history' },
                ];
                break;
            case 'coordinator':
                roleSpecificLinks = [
                    { icon: Bell, text: 'Notification', link: '/' },
                    { icon: Briefcase, text: 'Jobs & interns', link: '/job-listings' },
                    { icon: BadgePlus, text: 'Announcement', link: '/create-announcement' },
                    { 
                        icon: Layout, 
                        text: 'Batches', 
                        link: '/batches',
                        hasChildren: true,
                        children: [
                            { icon: Layers, text: 'Batch Manage', link: '/batches-management' },
                            { icon: Grid, text: 'Section Manage', link: '/section-filter-management' },
                        ]
                    },
                    { icon: FileSpreadsheet, text: 'Application', link: '/coordinator-applications' },
                    { icon: UserPlus, text: 'Add Student', link: '/add-student' },
                    { icon: UserPlus, text: 'Add Teacher', link: '/add-teacher' },
                    { icon: UserCheck, text: 'Verify Teachers', link: '/verify-teachers' },
                    { icon: UserPlus, text: 'Add Advisor', link: '/add-advisor' },
                    { icon: History, text: 'Application History', link: '/coordinator-applications-history' },
                ];
                break;
            case 'student-affairs':
                roleSpecificLinks = [
                    { icon: Bell, text: 'Notification', link: '/' },
                    { icon: Briefcase, text: 'Jobs & interns', link: '/job-listings' },
                    { icon: SquarePen, text: 'Create Jobs', link: '/create-jobs' }
                ];
                break;
            default:
                roleSpecificLinks = [];
        }
        
        // Add Profile section with children for all users
        roleSpecificLinks.push({
            icon: User, 
            text: 'View Profile', 
            link: '/view-user',
            hasChildren: true,
            children: [
                { icon: User, text: 'Edit Profile', link: '/update-user' },
                { icon: Lock, text: 'Change Password', link: '/change-password' },
            ]
        });
        
        return roleSpecificLinks;
    };

    const linkItems = getLinkItems(user?.role);

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <>
            {/* Mobile toggle button - always visible on small screens */}
            <button 
                onClick={toggleSidebar}
                className="md:hidden fixed top-4 left-4 z-50 bg-base-100 border p-2 rounded-full shadow-lg"
                aria-label="Toggle sidebar">
                <Menu className="w-6 h-6" />
            </button>
            
            {/* Sidebar */}
            <div 
                className={`transition-all duration-300 ease-in-out bg-base-100 shadow-lg
                    md:relative fixed md:translate-x-0 z-40 h-screen
                    ${isExpanded ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    ${isExpanded ? 'w-[250px]' : 'w-[70px] md:w-[250px]'}`}
            >
                <div className="flex justify-between items-center p-4 border-b">
                    <div className={`flex items-center ${!isExpanded && 'md:flex hidden'}`}>
                        <Link to="/" className="flex items-center">
                            <h2 className='text-xl font-bold text-primary'>
                                Air University
                            </h2>
                            <span className='ml-2 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full'></span>
                        </Link>
                    </div>
                    <button 
                        onClick={toggleSidebar} 
                        className="md:hidden"
                        aria-label="Close sidebar">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="py-4">
                    <ul className="flex flex-col gap-1 px-2">
                        {linkItems.map((item, index) => (
                            <li key={index}>
                                {item.hasChildren ? (
                                    <div className="flex flex-col">
                                        <div 
                                            className={`flex items-center justify-between rounded-md px-3 py-2.5 transition-all duration-200
                                                ${(activeLink === item.link || item.children?.some(child => activeLink === child.link))
                                                    ? 'bg-gradient-to-r from-emerald-600 to-green-400 text-white shadow-md' 
                                                    : 'hover:bg-base-300'}`}
                                        >
                                            <Link 
                                                to={item.link}
                                                className="flex items-center flex-grow"
                                                onClick={() => setActiveLink(item.link)}
                                            >
                                                <item.icon className="w-5 h-5" />
                                                <span className={`ml-3 font-medium ${!isExpanded ? 'md:block hidden' : 'block'}`}>
                                                    {item.text}
                                                </span>
                                            </Link>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleSubMenu(item.text);
                                                }}
                                                className="ml-1"
                                            >
                                                {(isExpanded || window.innerWidth >= 768) && (
                                                    expandedItems[item.text] ? 
                                                    <ChevronDown className="w-4 h-4" /> : 
                                                    <ChevronRight className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                        <AnimatePresence>
                                            {expandedItems[item.text] && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden"
                                                >
                                                    <ul className="pl-7 pt-1">
                                                        {item.children.map((child, childIndex) => (
                                                            <li key={`${index}-${childIndex}`}>
                                                                <Link 
                                                                    to={child.link} 
                                                                    className={`flex items-center rounded-md px-3 py-2 transition-all duration-200
                                                                        ${activeLink === child.link 
                                                                            ? 'bg-gradient-to-r from-emerald-600 to-green-400 text-white shadow-md' 
                                                                            : 'hover:bg-base-300'}`}
                                                                    onClick={() => setActiveLink(child.link)}
                                                                >
                                                                    <child.icon className="w-4 h-4" />
                                                                    <span className={`ml-2 font-medium text-sm ${!isExpanded ? 'md:block hidden' : 'block'}`}>
                                                                        {child.text}
                                                                    </span>
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <Link 
                                        to={item.link} 
                                        className={`flex items-center rounded-md px-3 py-2.5 transition-all duration-200
                                            ${activeLink === item.link 
                                                ? 'bg-gradient-to-r from-emerald-600 to-green-400 text-white shadow-md' 
                                                : 'hover:bg-base-300'}`}
                                        onClick={() => setActiveLink(item.link)}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className={`ml-3 font-medium ${!isExpanded ? 'md:block hidden' : 'block'}`}>
                                            {item.text}
                                        </span>
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            
            {/* Overlay for mobile when sidebar is expanded */}
            {isExpanded && (
                <div 
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={toggleSidebar}
                ></div>
            )}
        </>
    );
};

export default Sidebar;