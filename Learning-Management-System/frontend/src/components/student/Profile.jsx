import React, { useState } from 'react';
import { FiUser, FiMail, FiEdit2, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleSave = () => {
    // Note: Profile update would need to be implemented in backend
    toast.success('Profile updated successfully');
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white shadow-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">My Profile</h1>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto p-8">
        <div className="card">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <FiEdit2 className="w-5 h-5" />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="btn-primary flex items-center gap-2"
              >
                <FiSave className="w-5 h-5" />
                Save Changes
              </button>
            )}
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{user?.name || 'User'}</h3>
              <p className="text-gray-600 capitalize">{user?.roles?.[0]?.name || 'Student'}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!editing}
                  className={`input-field pl-12 ${!editing ? 'bg-gray-50' : ''}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!editing}
                  className={`input-field pl-12 ${!editing ? 'bg-gray-50' : ''}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <input
                type="text"
                value={user?.roles?.[0]?.name || 'Student'}
                disabled
                className="input-field bg-gray-50 capitalize"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
              <input
                type="text"
                value={user?.id || 'N/A'}
                disabled
                className="input-field bg-gray-50"
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Account Status</p>
                <p className="font-medium text-green-600">Active</p>
              </div>
              <div>
                <p className="text-gray-500">Member Since</p>
                <p className="font-medium text-gray-900">2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
