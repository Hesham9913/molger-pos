import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Components
import Login from './pages/Login';
import CallCenter from './pages/CallCenter';
import CallCenterEnhanced from './pages/CallCenterEnhanced';
import POS from './pages/POS';
import POSEnhanced from './pages/POSEnhanced';
import MenuManagement from './pages/MenuManagement';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Inventory from './pages/Inventory';
import Reporting from './pages/Reporting';
import Admin from './pages/Admin';
import Layout from './components/Layout';
import ConsoleLayout from './layouts/ConsoleLayout';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useSocket } from './hooks/useSocket';
import { useNotifications } from './hooks/useNotifications';

// Store
import { useCallCenterStore } from './stores/callCenterStore';

// Theme
import { modernTheme } from './theme/modernTheme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { connect, disconnect } = useSocket();
  const { initializeNotifications } = useNotifications();
  const { initializeCallCenter } = useCallCenterStore();

  useEffect(() => {
    if (isAuthenticated && user && user.id && user.branchId && user.role) {
      try {
        // Initialize everything in sequence
        initializeNotifications();
        initializeCallCenter(user, user.branchId);
        
        // Connect to socket after a brief delay
        const timer = setTimeout(() => {
          connect(user.id, user.branchId, user.role);
        }, 100);
        
        return () => {
          clearTimeout(timer);
          disconnect();
        };
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    }
  }, [isAuthenticated, user?.id, user?.branchId, user?.role]); // More specific dependencies

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        Loading...
      </Box>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={modernTheme}>
        <CssBaseline />
        <Router>
          <Box sx={{ height: '100vh', overflow: 'hidden' }}>
            <Routes>
              <Route 
                path="/login" 
                element={isAuthenticated ? <Navigate to="/call-center" /> : <Login />} 
              />
              <Route 
                path="/" 
                element={isAuthenticated ? <Navigate to="/call-center" /> : <Navigate to="/login" />} 
              />
              <Route
                path="/call-center"
                element={
                  isAuthenticated ? (
                    <ConsoleLayout>
                      <CallCenterEnhanced />
                    </ConsoleLayout>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/pos"
                element={
                  isAuthenticated ? (
                    <ConsoleLayout>
                      <POSEnhanced />
                    </ConsoleLayout>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/menu"
                element={
                  isAuthenticated ? (
                    <ConsoleLayout>
                      <MenuManagement />
                    </ConsoleLayout>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/customers"
                element={
                  isAuthenticated ? (
                    <ConsoleLayout>
                      <Customers />
                    </ConsoleLayout>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/customers/:id"
                element={
                  isAuthenticated ? (
                    <ConsoleLayout>
                      <CustomerDetail />
                    </ConsoleLayout>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/inventory"
                element={
                  isAuthenticated ? (
                    <ConsoleLayout>
                      <Inventory />
                    </ConsoleLayout>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/reports"
                element={
                  isAuthenticated ? (
                    <ConsoleLayout>
                      <Reporting />
                    </ConsoleLayout>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/admin"
                element={
                  isAuthenticated ? (
                    <ConsoleLayout>
                      <Admin />
                    </ConsoleLayout>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
            </Routes>
          </Box>
        </Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#212529',
              color: '#ffffff',
              borderRadius: '12px',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            },
            success: {
              style: {
                background: '#212529',
                color: '#00d4aa',
                border: '1px solid rgba(0, 212, 170, 0.3)',
              },
            },
            error: {
              style: {
                background: '#212529',
                color: '#ff3b30',
                border: '1px solid rgba(255, 59, 48, 0.3)',
              },
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App; 