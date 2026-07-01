import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { userService } from '../../services/userService';
import { subjectService } from '../../services/subjectService';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import Sidebar from '../common/Sidebar';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null); // null = all students
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsData, subjectsData] = await Promise.all([
        userService.getStudents(),
        subjectService.getSubjects(),
      ]);
      setStudents(studentsData);
      setSubjects(subjectsData);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsBySubject = async (subjectId) => {
    try {
      const data = await api.get(`/student/by-subject/${subjectId}`);
      return data.data;
    } catch (error) {
      toast.error('Failed to fetch students for this subject');
      return [];
    }
  };

  const handleSubjectChange = async (subjectId) => {
    setSelectedSubject(subjectId);
    if (subjectId === null) {
      // Show all students
      const data = await userService.getStudents();
      setStudents(data);
    } else {
      // Show students for selected subject
      const data = await fetchStudentsBySubject(subjectId);
      setStudents(data);
    }
  };

  const getStudentCountForSubject = (subjectId) => {
    if (subjectId === null) {
      return students.length;
    }
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.students?.length || 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await userService.updateStudent(editingStudent.id, formData);
        toast.success('Student updated successfully');
      } else {
        await userService.createStudent(formData);
        toast.success('Student created successfully');
      }
      setShowModal(false);
      setEditingStudent(null);
      setFormData({ name: '', email: '', password: '' });
      // Refresh the current view
      if (selectedSubject === null) {
        const data = await userService.getStudents();
        setStudents(data);
      } else {
        const data = await fetchStudentsBySubject(selectedSubject);
        setStudents(data);
      }
      // Also refresh subjects to update counts
      const subjectsData = await subjectService.getSubjects();
      setSubjects(subjectsData);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      password: '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    try {
      await userService.deleteStudent(id);
      toast.success('Student deleted successfully');
      // Refresh the current view
      if (selectedSubject === null) {
        const data = await userService.getStudents();
        setStudents(data);
      } else {
        const data = await fetchStudentsBySubject(selectedSubject);
        setStudents(data);
      }
      // Also refresh subjects to update counts
      const subjectsData = await subjectService.getSubjects();
      setSubjects(subjectsData);
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner size="large" />;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-2">Manage all students in the system</p>
        </div>
        <button
          onClick={() => {
            setEditingStudent(null);
            setFormData({ name: '', email: '', password: '' });
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          Add Student
        </button>
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
            All Students ({students.length})
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
              {subject.name} ({subject.students?.length || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-6 font-semibold text-gray-700">Name</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700">Email</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700">Enrolled Subjects</th>
              <th className="text-right py-4 px-6 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                      {student.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900">{student.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-600">{student.email}</td>
                <td className="py-4 px-6">
                  <div className="flex flex-wrap gap-1">
                    {student.enrolled_subjects?.length > 0 ? (
                      student.enrolled_subjects.map((subject) => (
                        <span key={subject.id} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                          {subject.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">No subjects</span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(student)}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FiEdit2 className="w-5 h-5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan="4" className="py-12 text-center text-gray-500">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password {editingStudent && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingStudent}
                  className="input-field"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingStudent ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Students;
