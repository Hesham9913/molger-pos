import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Container,
  IconButton,
  Avatar,
  Badge,
} from '@mui/material';
import {
  NotificationsOutlined,
  SettingsOutlined,
  PersonOutlined,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { colors } from '../theme/modernTheme';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Call Center', path: '/call-center', icon: '📞' },
    { label: 'POS', path: '/pos', icon: '🛒' },
    { label: 'Inventory', path: '/inventory', icon: '📦' },
    { label: 'Reporting', path: '/reporting', icon: '📊' },
    { label: 'Admin', path: '/admin', icon: '⚙️' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Ultra-Modern Header */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, ${colors.black[900]} 0%, ${colors.black[800]} 100%)`,
          borderBottom: `1px solid rgba(255, 215, 0, 0.1)`,
          backdropFilter: 'blur(10px)',
        }}
      >
        <Container maxWidth={false} sx={{ px: 3 }}>
          <Toolbar sx={{ minHeight: '72px !important', px: 0 }}>
            {/* Logo Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${colors.yellow[500]} 0%, ${colors.yellow[600]} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    boxShadow: `0 4px 12px rgba(255, 215, 0, 0.3)`,
                  }}
                >
                  <Typography variant="h6" sx={{ color: colors.black[800], fontWeight: 800 }}>
                    H
                  </Typography>
                </Box>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: colors.white[50],
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                  }}
                >
                  POS
                </Typography>
              </Box>
            </motion.div>

            {/* Navigation */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Button
                    component={Link}
                    to={item.path}
                    sx={{
                      mx: 1,
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      color: location.pathname === item.path ? colors.black[800] : colors.white[200],
                      backgroundColor: location.pathname === item.path 
                        ? colors.yellow[500]
                        : 'transparent',
                      fontWeight: location.pathname === item.path ? 700 : 500,
                      fontSize: '0.875rem',
                      textTransform: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        backgroundColor: location.pathname === item.path 
                          ? colors.yellow[400]
                          : `rgba(255, 215, 0, 0.1)`,
                        color: location.pathname === item.path ? colors.black[800] : colors.yellow[400],
                        transform: 'translateY(-1px)',
                      },
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.2), transparent)`,
                        transition: 'left 0.5s',
                      },
                      '&:hover:before': {
                        left: '100%',
                      },
                    }}
                  >
                    <Box sx={{ mr: 1, fontSize: '16px' }}>{item.icon}</Box>
                    {item.label}
                  </Button>
                </motion.div>
              ))}
            </Box>

            {/* Right Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Notifications */}
                <IconButton
                  sx={{
                    color: colors.white[200],
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 215, 0, 0.1)',
                      color: colors.yellow[400],
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <Badge badgeContent={3} color="error">
                    <NotificationsOutlined />
                  </Badge>
                </IconButton>

                {/* Settings */}
                <IconButton
                  sx={{
                    color: colors.white[200],
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 215, 0, 0.1)',
                      color: colors.yellow[400],
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <SettingsOutlined />
                </IconButton>

                {/* Profile */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    ml: 2,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid rgba(255, 215, 0, 0.1)`,
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 215, 0, 0.1)',
                      borderColor: 'rgba(255, 215, 0, 0.3)',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      background: `linear-gradient(135deg, ${colors.yellow[500]} 0%, ${colors.yellow[600]} 100%)`,
                      color: colors.black[800],
                      fontSize: '14px',
                      fontWeight: 700,
                    }}
                  >
                    M
                  </Avatar>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.white[100],
                        fontWeight: 600,
                        lineHeight: 1.2,
                      }}
                    >
                      Manager
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.white[400],
                        fontSize: '11px',
                      }}
                    >
                      On Shift
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflow: 'hidden',
          backgroundColor: colors.white[50],
          position: 'relative',
        }}
      >
        {/* Subtle background pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255, 215, 0, 0.02) 2px, transparent 0)`,
            backgroundSize: '50px 50px',
            pointerEvents: 'none',
          }}
        />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;