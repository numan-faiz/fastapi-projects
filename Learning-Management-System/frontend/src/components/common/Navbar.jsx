import React from 'react';
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ title, onMenuClick, isMenuOpen }) => {
  const { user, logout, getRole } = useAuth();
  const role = getRole();

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button>
        <h1 className="text-xl font-bold text-primary">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="font-semibold text-gray-900">{user?.name || 'User'}</p>
            <p className="text-sm text-gray-500 capitalize">{role || 'Student'}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Logout"
        >
          <FiLogOut className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
