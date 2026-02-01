import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { studentsAPI, facultyAPI, attendanceAPI, marksAPI, departmentsAPI } from '../services/api';
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Award,
  Building,
  TrendingUp,
  Activity,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const responses = await Promise.all([
        studentsAPI.getAll(),
        facultyAPI.getAll(),
        departmentsAPI.getAll(),
        attendanceAPI.getReport(),
        marksAPI.getReport(),
      ]);

      const studentsData = responses[0].data.success ? responses[0].data.data : [];
      const facultyData = responses[1].data.success ? responses[1].data.data : [];
      const departmentsData = responses[2].data.success ? responses[2].data.data : [];
      const attendanceData = responses[3].data.success ? responses[3].data.data : {};
      const marksData = responses[4].data.success ? responses[4].data.data : {};

      setStats({
        totalStudents: studentsData.length,
        totalFaculty: facultyData.length,
        totalDepartments: departmentsData.length,
        attendanceRate: attendanceData.attendance_percentage || 0,
        averageMarks: marksData.percentage || 0,
        activeStudents: studentsData.filter(s => s.status === 'active').length,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRoleSpecificStats = () => {
    switch (user?.role) {
      case 'admin':
        return [
          {
            title: 'Total Students',
            value: stats.totalStudents || 0,
            icon: Users,
            color: 'bg-blue-500',
            change: '+12%',
            changeType: 'increase',
          },
          {
            title: 'Total Faculty',
            value: stats.totalFaculty || 0,
            icon: GraduationCap,
            color: 'bg-green-500',
            change: '+5%',
            changeType: 'increase',
          },
          {
            title: 'Departments',
            value: stats.totalDepartments || 0,
            icon: Building,
            color: 'bg-purple-500',
            change: '0%',
            changeType: 'neutral',
          },
          {
            title: 'Active Students',
            value: stats.activeStudents || 0,
            icon: Activity,
            color: 'bg-orange-500',
            change: '+8%',
            changeType: 'increase',
          },
        ];
      case 'faculty':
        return [
          {
            title: 'My Subjects',
            value: '6',
            icon: BookOpen,
            color: 'bg-blue-500',
            change: '+2',
            changeType: 'increase',
          },
          {
            title: 'Classes Today',
            value: '4',
            icon: Calendar,
            color: 'bg-green-500',
            change: '0',
            changeType: 'neutral',
          },
          {
            title: 'Total Students',
            value: '120',
            icon: Users,
            color: 'bg-purple-500',
            change: '+15',
            changeType: 'increase',
          },
          {
            title: 'Avg Attendance',
            value: `${stats.attendanceRate || 0}%`,
            icon: TrendingUp,
            color: 'bg-orange-500',
            change: '+3%',
            changeType: 'increase',
          },
        ];
      case 'student':
        return [
          {
            title: 'My Attendance',
            value: `${stats.attendanceRate || 0}%`,
            icon: Calendar,
            color: 'bg-blue-500',
            change: '+2%',
            changeType: 'increase',
          },
          {
            title: 'Average Marks',
            value: `${stats.averageMarks || 0}%`,
            icon: Award,
            color: 'bg-green-500',
            change: '+5%',
            changeType: 'increase',
          },
          {
            title: 'Subjects',
            value: '8',
            icon: BookOpen,
            color: 'bg-purple-500',
            change: '0',
            changeType: 'neutral',
          },
          {
            title: 'Current Semester',
            value: user?.details?.semester || '3',
            icon: GraduationCap,
            color: 'bg-orange-500',
            change: 'Current',
            changeType: 'neutral',
          },
        ];
      default:
        return [];
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change, changeType }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-secondary-600">{title}</p>
          <p className="text-2xl font-semibold text-secondary-900 mt-1">{value}</p>
          <div className="flex items-center mt-2">
            {changeType === 'increase' && (
              <span className="text-green-600 text-sm font-medium">{change}</span>
            )}
            {changeType === 'decrease' && (
              <span className="text-red-600 text-sm font-medium">{change}</span>
            )}
            {changeType === 'neutral' && (
              <span className="text-secondary-500 text-sm font-medium">{change}</span>
            )}
          </div>
        </div>
        <div className={`${color} rounded-lg p-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {getWelcomeMessage()}, {user?.details?.first_name || user?.username}!
        </h1>
        <p className="text-primary-100">
          Welcome back to the Medical College Management System
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getRoleSpecificStats().map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {user?.role === 'admin' && (
            <>
              <button className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors text-left">
                <Users className="h-8 w-8 text-blue-500 mb-2" />
                <h3 className="font-medium text-secondary-900">Add Student</h3>
                <p className="text-sm text-secondary-500">Register a new student</p>
              </button>
              <button className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors text-left">
                <GraduationCap className="h-8 w-8 text-green-500 mb-2" />
                <h3 className="font-medium text-secondary-900">Add Faculty</h3>
                <p className="text-sm text-secondary-500">Hire new faculty member</p>
              </button>
              <button className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors text-left">
                <BookOpen className="h-8 w-8 text-purple-500 mb-2" />
                <h3 className="font-medium text-secondary-900">Create Subject</h3>
                <p className="text-sm text-secondary-500">Add new subject</p>
              </button>
            </>
          )}
          {user?.role === 'faculty' && (
            <>
              <button className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors text-left">
                <Calendar className="h-8 w-8 text-blue-500 mb-2" />
                <h3 className="font-medium text-secondary-900">Mark Attendance</h3>
                <p className="text-sm text-secondary-500">Take class attendance</p>
              </button>
              <button className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors text-left">
                <Award className="h-8 w-8 text-green-500 mb-2" />
                <h3 className="font-medium text-secondary-900">Add Marks</h3>
                <p className="text-sm text-secondary-500">Enter exam results</p>
              </button>
              <button className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors text-left">
                <BookOpen className="h-8 w-8 text-purple-500 mb-2" />
                <h3 className="font-medium text-secondary-900">View Subjects</h3>
                <p className="text-sm text-secondary-500">Manage your subjects</p>
              </button>
            </>
          )}
          {user?.role === 'student' && (
            <>
              <button className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors text-left">
                <Calendar className="h-8 w-8 text-blue-500 mb-2" />
                <h3 className="font-medium text-secondary-900">View Attendance</h3>
                <p className="text-sm text-secondary-500">Check your attendance</p>
              </button>
              <button className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors text-left">
                <Award className="h-8 w-8 text-green-500 mb-2" />
                <h3 className="font-medium text-secondary-900">View Marks</h3>
                <p className="text-sm text-secondary-500">Check your results</p>
              </button>
              <button className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors text-left">
                <BookOpen className="h-8 w-8 text-purple-500 mb-2" />
                <h3 className="font-medium text-secondary-900">Subjects</h3>
                <p className="text-sm text-secondary-500">View your subjects</p>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
