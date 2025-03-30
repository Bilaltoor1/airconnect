import React from 'react';
import { Link } from 'react-router-dom';
import { UserCheck } from 'lucide-react';

const CoordinatorSidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button onClick={toggleSidebar}>Toggle Sidebar</button>
      <nav className="mt-8">
        <Link
          to="/verify-teachers"
          className="flex items-center px-4 py-3 text-gray-600 transition-colors hover:bg-green-50 hover:text-green-700 rounded-lg"
        >
          <UserCheck className="mr-2" size={18} />
          <span>Verify Teachers</span>
        </Link>
      </nav>
    </div>
  );
};

export default CoordinatorSidebar;