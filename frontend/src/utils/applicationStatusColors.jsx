export const getStatusColor = (status) => {
    switch (status) {
        case 'Pending':
            return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'Forward to Coordinator':
        case 'Transit': // Keep backward compatibility
            return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'Approved by Coordinator':
        case 'Forwarded': // Keep backward compatibility
            return 'bg-green-100 text-green-800 border-green-300';
        case 'Rejected':
            return 'bg-red-100 text-red-800 border-red-300';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-300';
    }
};

export const getStatusDisplayText = (status) => {
    switch (status) {
        case 'Pending':
            return 'Pending';
        case 'Transit':
            return 'Forward to Coordinator';
        case 'Forward to Coordinator':
            return 'Forward to Coordinator';
        case 'Forwarded':
            return 'Approved by Coordinator';
        case 'Approved by Coordinator':
            return 'Approved by Coordinator';
        case 'Rejected':
            return 'Rejected';
        default:
            return status;
    }
};