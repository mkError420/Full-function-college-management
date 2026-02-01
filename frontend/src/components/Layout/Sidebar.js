import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Award,
  Building,
  User,
  Layers,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'faculty', 'student'],
    },
    {
      name: 'Students',
      href: '/students',
      icon: Users,
      roles: ['admin', 'faculty'],
    },
    {
      name: 'Faculty',
      href: '/faculty',
      icon: GraduationCap,
      roles: ['admin'],
    },
    {
      name: 'Subjects',
      href: '/subjects',
      icon: BookOpen,
      roles: ['admin', 'faculty', 'student'],
    },
    {
      name: 'Attendance',
      href: '/attendance',
      icon: Calendar,
      roles: ['admin', 'faculty', 'student'],
    },
    {
      name: 'Marks',
      href: '/marks',
      icon: Award,
      roles: ['admin', 'faculty', 'student'],
    },
    {
      name: 'Departments',
      href: '/departments',
      icon: Building,
      roles: ['admin'],
    },
    {
      name: 'Batches',
      href: '/batches',
      icon: Layers,
      roles: ['admin'],
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      roles: ['admin', 'faculty', 'student'],
    },
  ];

  const filteredNavigation = navigation.filter(item =>
    item.roles.includes(user?.role)
  );

  const handleLogout = () => {
    logout();
  };

  const isActive = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-secondary-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 bg-secondary-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-white text-lg font-semibold">MedCollege</h1>
                <p className="text-secondary-400 text-xs">Management System</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive: navIsActive }) =>
                    `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      navIsActive || isActive(item.href)
                        ? 'bg-primary-600 text-white'
                        : 'text-secondary-300 hover:bg-secondary-700 hover:text-white'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="border-t border-secondary-700 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.details?.first_name?.charAt(0) || user?.username?.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.details?.first_name || user?.username}
                </p>
                <p className="text-xs text-secondary-400 truncate">
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-secondary-300 rounded-md hover:bg-secondary-700 hover:text-white transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
