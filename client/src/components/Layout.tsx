import React from 'react';
import { Box, AppBar, Toolbar, Typography, Button, useTheme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { path: '/call-center', label: 'Call Center' },
    { path: '/pos', label: 'POS' },
    { path: '/inventory', label: 'Inventory' },
    { path: '/reporting', label: 'Reporting' },
    { path: '/admin', label: 'Admin' },
  ];

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Bar */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            H POS
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                onClick={() => navigate(item.path)}
                sx={{
                  backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 