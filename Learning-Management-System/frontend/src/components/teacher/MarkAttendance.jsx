import React, { useState, useEffect } from 'react';
import { FiCalendar, FiCheck, FiX, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { subjectService } from '../../services/subjectService';
import { attendanceService } from '../../services/attendanceService';
import LoadingSpinner from '../common/LoadingSpinner';

const MarkAttendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      setStudents(selectedSubject.students || []);
      // Initialize attendance as present for all students
      const initialAttendance = {};
      (selectedSubject.students || []).forEach(student => {
        initialAttendance[student.id] = 'present';
      });
      setAttendance(initialAttendance);
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const data = await subjectService.getMySubjects();
      setSubjects(data);
      if (data.length > 0) {
        setSelectedSubject(data[0]);
      }
    } catch (error) {
      toast.error('Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance({
      ...attendance,
      [studentId]: status,
    });
  };

  const handleSubmit = async () => {
    if (!selectedSubject) {
      toast.error('Please select a subject');
      return;
    }

    setSubmitting(true);
    try {
      const promises = students.map(student =>
        attendanceService.markAttendance({
          student_id: student.id,
          subject_id: selectedSubject.id,
          date: date,
          status: attendance[student.id],
        })
      );

      await Promise.all(promises);
      toast.success('Attendance marked successfully');
    } catch (error) {
      console.error('Attendance marking error:', error);
      toast.error(error.response?.data?.detail || 'Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner size="large" />;

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white shadow-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Mark Attendance</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
              <select
                value={selectedSubject?.subject_name || ''}
                onChange={(e) => {
                  const subject = subjects.find(s => s.subject_name === e.target.value);
                  setSelectedSubject(subject);
                }}
                className="input-field"
              >
                {subjects.map((subject) => (
                  <option key={subject.subject_name} value={subject.subject_name}>
                    {subject.subject_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <div className="relative">
                <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field pl-12"
                />
              </div>
            </div>
          </div>
        </div>

        {selectedSubject && students.length > 0 ? (
          <>
            <div className="card mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedSubject.subject_name}
                </h2>
                <span className="text-gray-600">{students.length} students</span>
              </div>

              <div className="space-y-3">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                        {student.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(student.id, 'present')}
                        className={`p-3 rounded-lg transition-all ${
                          attendance[student.id] === 'present'
                            ? 'bg-green-500 text-white shadow-lg'
                            : 'bg-white text-gray-400 hover:bg-green-100'
                        }`}
                        title="Present"
                      >
                        <FiCheck className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        className={`p-3 rounded-lg transition-all ${
                          attendance[student.id] === 'absent'
                            ? 'bg-red-500 text-white shadow-lg'
                            : 'bg-white text-gray-400 hover:bg-red-100'
                        }`}
                        title="Absent"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.id, 'leave')}
                        className={`p-3 rounded-lg transition-all ${
                          attendance[student.id] === 'leave'
                            ? 'bg-yellow-500 text-white shadow-lg'
                            : 'bg-white text-gray-400 hover:bg-yellow-100'
                        }`}
                        title="Leave"
                      >
                        <FiClock className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                'Submit Attendance'
              )}
            </button>
          </>
        ) : (
          <div className="card py-12 text-center text-gray-500">
            {selectedSubject ? 'No students enrolled in this subject' : 'Select a subject to continue'}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkAttendance;
