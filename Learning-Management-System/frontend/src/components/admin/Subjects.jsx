import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUserPlus, FiUsers } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { subjectService } from '../../services/subjectService';
import { userService } from '../../services/userService';
import LoadingSpinner from '../common/LoadingSpinner';
import Sidebar from '../common/Sidebar';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [assignType, setAssignType] = useState('teacher'); // 'teacher' or 'student'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjectsData, teachersData, studentsData] = await Promise.all([
        subjectService.getSubjects(),
        userService.getTeachers(),
        userService.getStudents(),
      ]);
      setSubjects(subjectsData);
      setTeachers(teachersData);
      setStudents(studentsData);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await subjectService.updateSubject(editingSubject.id, formData);
        toast.success('Subject updated successfully');
      } else {
        await subjectService.createSubject(formData);
        toast.success('Subject created successfully');
      }
      setShowModal(false);
      setEditingSubject(null);
      setFormData({ name: '', description: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    
    try {
      await subjectService.deleteSubject(id);
      toast.success('Subject deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete subject');
    }
  };

  const handleAssign = (subject, type) => {
    setSelectedSubject(subject);
    setAssignType(type);
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e, userId) => {
    e.preventDefault();
    try {
      if (assignType === 'teacher') {
        await subjectService.assignTeacher(selectedSubject.id, userId);
        toast.success('Teacher assigned successfully');
      } else {
        await subjectService.assignStudent(selectedSubject.id, userId);
        toast.success('Student enrolled successfully');
      }
      setShowAssignModal(false);
      setSelectedSubject(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleRemove = async (subject, userId, type) => {
    if (!window.confirm(`Are you sure you want to remove this ${type}?`)) return;
    
    try {
      if (type === 'teacher') {
        await subjectService.removeTeacher(subject.id, userId);
        toast.success('Teacher removed successfully');
      } else {
        await subjectService.removeStudent(subject.id, userId);
        toast.success('Student removed successfully');
      }
      fetchData();
    } catch (error) {
      toast.error('Failed to remove');
    }
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner size="large" />;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-600 mt-2">Manage all subjects and assignments</p>
        </div>
        <button
          onClick={() => {
            setEditingSubject(null);
            setFormData({ name: '', description: '' });
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          Add Subject
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12"
          />
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subject) => (
          <div key={subject.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">{subject.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{subject.description || 'No description'}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(subject)}
                  className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <FiEdit2 className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => handleDelete(subject.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <FiTrash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>

            {/* Teachers */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Teachers</span>
                <button
                  onClick={() => handleAssign(subject, 'teacher')}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <FiUserPlus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {subject.teachers?.map((teacher) => (
                  <div key={teacher.id} className="flex items-center justify-between bg-blue-50 p-2 rounded-lg">
                    <span className="text-sm text-gray-700">{teacher.name}</span>
                    <button
                      onClick={() => handleRemove(subject, teacher.id, 'teacher')}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {(!subject.teachers || subject.teachers.length === 0) && (
                  <p className="text-sm text-gray-400 italic">No teachers assigned</p>
                )}
              </div>
            </div>

            {/* Students */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Students</span>
                <button
                  onClick={() => handleAssign(subject, 'student')}
                  className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                >
                  <FiUsers className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {subject.students?.slice(0, 3).map((student) => (
                  <div key={student.id} className="flex items-center justify-between bg-green-50 p-2 rounded-lg">
                    <span className="text-sm text-gray-700">{student.name}</span>
                    <button
                      onClick={() => handleRemove(subject, student.id, 'student')}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {subject.students?.length > 3 && (
                  <p className="text-sm text-gray-500">+{subject.students.length - 3} more</p>
                )}
                {(!subject.students || subject.students.length === 0) && (
                  <p className="text-sm text-gray-400 italic">No students enrolled</p>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredSubjects.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            No subjects found
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
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
                  {editingSubject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {assignType === 'teacher' ? 'Assign Teacher' : 'Enroll Student'}
            </h2>
            <p className="text-gray-600 mb-4">Subject: {selectedSubject.name}</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(assignType === 'teacher' ? teachers : students).map((user) => (
                <button
                  key={user.id}
                  onClick={(e) => handleAssignSubmit(e, user.id)}
                  className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAssignModal(false)}
              className="w-full mt-4 btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Subjects;
