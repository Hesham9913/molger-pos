import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Components
import Login from './pages/Login';
import CallCenter from './pages/CallCenter';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Reporting from './pages/Reporting';
import Admin from './pages/Admin';
import Layout from './components/Layout';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useSocket } from './hooks/useSocket';
import { useNotifications } from './hooks/useNotifications';

// Store
import { useCallCenterStore } from './stores/callCenterStore';

// Theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

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
        // Initialize call center state first
        initializeCallCenter(user, user.branchId);
        
        // Initialize notifications
        initializeNotifications();
        
        // Connect to socket after a small delay to ensure everything is ready
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
  }, [isAuthenticated, user, connect, disconnect, initializeNotifications, initializeCallCenter]);

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
      <ThemeProvider theme={theme}>
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
                    <Layout>
                      <CallCenter />
                    </Layout>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/pos"
                element={
                  isAuthenticated ? (
                    <Layout>
                      <POS />
                    </Layout>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/inventory"
                element={
                  isAuthenticated ? (
                    <Layout>
                      <Inventory />
                    </Layout>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/reporting"
                element={
                  isAuthenticated ? (
                    <Layout>
                      <Reporting />
                    </Layout>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/admin"
                element={
                  isAuthenticated ? (
                    <Layout>
                      <Admin />
                    </Layout>
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
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App; 