import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Lazy load other pages
const Students = React.lazy(() => import('./pages/Students'));
const Faculty = React.lazy(() => import('./pages/Faculty'));
const Subjects = React.lazy(() => import('./pages/Subjects'));
const Attendance = React.lazy(() => import('./pages/Attendance'));
const Marks = React.lazy(() => import('./pages/Marks'));
const Departments = React.lazy(() => import('./pages/Departments'));
const Batches = React.lazy(() => import('./pages/Batches'));
const Profile = React.lazy(() => import('./pages/Profile'));

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-secondary-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="lg:pl-64">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="p-6">
          <React.Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          }>
            {children}
          </React.Suspense>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <PrivateRoute>
              <Layout>
                <Navigate to="/dashboard" />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/students" element={
            <PrivateRoute>
              <Layout>
                <Students />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/faculty" element={
            <PrivateRoute>
              <Layout>
                <Faculty />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/subjects" element={
            <PrivateRoute>
              <Layout>
                <Subjects />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/attendance" element={
            <PrivateRoute>
              <Layout>
                <Attendance />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/marks" element={
            <PrivateRoute>
              <Layout>
                <Marks />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/departments" element={
            <PrivateRoute>
              <Layout>
                <Departments />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/batches" element={
            <PrivateRoute>
              <Layout>
                <Batches />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <Layout>
                <Profile />
              </Layout>
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
