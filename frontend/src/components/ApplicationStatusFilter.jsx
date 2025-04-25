import React from 'react';
import { getStatusColor } from '../utils/applicationStatusColors';

const ApplicationStatusFilter = ({ activeFilter, setActiveFilter }) => {
  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Forward to Coordinator', label: 'Forward to Coordinator' },
    { value: 'Approved by Coordinator', label: 'Approved by Coordinator' },
    { value: 'Rejected', label: 'Rejected' }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {statuses.map((status) => (
        <button
          key={status.value}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            status.value === 'all' 
            ? (activeFilter === 'all' ? 'bg-primary text-black' : 'bg-gray-100 hover:bg-gray-200') 
            : `${getStatusColor(status.value)} ${activeFilter === status.value ? 'ring-2 ring-offset-1 ring-primary' : 'hover:bg-opacity-80'}`
          }`}
          onClick={() => setActiveFilter(status.value)}
        >
          {status.label}
        </button>
      ))}
    </div>
  );
};

export default ApplicationStatusFilter;
