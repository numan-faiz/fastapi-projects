import React, { useState, useEffect } from 'react';
import { FiBook, FiCalendar, FiTrendingUp, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import LoadingSpinner from '../common/LoadingSpinner';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const data = await attendanceService.getMyAttendance();
      setAttendance(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const leave = attendance.filter(a => a.status === 'leave').length;

    return {
      total,
      present,
      absent,
      leave,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  };

  const stats = calculateStats();

  if (loading) return <LoadingSpinner size="large" />;

  const enrolledSubjects = user?.enrolled_subjects || [];

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white shadow-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Student Dashboard</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || 'Student'}!
          </h2>
          <p className="text-gray-600 mt-2">Here's your learning progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Enrolled Subjects</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{enrolledSubjects.length}</p>
              </div>
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                <FiBook className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Classes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center">
                <FiCalendar className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Attendance Rate</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.percentage}%</p>
              </div>
              <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
                <FiTrendingUp className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Classes Missed</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.absent}</p>
              </div>
              <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center">
                <FiCalendar className="w-7 h-7 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled Subjects */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">My Subjects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledSubjects.map((subject) => (
              <div key={subject.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                    <FiBook className="w-6 h-6 text-white" />
                  </div>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{subject.name}</h4>
                <p className="text-gray-600 text-sm mb-4">
                  {subject.description || 'No description available'}
                </p>
                {subject.teachers && subject.teachers.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiUser className="w-4 h-4" />
                    <span>Teacher: {subject.teachers[0].name}</span>
                  </div>
                )}
              </div>
            ))}
            {enrolledSubjects.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                No subjects enrolled yet. Contact admin to get enrolled.
              </div>
            )}
          </div>
        </div>

        {/* Recent Attendance */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Attendance</h3>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Subject</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.slice(0, 5).map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6 text-gray-600">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-900">
                      {record.subject?.name || 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          record.status === 'present'
                            ? 'bg-green-100 text-green-700'
                            : record.status === 'absent'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
                {attendance.length === 0 && (
                  <tr>
                    <td colSpan="3" className="py-12 text-center text-gray-500">
                      No attendance records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
