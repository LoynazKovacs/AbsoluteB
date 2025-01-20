import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CompanyProvider } from './contexts/CompanyContext';
import { Loader2 } from 'lucide-react';
import AuthGuard from './components/AuthGuard';
import AdminGuard from './components/AdminGuard';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
    <Loader2 className="h-12 w-12 text-primary-light animate-spin" />
  </div>
);

// Lazy load components
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Users = React.lazy(() => import('./pages/Users'));
const Companies = React.lazy(() => import('./pages/Companies'));
const Documents = React.lazy(() => import('./pages/Documents'));
const TablesList = React.lazy(() => import('./pages/TablesList'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Help = React.lazy(() => import('./pages/Help'));
const ItemView = React.lazy(() => import('./pages/ItemView'));

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CompanyProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/signup" element={<Signup />} />
              <Route
                path="/"
                element={
                  <AuthGuard>
                    <Layout />
                  </AuthGuard>
                }
              >
                <Route
                  index
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingFallback />}>
                        <Dashboard />
                      </Suspense>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="analytics"
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingFallback />}>
                        <Analytics />
                      </Suspense>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="companies"
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingFallback />}>
                        <Companies />
                      </Suspense>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="users"
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingFallback />}>
                        <Users />
                      </Suspense>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="documents"
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingFallback />}>
                        <Documents />
                      </Suspense>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <ErrorBoundary>
                      <AdminGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <TablesList />
                        </Suspense>
                      </AdminGuard>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="settings/tables/:tableName"
                  element={
                    <ErrorBoundary>
                      <AdminGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <Settings />
                        </Suspense>
                      </AdminGuard>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="settings/tables/:tableName/:id"
                  element={
                    <ErrorBoundary>
                      <AdminGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <ItemView />
                        </Suspense>
                      </AdminGuard>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="settings/tables"
                  element={
                    <ErrorBoundary>
                      <AdminGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <TablesList />
                        </Suspense>
                      </AdminGuard>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="help"
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingFallback />}>
                        <Help />
                      </Suspense>
                    </ErrorBoundary>
                  }
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </CompanyProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;