import {Popover, PopoverButton, PopoverPanel} from '@headlessui/react';
import ThemeToggle from "./ThemeToggle.jsx";
import NotificationBell from './NotificationBell';
import {Link, useNavigate} from "react-router-dom";
import {useLogout} from "../hooks/useAuth.js";
import {useState, useEffect, useRef} from "react";
import { User } from 'lucide-react';
import { useAuth } from "../context/AuthContext.jsx";

function Header() {
    const { user } = useAuth();
    const {mutate: logout} = useLogout();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Close dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className='flex w-full px-6 border-b border-b-neutral border-opacity-40 h-16 items-center justify-end'>
            <NotificationBell />
            <ThemeToggle/>
            <Popover className="relative">
                <PopoverButton className="btn m-1 bg-transparent border-none hover:bg-transparent">
                    <div className="avatar">
                        <div className="ring-primary ring-offset-base-100 h-10 w-10 rounded-full ring ring-offset-2 overflow-hidden flex items-center justify-center bg-base-200">
                            {user?.profileImage ? (
                                <img 
                                    src={user.profileImage}
                                    alt={`${user?.name || 'User'}'s avatar`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <img 
                                    src={`https://avatar.iran.liara.run/username?username=${user?.name || 'anonymous'}`}
                                    alt={`${user?.name || 'User'}'s avatar`}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                    </div>
                </PopoverButton>
                <PopoverPanel className="absolute z-10 right-0 mt-2 w-52 bg-base-100 rounded-box shadow-lg">
                    <ul className="menu p-2">
                        {/* <li>
                            <Link to="/view-user">
                                View Profile
                            </Link>
                        </li>
                        <li>
                            <Link to="/update-user">
                                Edit Profile
                            </Link>
                        </li>
                        <li>
                            <Link to="/change-password">
                                Change Password
                            </Link>
                        </li> */}
                        <li className="mt-2 pt-2 border-t">
                            <button onClick={handleLogout}>
                                Logout
                            </button>
                        </li>
                    </ul>
                </PopoverPanel>
            </Popover>
        </div>
    );
}

export default Header;