import React, { useState, useEffect } from 'react';
import { FiUsers, FiBook, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { subjectService } from '../../services/subjectService';
import { attendanceService } from '../../services/attendanceService';
import { activityLogService } from '../../services/activityLogService';
import LoadingSpinner from '../common/LoadingSpinner';
import Sidebar from '../common/Sidebar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    teachers: 0,
    students: 0,
    subjects: 0,
    attendanceRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teachers, students, subjects, activityData] = await Promise.all([
        userService.getTeachers(),
        userService.getStudents(),
        subjectService.getSubjects(),
        activityLogService.getActivityLogs(10),
      ]);

      setStats({
        teachers: teachers.length,
        students: students.length,
        subjects: subjects.length,
        attendanceRate: 85, // Placeholder - calculate from actual attendance
      });
      setActivities(activityData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getActivityIcon = (entityType) => {
    switch (entityType) {
      case 'teacher':
        return FiUsers;
      case 'student':
        return FiUsers;
      case 'subject':
        return FiBook;
      case 'attendance':
        return FiCalendar;
      default:
        return FiTrendingUp;
    }
  };

  const getActivityColor = (entityType) => {
    switch (entityType) {
      case 'teacher':
        return 'bg-blue-100 text-blue-600';
      case 'student':
        return 'bg-green-100 text-green-600';
      case 'subject':
        return 'bg-purple-100 text-purple-600';
      case 'attendance':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" />;
  }

  const statCards = [
    {
      title: 'Total Teachers',
      value: stats.teachers,
      icon: FiUsers,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Students',
      value: stats.students,
      icon: FiUsers,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Subjects',
      value: stats.subjects,
      icon: FiBook,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Attendance Rate',
      value: `${stats.attendanceRate}%`,
      icon: FiTrendingUp,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-7 h-7 ${stat.textColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/admin/teachers')}
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-left cursor-pointer"
              >
                <FiUsers className="w-6 h-6 text-blue-600 mb-2" />
                <p className="font-medium text-gray-900">Add Teacher</p>
              </button>
              <button 
                onClick={() => navigate('/admin/students')}
                className="p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors text-left cursor-pointer"
              >
                <FiUsers className="w-6 h-6 text-green-600 mb-2" />
                <p className="font-medium text-gray-900">Add Student</p>
              </button>
              <button 
                onClick={() => navigate('/admin/subjects')}
                className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-left cursor-pointer"
              >
                <FiBook className="w-6 h-6 text-purple-600 mb-2" />
                <p className="font-medium text-gray-900">Add Subject</p>
              </button>
              <button 
                onClick={() => navigate('/admin/attendance')}
                className="p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors text-left cursor-pointer"
              >
                <FiCalendar className="w-6 h-6 text-orange-600 mb-2" />
                <p className="font-medium text-gray-900">View Attendance</p>
              </button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            {activities.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent activity available.</p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => {
                  const Icon = getActivityIcon(activity.entity_type);
                  return (
                    <div key={activity.id} className="flex items-center gap-4">
                      <div className={`w-10 h-10 ${getActivityColor(activity.entity_type)} rounded-full flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.description}</p>
                        <p className="text-sm text-gray-500">
                          {formatRelativeTime(activity.created_at)}
                          {activity.user_name && ` • by ${activity.user_name}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
