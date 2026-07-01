import React, { useState, useEffect } from 'react';
import { FiCalendar, FiFilter } from 'react-icons/fi';
import { attendanceService } from '../../services/attendanceService';
import { subjectService } from '../../services/subjectService';
import LoadingSpinner from '../common/LoadingSpinner';

const AttendanceHistory = () => {
  const [attendance, setAttendance] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    subject_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      const [attendanceData, subjectsData] = await Promise.all([
        attendanceService.getAttendanceReport(filters),
        subjectService.getMySubjects(),
      ]);
      setAttendance(attendanceData);
      setSubjects(subjectsData);
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

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white shadow-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Attendance History</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        {/* Filters */}
        <div className="card mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FiFilter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={filters.subject_id}
                onChange={(e) => setFilters({ ...filters, subject_id: e.target.value })}
                className="input-field"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject.subject_name} value={subject.subject_id}>
                    {subject.subject_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select
                value={filters.month}
                onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
                className="input-field"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
                className="input-field"
              >
                {[2024, 2025, 2026].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <p className="text-gray-500 text-sm font-medium">Total Records</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          <div className="stat-card">
            <p className="text-gray-500 text-sm font-medium">Present</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.present}</p>
          </div>
          <div className="stat-card">
            <p className="text-gray-500 text-sm font-medium">Absent</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.absent}</p>
          </div>
          <div className="stat-card">
            <p className="text-gray-500 text-sm font-medium">Attendance Rate</p>
            <p className="text-3xl font-bold text-primary mt-2">{stats.percentage}%</p>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Student</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Subject</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 text-gray-600">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 font-medium text-gray-900">
                    {record.student?.name || 'N/A'}
                  </td>
                  <td className="py-4 px-6 text-gray-600">
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
                  <td colSpan="4" className="py-12 text-center text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;
