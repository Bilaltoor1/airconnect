import React from 'react';
import { UserCircle, Users, BookOpen } from 'lucide-react';
import { getSectionColor, getBatchColor } from '../utils/GetSectionShortForm';
import { motion } from 'framer-motion';

const Badge = ({ children, color, icon: Icon, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${color} mr-2 mb-2 backdrop-blur-sm`}
    >
      {Icon && <Icon size={14} className="mr-1.5" />}
      {children}
    </motion.div>
  );
};

const RoleBadge = ({ role }) => {
  let color, text;
  
  switch (role?.toLowerCase()) {
    case 'teacher':
      color = 'bg-blue-100 text-blue-800 border border-blue-200';
      text = 'Teacher';
      break;
    case 'coordinator':
      color = 'bg-green-100 text-green-800 border border-green-200';
      text = 'Coordinator';
      break;
    case 'student':
      color = 'bg-purple-100 text-purple-800 border border-purple-200';
      text = 'Student';
      break;
    case 'student-affairs':
      color = 'bg-amber-100 text-amber-800 border border-amber-200';
      text = 'Student Affairs';
      break;
    default:
      color = 'bg-gray-100 text-gray-800 border border-gray-200';
      text = role || 'User';
  }

  return <Badge color={color} icon={UserCircle} delay={0.1}>{text}</Badge>;
};

const SectionBadge = ({ section }) => {
  if (!section || section === 'all') return null;
  
  // Get a css class for the color based on section
  const baseBgColor = getSectionColor(section).replace('bg-', '');
  // Create custom color variations for the badge
  const color = `bg-${baseBgColor}/20 text-${baseBgColor}-800 border border-${baseBgColor}-300`;
  
  return (
    <Badge color={color} icon={Users} delay={0.2}>
      {section.toUpperCase()}
    </Badge>
  );
};

const BatchBadge = ({ batchName }) => {
  if (!batchName) return null;
  
  // Similar color extraction as section but with different base color
  const baseBgColor = getBatchColor(batchName).replace('bg-', '');
  const color = `bg-${baseBgColor}/20 text-${baseBgColor}-800 border border-${baseBgColor}-300`;
  
  return (
    <Badge color={color} icon={BookOpen} delay={0.3}>
      {batchName}
    </Badge>
  );
};

const AnnouncementBadges = ({ announcement }) => {
  if (!announcement) return null;

  return (
    <div className="flex flex-wrap mt-2">
      {announcement.user?.role && (
        <RoleBadge role={announcement.user.role} />
      )}
      
      {announcement.section && (
        <SectionBadge section={announcement.section} />
      )}
      
      {announcement.batchName && (
        <BatchBadge batchName={announcement.batchName} />
      )}
    </div>
  );
};

export default AnnouncementBadges;
