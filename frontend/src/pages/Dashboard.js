import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { studentsAPI, facultyAPI, attendanceAPI, marksAPI, departmentsAPI, batchesAPI, subjectsAPI } from '../services/api';
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
      console.log('Fetching dashboard stats...');
      const responses = await Promise.all([
        studentsAPI.getAll(),
        facultyAPI.getAll(),
        departmentsAPI.getAll(),
        batchesAPI.getAll(),
        subjectsAPI.getAll(),
        attendanceAPI.getReport(),
        marksAPI.getReport(),
      ]);

      console.log('Dashboard API responses:', responses);

      const studentsData = responses[0].data || [];
      const facultyData = responses[1].data || [];
      const departmentsData = responses[2].data || [];
      const batchesData = responses[3].data || [];
      const subjectsData = responses[4].data || [];
      const attendanceData = responses[5].data || {};
      const marksData = responses[6].data || {};

      console.log('Dashboard processed data:', {
        studentsData,
        facultyData,
        departmentsData,
        batchesData,
        subjectsData,
        attendanceData,
        marksData
      });

      setStats({
        totalStudents: studentsData.length,
        totalFaculty: facultyData.length,
        totalDepartments: departmentsData.length,
        totalBatches: batchesData.length,
        totalSubjects: subjectsData.length,
        attendanceRate: attendanceData.attendance_percentage || 0,
        averageMarks: marksData.percentage || 0,
        activeStudents: studentsData.filter(s => s.status === 'active').length,
        totalAttendance: attendanceData.total_records || 0,
        totalMarks: marksData.total_records || 0,
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
            change: 'Active',
            changeType: 'neutral',
          },
          {
            title: 'Batches',
            value: stats.totalBatches || 0,
            icon: Calendar,
            color: 'bg-indigo-500',
            change: 'Total',
            changeType: 'neutral',
          },
          {
            title: 'Subjects',
            value: stats.totalSubjects || 0,
            icon: BookOpen,
            color: 'bg-pink-500',
            change: 'Available',
            changeType: 'neutral',
          },
          {
            title: 'Attendance Rate',
            value: `${stats.attendanceRate || 0}%`,
            icon: Activity,
            color: 'bg-orange-500',
            change: '+3%',
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
    <div className="bg-white rounded shadow-sm hover:shadow transition-shadow duration-300 p-1.5 border border-secondary-100">
      <div className="flex items-center justify-between mb-1">
        <div className={`${color} rounded p-0.5 shadow-sm`}>
          <Icon className="h-2.5 w-2.5 text-white" />
        </div>
        <div className="text-right">
          {changeType === 'increase' && (
            <span className="inline-flex items-center px-0.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <TrendingUp className="h-1.5 w-1.5 mr-0.5" />
              {change}
            </span>
          )}
          {changeType === 'decrease' && (
            <span className="inline-flex items-center px-0.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <TrendingUp className="h-1.5 w-1.5 mr-0.5 rotate-180" />
              {change}
            </span>
          )}
          {changeType === 'neutral' && (
            <span className="inline-flex items-center px-0.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {change}
            </span>
          )}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-secondary-600 mb-0.5">{title}</p>
        <p className="text-xs font-bold text-secondary-900">{value}</p>
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
    <div className="min-h-screen bg-gray-50">
      <div className="px-1 sm:px-2 lg:px-3">
        {/* Welcome Section - Minimal */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded shadow p-2 text-white mb-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base sm:text-lg font-bold">
                {getWelcomeMessage()}, {user?.details?.first_name || user?.username}!
              </h1>
              <p className="text-primary-100 text-xs">
                Medical College Management System
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded px-2 py-1">
              <p className="text-xs font-medium capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Single Row Stats - Full Width */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1 mb-2">
          {getRoleSpecificStats().map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Quick Actions - Full Width Compact */}
        <div className="bg-white rounded shadow p-2">
          <h2 className="text-xs font-bold text-secondary-900 mb-1">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
            {user?.role === 'admin' && (
              <>
                <button className="group p-1.5 border border-secondary-200 rounded hover:bg-secondary-50 transition-all duration-200 text-left">
                  <div className="flex items-center">
                    <div className="bg-blue-100 group-hover:bg-blue-200 rounded p-0.5 transition-colors mr-1">
                      <Users className="h-3 w-3 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-secondary-900 text-xs">Add Student</h3>
                    </div>
                  </div>
                </button>
                <button className="group p-1.5 border border-secondary-200 rounded hover:bg-secondary-50 transition-all duration-200 text-left">
                  <div className="flex items-center">
                    <div className="bg-green-100 group-hover:bg-green-200 rounded p-0.5 transition-colors mr-1">
                      <GraduationCap className="h-3 w-3 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-secondary-900 text-xs">Add Faculty</h3>
                    </div>
                  </div>
                </button>
                <button className="group p-1.5 border border-secondary-200 rounded hover:bg-secondary-50 transition-all duration-200 text-left">
                  <div className="flex items-center">
                    <div className="bg-purple-100 group-hover:bg-purple-200 rounded p-0.5 transition-colors mr-1">
                      <Building className="h-3 w-3 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-secondary-900 text-xs">Departments</h3>
                    </div>
                  </div>
                </button>
                <button className="group p-1.5 border border-secondary-200 rounded hover:bg-secondary-50 transition-all duration-200 text-left">
                  <div className="flex items-center">
                    <div className="bg-indigo-100 group-hover:bg-indigo-200 rounded p-0.5 transition-colors mr-1">
                      <Calendar className="h-3 w-3 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-secondary-900 text-xs">Reports</h3>
                    </div>
                  </div>
                </button>
                <button className="group p-1.5 border border-secondary-200 rounded hover:bg-secondary-50 transition-all duration-200 text-left">
                  <div className="flex items-center">
                    <div className="bg-pink-100 group-hover:bg-pink-200 rounded p-0.5 transition-colors mr-1">
                      <BookOpen className="h-3 w-3 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-secondary-900 text-xs">Subjects</h3>
                    </div>
                  </div>
                </button>
                <button className="group p-1.5 border border-secondary-200 rounded hover:bg-secondary-50 transition-all duration-200 text-left">
                  <div className="flex items-center">
                    <div className="bg-orange-100 group-hover:bg-orange-200 rounded p-0.5 transition-colors mr-1">
                      <Activity className="h-3 w-3 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-secondary-900 text-xs">Attendance</h3>
                    </div>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
