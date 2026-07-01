import React, { useState, useEffect } from 'react';
import { FiCalendar, FiFilter } from 'react-icons/fi';
import { attendanceService } from '../../services/attendanceService';
import { subjectService } from '../../services/subjectService';
import { userService } from '../../services/userService';
import LoadingSpinner from '../common/LoadingSpinner';
import Sidebar from '../common/Sidebar';

const AttendanceReport = () => {
  const [attendance, setAttendance] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null); // null = all subjects
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filters, setFilters] = useState({
    student_id: '',
  });

  useEffect(() => {
    fetchData();
  }, [selectedSubject, filters, selectedDate]);

  const fetchData = async () => {
    try {
      // Filter out empty string values and add date
      const filteredParams = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      
      // Add selected date to params
      if (selectedDate) {
        filteredParams.date = selectedDate;
      }
      
      // Add selected subject to params
      if (selectedSubject) {
        filteredParams.subject_id = selectedSubject;
      }
      
      const [attendanceData, subjectsData, studentsData] = await Promise.all([
        attendanceService.getAttendanceReport(filteredParams),
        subjectService.getSubjects(),
        userService.getStudents(),
      ]);
      setAttendance(attendanceData);
      setSubjects(subjectsData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (subjectId) => {
    setSelectedSubject(subjectId);
  };

  const getAttendanceCountForSubject = (subjectId) => {
    if (subjectId === null) {
      return attendance.length;
    }
    return attendance.filter(a => a.subject_id === subjectId).length;
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
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Attendance Report</h1>
        <p className="text-gray-600 mt-2">View and filter attendance records</p>
      </div>

      {/* Subject Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSubjectChange(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedSubject === null
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Subjects ({attendance.length})
          </button>
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => handleSubjectChange(subject.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedSubject === subject.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {subject.name} ({getAttendanceCountForSubject(subject.id)})
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
            <select
              value={filters.student_id}
              onChange={(e) => setFilters({ ...filters, student_id: e.target.value })}
              className="input-field"
            >
              <option value="">All Students</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
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
                  No attendance records found for {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'the selected date'}
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

export default AttendanceReport;
