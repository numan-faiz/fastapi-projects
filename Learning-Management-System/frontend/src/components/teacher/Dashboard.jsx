import React, { useState, useEffect } from 'react';
import { FiBook, FiUsers, FiCalendar, FiCheckCircle } from 'react-icons/fi';
import { subjectService } from '../../services/subjectService';
import LoadingSpinner from '../common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await subjectService.getMySubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="large" />;

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white shadow-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Teacher Dashboard</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">My Subjects</h2>
          <p className="text-gray-600 mt-2">Manage your assigned subjects and mark attendance</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Subjects</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{subjects.length}</p>
              </div>
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                <FiBook className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {subjects.reduce((acc, s) => acc + (s.students?.length || 0), 0)}
                </p>
              </div>
              <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
                <FiUsers className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Today's Classes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{subjects.length}</p>
              </div>
              <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center">
                <FiCalendar className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Subject Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <div key={subject.subject_name} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                  <FiBook className="w-6 h-6 text-white" />
                </div>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {subject.students?.length || 0} Students
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{subject.subject_name}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {subject.students?.length || 0} students enrolled
              </p>
              <button
                onClick={() => navigate('/teacher/mark-attendance')}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <FiCheckCircle className="w-5 h-5" />
                Mark Attendance
              </button>
            </div>
          ))}
          {subjects.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
              No subjects assigned to you yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
