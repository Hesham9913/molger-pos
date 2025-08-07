import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  AccountCircle as AccountIcon,
  Language as LanguageIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  VolumeUp as SoundIcon,
  VolumeOff as MuteIcon,
  Logout as LogoutIcon,
  Keyboard as KeyboardIcon,
} from '@mui/icons-material';
import { useHotkeys } from 'react-hotkeys-hook';

// Types
import { User, Branch } from '../../shared/types';

// Hooks
import { useAuth } from '../../hooks/useAuth';
import { useCallCenterStore } from '../../stores/callCenterStore';

// Components
import NotificationDrawer from './NotificationDrawer';
import SettingsModal from './SettingsModal';
import HelpModal from './HelpModal';

interface CallCenterTopBarProps {
  agent: User;
  branch: Branch;
  unreadNotifications: number;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

const CallCenterTopBar: React.FC<CallCenterTopBarProps> = ({
  agent,
  branch,
  unreadNotifications,
  searchInputRef,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { logout } = useAuth();
  const { setNewCustomerModalOpen, setNewOrderModalOpen } = useCallCenterStore();

  // State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');

  // Keyboard shortcuts
  useHotkeys('n', () => setNewOrderModalOpen(true));
  useHotkeys('c', () => setNewCustomerModalOpen(true));
  useHotkeys('f', () => searchInputRef.current?.focus());
  useHotkeys('b', () => setNotificationDrawerOpen(true));
  useHotkeys('h', () => setHelpModalOpen(true));
  useHotkeys('s', () => setSettingsModalOpen(true));

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleEndShift = () => {
    // Handle end shift logic
    handleMenuClose();
  };

  const handleToggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
  };

  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  const getShiftStatusColor = () => {
    // Logic to determine shift status
    return 'success';
  };

  const getShiftStatusText = () => {
    // Logic to determine shift status text
    return 'On Shift';
  };

  return (
    <>
      <AppBar position="static" elevation={1} sx={{ backgroundColor: 'background.paper' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Left Section - Logo and Branch */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Logo */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { opacity: 0.8 },
              }}
              onClick={() => window.location.href = '/call-center'}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  color: 'primary.main',
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                }}
              >
                H POS
              </Typography>
            </Box>

            {/* Branch Info */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Branch:
                </Typography>
                <Chip
                  label={branch.name}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            )}
          </Box>

          {/* Center Section - Search (hidden on mobile) */}
          {!isMobile && (
            <Box sx={{ flex: 1, maxWidth: 400, mx: 2 }}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search orders, customers, phone numbers... (F)"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '4px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </Box>
          )}

          {/* Right Section - Agent Info and Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notifications */}
            <Tooltip title="Notifications (B)">
              <IconButton
                color="inherit"
                onClick={() => setNotificationDrawerOpen(true)}
                sx={{ position: 'relative' }}
              >
                <Badge badgeContent={unreadNotifications} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Sound Toggle */}
            <Tooltip title={isSoundEnabled ? "Mute Sounds" : "Enable Sounds"}>
              <IconButton color="inherit" onClick={handleToggleSound}>
                {isSoundEnabled ? <SoundIcon /> : <MuteIcon />}
              </IconButton>
            </Tooltip>

            {/* Settings */}
            <Tooltip title="Settings (S)">
              <IconButton
                color="inherit"
                onClick={() => setSettingsModalOpen(true)}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>

            {/* Help */}
            <Tooltip title="Help (H)">
              <IconButton
                color="inherit"
                onClick={() => setHelpModalOpen(true)}
              >
                <HelpIcon />
              </IconButton>
            </Tooltip>

            {/* Agent Profile */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {agent.name}
                </Typography>
                <Chip
                  label={getShiftStatusText()}
                  size="small"
                  color={getShiftStatusColor() as any}
                  variant="outlined"
                />
              </Box>
              
              <Tooltip title="Agent Menu">
                <IconButton
                  onClick={handleMenuOpen}
                  sx={{ p: 0.5 }}
                >
                  <Avatar
                    src={agent.photo}
                    sx={{ width: 32, height: 32 }}
                  >
                    {agent.name.charAt(0)}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Agent Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <AccountIcon sx={{ mr: 1 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleEndShift}>
          <LogoutIcon sx={{ mr: 1 }} />
          End Shift
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Notification Drawer */}
      <NotificationDrawer
        open={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        onMarkAsRead={(notificationId) => {
          // Handle mark as read
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        isSoundEnabled={isSoundEnabled}
        onToggleSound={handleToggleSound}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        language={language}
        onLanguageChange={handleLanguageChange}
      />

      {/* Help Modal */}
      <HelpModal
        open={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        shortcuts={[
          { key: 'N', action: 'New Order', description: 'Create new order' },
          { key: 'C', action: 'New Customer', description: 'Create new customer' },
          { key: 'F', action: 'Search', description: 'Focus search field' },
          { key: 'B', action: 'Notifications', description: 'Open notifications' },
          { key: 'H', action: 'Help', description: 'Show this help' },
          { key: 'S', action: 'Settings', description: 'Open settings' },
          { key: 'ESC', action: 'Close', description: 'Close current modal/drawer' },
        ]}
      />
    </>
  );
};

export default CallCenterTopBar; 