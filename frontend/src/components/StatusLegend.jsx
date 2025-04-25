import React from 'react';

const StatusLegend = ({ userRole = 'student' }) => {
  // Customize text based on user role
  const getForwardToCoordinatorText = () => {
    switch (userRole) {
      case 'teacher':
        return 'Forward to Coordinator (Approved by You)';
      case 'coordinator':
        return 'Forward to Coordinator (Pending Your Approval)';
      default:
        return 'Forward to Coordinator (Approved by Advisor)';
    }
  };

  const getApprovedByCoordinatorText = () => {
    switch (userRole) {
      case 'teacher':
        return 'Approved by Coordinator (Final Approval)';
      case 'coordinator':
        return 'Approved by You (Final Approval)';
      default:
        return 'Approved by Coordinator (Final Approval)';
    }
  };

  return (
    <div className="bg-base-100 border rounded-lg shadow-sm p-3 mb-4">
      <div className="flex flex-wrap gap-3 text-xs justify-center md:justify-start">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded mr-1 bg-yellow-100 border border-yellow-300"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded mr-1 bg-blue-100 border border-blue-300"></div>
          <span>{getForwardToCoordinatorText()}</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded mr-1 bg-green-100 border border-green-300"></div>
          <span>{getApprovedByCoordinatorText()}</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded mr-1 bg-red-100 border border-red-300"></div>
          <span>Rejected</span>
        </div>
      </div>
    </div>
  );
};

export default StatusLegend;
