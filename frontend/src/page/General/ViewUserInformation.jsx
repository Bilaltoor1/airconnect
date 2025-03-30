import { useEffect } from 'react';
import { useAuth } from "../../context/AuthContext.jsx";
import { Link, useNavigate } from 'react-router-dom';
import {format} from "date-fns";

const ViewUser = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="relative bg-base-200 rounded max-w-md w-full mx-auto p-6">
                <h1 className="text-lg font-bold">Your Profile</h1>
                <div className="grid grid-cols-2 gap-4 mt-4 py-2">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium">Name</label>
                        <p className="mt-1 block w-full py-3 bg-opacity-50 rounded-lg border border-gray-700 px-2 bg-base-100 text-base-text">{user.name}</p>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium">Email</label>
                        <p className="mt-1 block w-full py-3 bg-opacity-50 rounded-lg border border-gray-700 px-2 bg-base-100 text-base-text">{user.email}</p>
                    </div>
                    {user.role === 'student' && (
                        <>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium">Discipline</label>
                                <p className="mt-1 block w-full py-3 bg-opacity-50 rounded-lg border border-gray-700 px-2 bg-base-100 text-base-text">{user.section}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Roll No</label>
                                <p className="mt-1 block w-full py-3 bg-opacity-50 rounded-lg border border-gray-700 px-2 bg-base-100 text-base-text">{user.rollNo}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Batch</label>
                                <p className="mt-1 block w-full py-3 bg-opacity-50 rounded-lg border border-gray-700 px-2 bg-base-100 text-base-text">{user?.batchName}</p>
                            </div>
                        </>
                    )}
                    {user.role === 'teacher' && (
                        <div className="col-span-2">
                            <label className="block text-sm font-medium">Discipline</label>
                            <p className="mt-1 block w-full py-3 bg-opacity-50 rounded-lg border border-gray-700 px-2 bg-base-100 text-base-text">{user.section}</p>
                        </div>
                    )}
                    {user.role === 'coordinator' && (
                        <>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium">Department</label>
                                <p className="mt-1 block w-full py-3 bg-opacity-50 rounded-lg border border-gray-700 px-2 bg-base-100 text-base-text">{user.department}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium">Office Number</label>
                                <p className="mt-1 block w-full py-3 bg-opacity-50 rounded-lg border border-gray-700 px-2 bg-base-100 text-base-text">{user.officeNumber}</p>
                            </div>
                        </>
                    )}
                    <div className="col-span-2">
                        <Link to='/' className="btn text-base-text bg-base-100 w-full mt-2">Back</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewUser;