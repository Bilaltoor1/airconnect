import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AuthHeader = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <header className="w-full py-4 px-6 bg-gradient-to-r from-white/90 to-gray-50/95 backdrop-blur-md shadow-md fixed top-0 z-50 border-b border-gray-200">
            <div className="container mx-auto flex justify-between items-center max-w-7xl">
                {/* Logo Side */}
                <div className="flex items-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                            <span className="text-xl font-bold text-white">AU</span>
                        </div>
                        <h1 className="text-2xl font-bold text-emerald-800 hidden sm:inline-block">AIR UNIVERSITY MULTAN</h1>
                        <h1 className="text-2xl font-bold text-emerald-800 sm:hidden">AUMC</h1>
                    </div>
                </div>

                {/* Auth Buttons Side */}
                <div className="flex items-center space-x-4">
                    <Link
                        to="/login"
                        className="px-5 py-2.5 text-emerald-600 font-medium transition-colors bg-emerald-50 rounded-lg"
                    >
                        Login
                    </Link>
                    <Link
                        to="/signup"
                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-sm"
                    >
                        Sign Up
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default AuthHeader;
