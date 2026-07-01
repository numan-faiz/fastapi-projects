import React, { useState, useEffect } from 'react';
import { FiUsers, FiPlus, FiX, FiCheck, FiUserPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import Sidebar from '../common/Sidebar';

const StudentAssignment = () => {
  const [mySubjects, setMySubjects] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjectsData, studentsData] = await Promise.all([
        api.get('/subject/my-subjects'),
        api.get('/student/all'),
      ]);
      setMySubjects(subjectsData.data);
      setAllStudents(studentsData.data);
      if (subjectsData.data.length > 0) {
        setSelectedSubject(subjectsData.data[0]);
        setAssignedStudents(subjectsData.data[0].students || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (subjectId) => {
    const subject = mySubjects.find(s => s.id === parseInt(subjectId));
    setSelectedSubject(subject);
    setAssignedStudents(subject?.students || []);
  };

  const handleAssignStudent = async (studentId) => {
    if (!selectedSubject) {
      toast.error('Please select a subject first');
      return;
    }

    setAssigning(true);
    try {
      await api.post(`/subject/${selectedSubject.id}/student/${studentId}`);
      toast.success('Student assigned successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to assign student');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!selectedSubject) {
      toast.error('Please select a subject first');
      return;
    }

    setAssigning(true);
    try {
      await api.delete(`/subject/${selectedSubject.id}/student/${studentId}`);
      toast.success('Student removed successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to remove student');
    } finally {
      setAssigning(false);
    }
  };

  const getUnassignedStudents = () => {
    if (!selectedSubject) return [];
    const assignedIds = assignedStudents.map(s => s.id);
    return allStudents.filter(s => !assignedIds.includes(s.id));
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!selectedSubject) {
      toast.error('Please select a subject first');
      return;
    }

    setAssigning(true);
    try {
      // Create the student
      const response = await api.post('/student/', newStudent);
      const createdStudent = response.data;
      
      // Automatically assign to the selected subject
      await api.post(`/subject/${selectedSubject.id}/student/${createdStudent.id}`);
      
      toast.success('Student created and assigned successfully');
      setShowCreateModal(false);
      setNewStudent({ name: '', email: '', password: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create student');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <LoadingSpinner size="large" />;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Assignment</h1>
          <p className="text-gray-600 mt-2">Manage students for your assigned subjects</p>
        </div>

        {mySubjects.length === 0 ? (
          <div className="card text-center py-12">
            <FiUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Subjects Assigned</h3>
            <p className="text-gray-600">You haven't been assigned to any subjects yet. Please contact the administrator.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Subject Selection */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <FiUsers className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-gray-900">Select Subject</h2>
              </div>
              <select
                value={selectedSubject?.id || ''}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="input-field"
              >
                {mySubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.subject_name}
                  </option>
                ))}
              </select>
            </div>

            {selectedSubject && (
              <>
                {/* Assigned Students */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <FiCheck className="w-6 h-6 text-green-600" />
                      <h2 className="text-xl font-semibold text-gray-900">
                        Assigned Students ({assignedStudents.length})
                      </h2>
                    </div>
                  </div>
                  {assignedStudents.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No students assigned to this subject</p>
                  ) : (
                    <div className="space-y-3">
                      {assignedStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-600">{student.email}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveStudent(student.id)}
                            disabled={assigning}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Remove student"
                          >
                            <FiX className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Available Students */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <FiPlus className="w-6 h-6 text-primary" />
                      <h2 className="text-xl font-semibold text-gray-900">
                        Available Students ({getUnassignedStudents().length})
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <FiUserPlus className="w-5 h-5" />
                      Add New Student
                    </button>
                  </div>
                  {getUnassignedStudents().length === 0 ? (
                    <p className="text-gray-500 text-center py-8">All students are already assigned to this subject</p>
                  ) : (
                    <div className="space-y-3">
                      {getUnassignedStudents().map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-600">{student.email}</p>
                          </div>
                          <button
                            onClick={() => handleAssignStudent(student.id)}
                            disabled={assigning}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Assign student"
                          >
                            <FiPlus className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Create Student Modal */}
                {showCreateModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">Add New Student</h3>
                        <button
                          onClick={() => setShowCreateModal(false)}
                          className="p-2 text-gray-500 hover:text-gray-700"
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                      </div>
                      <form onSubmit={handleCreateStudent} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                          <input
                            type="text"
                            value={newStudent.name}
                            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                            required
                            className="input-field"
                            placeholder="Enter student name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={newStudent.email}
                            onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                            required
                            className="input-field"
                            placeholder="Enter student email"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                          <input
                            type="password"
                            value={newStudent.password}
                            onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                            required
                            minLength={8}
                            className="input-field"
                            placeholder="Enter password (min 8 characters)"
                          />
                        </div>
                        <div className="flex gap-3 pt-4">
                          <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={assigning}
                            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {assigning ? 'Creating...' : 'Create & Assign'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAssignment;
