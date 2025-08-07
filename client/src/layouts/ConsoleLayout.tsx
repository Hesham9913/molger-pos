import React, { useState, useMemo } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  PointOfSale as POSIcon,
  Phone as CallCenterIcon,
  Receipt as OrdersIcon,
  Restaurant as RestaurantIcon,
  Inventory as InventoryIcon,
  People as CustomersIcon,
  Group as StaffIcon,
  Assessment as ReportsIcon,
  AccountBalance as AccountingIcon,
  Devices as DevicesIcon,
  Extension as AddonsIcon,
  IntegrationInstructions as IntegrationsIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Add as AddIcon,
  FileUpload as ImportIcon,
  FileDownload as ExportIcon,
  Store as StoreIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import { colors } from '../theme/modernTheme';
import { alpha } from '@mui/material/styles';

// Console Navigation Structure
const consoleNavigation = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: DashboardIcon,
    color: '#00d4aa',
  },
  {
    title: 'POS',
    path: '/pos',
    icon: POSIcon,
    color: '#ffd700',
  },
  {
    title: 'Call Center',
    path: '/call-center',
    icon: CallCenterIcon,
    color: '#007aff',
  },
  {
    title: 'Orders',
    path: '/orders',
    icon: OrdersIcon,
    color: '#ff9500',
  },
  {
    title: 'Menu',
    path: '/menu',
    icon: RestaurantIcon,
    color: '#ff3b30',
    subItems: [
      { title: 'Products', path: '/menu/products' },
      { title: 'Categories', path: '/menu/categories' },
      { title: 'Menu Groups', path: '/menu/groups' },
      { title: 'Combos', path: '/menu/combos' },
      { title: 'Modifiers', path: '/menu/modifiers' },
      { title: 'Gift Cards', path: '/menu/gift-cards' },
    ],
  },
  {
    title: 'Inventory',
    path: '/inventory',
    icon: InventoryIcon,
    color: '#ff6b35',
  },
  {
    title: 'Customers',
    path: '/customers',
    icon: CustomersIcon,
    color: '#4ecdc4',
  },
  {
    title: 'Staff',
    path: '/staff',
    icon: StaffIcon,
    color: '#45b7d1',
  },
  {
    title: 'Reports',
    path: '/reports',
    icon: ReportsIcon,
    color: '#96ceb4',
  },
  {
    title: 'Accounting',
    path: '/accounting',
    icon: AccountingIcon,
    color: '#feca57',
  },
  {
    title: 'Devices',
    path: '/devices',
    icon: DevicesIcon,
    color: '#ff9ff3',
  },
  {
    title: 'Addons',
    path: '/addons',
    icon: AddonsIcon,
    color: '#54a0ff',
  },
  {
    title: 'Integrations',
    path: '/integrations',
    icon: IntegrationsIcon,
    color: '#5f27cd',
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: SettingsIcon,
    color: '#576574',
  },
];

interface ConsoleLayoutProps {
  children: React.ReactNode;
}

const ConsoleLayout: React.FC<ConsoleLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const [branchMenuAnchor, setBranchMenuAnchor] = useState<null | HTMLElement>(null);

  // Handlers
  const handleSidebarToggle = () => setSidebarOpen(!sidebarOpen);

  const handleNavigationClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleExpandItem = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search functionality
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleBranchMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setBranchMenuAnchor(event.currentTarget);
  };

  const handleBranchMenuClose = () => {
    setBranchMenuAnchor(null);
  };

  const isActiveRoute = (path: string) => location.pathname === path;
  const isActiveSubRoute = (path: string) => location.pathname.startsWith(path);

  // Keyboard shortcuts
  useHotkeys('ctrl+b, cmd+b', (e) => {
    e.preventDefault();
    handleSidebarToggle();
  });

  // Filtered navigation based on search
  const filteredNavigation = useMemo(() => {
    if (!searchQuery) return consoleNavigation;
    
    return consoleNavigation.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subItems?.some(subItem => 
        subItem.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery]);

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Backdrop Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1199,
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            backgroundColor: colors.white[50],
            borderRight: `1px solid ${colors.white[600]}`,
            zIndex: 1200,
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        {/* Sidebar Header */}
        <Box
          sx={{
            p: 3,
            borderBottom: `1px solid ${colors.white[600]}`,
            backgroundColor: colors.white[100],
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.black[800], mb: 1 }}>
            H POS
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Restaurant Management System
          </Typography>
        </Box>

        {/* Search */}
        <Box sx={{ p: 2 }}>
          <TextField
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: colors.black[400] }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Navigation */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <List sx={{ p: 0 }}>
            {filteredNavigation.map((item) => (
              <React.Fragment key={item.title}>
                <ListItem
                  button
                  onClick={() => {
                    if (item.subItems) {
                      handleExpandItem(item.title);
                    } else {
                      handleNavigationClick(item.path);
                    }
                  }}
                  sx={{
                    backgroundColor: isActiveRoute(item.path) || isActiveSubRoute(item.path) 
                      ? alpha(colors.yellow[500], 0.1) 
                      : 'transparent',
                    borderLeft: isActiveRoute(item.path) || isActiveSubRoute(item.path)
                      ? `4px solid ${colors.yellow[500]}`
                      : '4px solid transparent',
                    '&:hover': {
                      backgroundColor: alpha(colors.yellow[500], 0.05),
                    },
                  }}
                >
                  <ListItemIcon>
                    <item.icon sx={{ color: item.color }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{
                      fontWeight: isActiveRoute(item.path) || isActiveSubRoute(item.path) ? 600 : 500,
                    }}
                  />
                  {item.subItems && (
                    <IconButton size="small">
                      {expandedItems.includes(item.title) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  )}
                </ListItem>

                {/* Sub-items */}
                {item.subItems && expandedItems.includes(item.title) && (
                  <List sx={{ pl: 4 }}>
                    {item.subItems.map((subItem) => (
                      <ListItem
                        key={subItem.title}
                        button
                        onClick={() => handleNavigationClick(subItem.path)}
                        sx={{
                          backgroundColor: isActiveRoute(subItem.path)
                            ? alpha(colors.yellow[500], 0.1)
                            : 'transparent',
                          '&:hover': {
                            backgroundColor: alpha(colors.yellow[500], 0.05),
                          },
                        }}
                      >
                        <ListItemText
                          primary={subItem.title}
                          primaryTypographyProps={{
                            fontSize: '0.875rem',
                            fontWeight: isActiveRoute(subItem.path) ? 600 : 500,
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          width: '100%',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Top Bar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            backgroundColor: colors.white[50],
            borderBottom: `1px solid ${colors.white[600]}`,
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              onClick={handleSidebarToggle}
              sx={{ 
                color: colors.black[700],
                backgroundColor: sidebarOpen ? alpha(colors.yellow[500], 0.1) : 'transparent',
                '&:hover': {
                  backgroundColor: alpha(colors.yellow[500], 0.1),
                },
                transition: 'all 0.2s ease',
              }}
            >
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" sx={{ flexGrow: 1, color: colors.black[800] }}>
              {consoleNavigation.find(item => 
                isActiveRoute(item.path) || isActiveSubRoute(item.path)
              )?.title || 'Dashboard'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Branch Selector */}
              <Button
                onClick={handleBranchMenuOpen}
                sx={{
                  color: colors.black[700],
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: colors.white[200],
                  },
                }}
              >
                <StoreIcon sx={{ mr: 1 }} />
                Main Branch
              </Button>

              {/* Notifications */}
              <IconButton
                onClick={handleNotificationsOpen}
                sx={{ color: colors.black[700] }}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* User Menu */}
              <IconButton
                onClick={handleUserMenuOpen}
                sx={{ color: colors.black[700] }}
              >
                <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                  A
                </Avatar>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ flex: 1, overflow: 'auto', backgroundColor: colors.white[50] }}>
          {children}
        </Box>
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
      >
        <MenuItem onClick={handleUserMenuClose}>
          <ListItemIcon>
            <AccountIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleUserMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleUserMenuClose}>
          <ListItemIcon>
            <HelpIcon fontSize="small" />
          </ListItemIcon>
          Help
        </MenuItem>
        <MenuItem onClick={handleUserMenuClose}>
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
      >
        <MenuItem onClick={handleNotificationsClose}>
          New order received
        </MenuItem>
        <MenuItem onClick={handleNotificationsClose}>
          Low stock alert
        </MenuItem>
        <MenuItem onClick={handleNotificationsClose}>
          System update available
        </MenuItem>
      </Menu>

      {/* Branch Menu */}
      <Menu
        anchorEl={branchMenuAnchor}
        open={Boolean(branchMenuAnchor)}
        onClose={handleBranchMenuClose}
      >
        <MenuItem onClick={handleBranchMenuClose}>
          Main Branch
        </MenuItem>
        <MenuItem onClick={handleBranchMenuClose}>
          Downtown Branch
        </MenuItem>
        <MenuItem onClick={handleBranchMenuClose}>
          Mall Branch
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ConsoleLayout;
