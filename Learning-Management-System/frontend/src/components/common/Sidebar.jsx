import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiBook, 
  FiCalendar, 
  FiSettings,
  FiLogOut,
  FiBell
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { logout, getRole } = useAuth();
  const location = useLocation();
  const role = getRole();

  const adminNavItems = [
    { path: '/admin/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/admin/students', icon: FiUsers, label: 'Students' },
    { path: '/admin/teachers', icon: FiUsers, label: 'Teachers' },
    { path: '/admin/subjects', icon: FiBook, label: 'Subjects' },
    { path: '/admin/attendance', icon: FiCalendar, label: 'Attendance Report' },
    { path: '/admin/notifications', icon: FiBell, label: 'Notifications' },
    { path: '/admin/settings', icon: FiSettings, label: 'Settings' },
  ];

  const teacherNavItems = [
    { path: '/teacher/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/teacher/subjects', icon: FiBook, label: 'My Subjects' },
    { path: '/teacher/mark-attendance', icon: FiCalendar, label: 'Mark Attendance' },
    { path: '/teacher/history', icon: FiCalendar, label: 'History' },
    { path: '/teacher/student-assignment', icon: FiUsers, label: 'Student Assignment' },
    { path: '/admin/settings', icon: FiSettings, label: 'Settings' },
  ];

  const studentNavItems = [
    { path: '/student/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/student/subjects', icon: FiBook, label: 'My Subjects' },
    { path: '/student/attendance', icon: FiCalendar, label: 'Attendance History' },
    { path: '/student/profile', icon: FiSettings, label: 'Profile' },
    { path: '/admin/settings', icon: FiSettings, label: 'Settings' },
  ];

  const navItems = role === 'admin' ? adminNavItems : role === 'teacher' ? teacherNavItems : studentNavItems;

  return (
    <div className="w-64 bg-primary min-h-screen fixed left-0 top-0 text-white">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold">Akhuwat FIRST</h1>
        <p className="text-sm text-gray-300 mt-1">Learning Management System</p>
      </div>

      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-secondary text-white' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200"
        >
          <FiLogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
