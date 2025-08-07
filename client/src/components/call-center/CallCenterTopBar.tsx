import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Badge,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  NotificationsOutlined,
  SettingsOutlined,
  HelpOutlineOutlined,
  PersonOutlineOutlined,
  KeyboardOutlined,
  VolumeUpOutlined,
  VolumeOffOutlined,
  LogoutOutlined,
  BusinessOutlined,
  AccessTimeOutlined,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';

// Types
import { User, Branch } from '../../shared/types';

// Hooks
import { useAuth } from '../../hooks/useAuth';
import { useCallCenterStore } from '../../stores/callCenterStore';

// Theme
import { colors } from '../../theme/modernTheme';

interface CallCenterTopBarProps {
  agent: User;
  branch: Branch | null;
  unreadNotifications: number;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

const CallCenterTopBar: React.FC<CallCenterTopBarProps> = ({
  agent,
  branch,
  unreadNotifications,
  searchInputRef,
}) => {
  const { logout } = useAuth();
  const { searchQuery, setSearchQuery } = useCallCenterStore();
  
  // State for menus and modals
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const [settingsMenuAnchor, setSettingsMenuAnchor] = useState<null | HTMLElement>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  // Keyboard shortcuts
  useHotkeys('ctrl+/', () => setHelpModalOpen(true));
  useHotkeys('ctrl+,', () => setSettingsMenuAnchor(document.body));

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleSettingsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsMenuAnchor(event.currentTarget);
  };

  const handleSettingsMenuClose = () => {
    setSettingsMenuAnchor(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  return (
    <Box
      sx={{
        borderBottom: `1px solid ${colors.white[600]}`,
        backgroundColor: colors.white[50],
        backdropFilter: 'blur(8px)',
        zIndex: 1100,
      }}
    >
      <Container maxWidth={false} sx={{ px: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2,
            minHeight: 64,
          }}
        >
          {/* Left Section - Branch Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    backgroundColor: colors.black[800],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BusinessOutlined sx={{ color: colors.yellow[500], fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: colors.black[800] }}>
                    Branch: {branch?.name || 'No Branch'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.black[500] }}>
                    {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
                  </Typography>
                </Box>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ height: 40 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  icon={<AccessTimeOutlined sx={{ fontSize: 16 }} />}
                  label="On Shift"
                  size="small"
                  sx={{
                    backgroundColor: `rgba(0, 212, 170, 0.1)`,
                    color: '#00d4aa',
                    border: `1px solid rgba(0, 212, 170, 0.3)`,
                    fontWeight: 600,
                    '& .MuiChip-icon': {
                      color: '#00d4aa',
                    },
                  }}
                />
              </Box>
            </Box>
          </motion.div>

          {/* Center Section - Search */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <TextField
              ref={searchInputRef}
              placeholder="Search orders, customers, phone numbers... (F)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{
                width: 400,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: colors.white[100],
                  border: `1px solid ${colors.white[600]}`,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: colors.white[200],
                    borderColor: colors.yellow[400],
                  },
                  '&.Mui-focused': {
                    backgroundColor: colors.white[50],
                    borderColor: colors.yellow[500],
                    boxShadow: `0 0 0 3px rgba(255, 215, 0, 0.1)`,
                  },
                  '& fieldset': {
                    border: 'none',
                  },
                },
                '& .MuiInputBase-input': {
                  fontSize: '14px',
                  color: colors.black[700],
                  '&::placeholder': {
                    color: colors.black[400],
                    opacity: 1,
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: colors.black[400], fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
          </motion.div>

          {/* Right Section - Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Sound Toggle */}
              <Tooltip title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}>
                <IconButton
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  sx={{
                    color: soundEnabled ? colors.yellow[600] : colors.black[400],
                    backgroundColor: soundEnabled ? `rgba(255, 215, 0, 0.1)` : 'transparent',
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: soundEnabled 
                        ? `rgba(255, 215, 0, 0.2)` 
                        : `rgba(0, 0, 0, 0.05)`,
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {soundEnabled ? <VolumeUpOutlined /> : <VolumeOffOutlined />}
                </IconButton>
              </Tooltip>

              {/* Notifications */}
              <Tooltip title="Notifications">
                <IconButton
                  onClick={() => setNotificationDrawerOpen(true)}
                  sx={{
                    color: unreadNotifications > 0 ? colors.yellow[600] : colors.black[400],
                    backgroundColor: unreadNotifications > 0 ? `rgba(255, 215, 0, 0.1)` : 'transparent',
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: unreadNotifications > 0 
                        ? `rgba(255, 215, 0, 0.2)` 
                        : `rgba(0, 0, 0, 0.05)`,
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <Badge badgeContent={unreadNotifications} color="error">
                    <NotificationsOutlined />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Settings */}
              <Tooltip title="Settings">
                <IconButton
                  onClick={handleSettingsMenuOpen}
                  sx={{
                    color: colors.black[400],
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: `rgba(0, 0, 0, 0.05)`,
                      color: colors.black[600],
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <SettingsOutlined />
                </IconButton>
              </Tooltip>

              {/* Help */}
              <Tooltip title="Help & Shortcuts">
                <IconButton
                  onClick={() => setHelpModalOpen(true)}
                  sx={{
                    color: colors.black[400],
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: `rgba(0, 0, 0, 0.05)`,
                      color: colors.black[600],
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <HelpOutlineOutlined />
                </IconButton>
              </Tooltip>

              <Divider orientation="vertical" flexItem sx={{ height: 32, mx: 1 }} />

              {/* Profile */}
              <Box
                onClick={handleProfileMenuOpen}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  border: `1px solid ${colors.white[600]}`,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: colors.white[200],
                    borderColor: colors.yellow[400],
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
                  {agent.name?.charAt(0) || 'U'}
                </Avatar>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.black[700],
                      fontWeight: 600,
                      lineHeight: 1.2,
                    }}
                  >
                    {agent.name || 'User'}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.black[500],
                      fontSize: '11px',
                    }}
                  >
                    {agent.role || 'Agent'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </motion.div>
        </Box>
      </Container>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 200,
            border: `1px solid ${colors.white[600]}`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <PersonOutlineOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <KeyboardOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>Shortcuts</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: colors.error }}>
          <ListItemIcon>
            <LogoutOutlined fontSize="small" sx={{ color: colors.error }} />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>

      {/* Settings Menu */}
      <Menu
        anchorEl={settingsMenuAnchor}
        open={Boolean(settingsMenuAnchor)}
        onClose={handleSettingsMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 180,
            border: `1px solid ${colors.white[600]}`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        <MenuItem onClick={handleSettingsMenuClose}>
          <ListItemText>Language</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleSettingsMenuClose}>
          <ListItemText>Theme</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleSettingsMenuClose}>
          <ListItemText>Notifications</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CallCenterTopBar;