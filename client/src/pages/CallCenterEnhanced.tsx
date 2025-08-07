import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Badge,
  Avatar,
  Fab,
  Drawer,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Message as MessageIcon,
  LocalShipping as DeliveryIcon,
  Flag as FlagIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  ContentCopy as DuplicateIcon,
  Reorder as ReorderIcon,
  Block as BlockIcon,
  WhatsApp as WhatsAppIcon,
  Sms as SmsIcon,
  Email as EmailIcon,
  History as HistoryIcon,
  Note as NoteIcon,
  Map as MapIcon,
  Timer as TimerIcon,
  Assignment as AssignmentIcon,
  DirectionsCar as CarIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  CreditCard as CardIcon,
  AccountBalance as WalletIcon,
  ReceiptLong as ReceiptLongIcon,
  Print as PrintReceiptIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Keyboard as KeyboardIcon,
  VolumeUp as SoundIcon,
  VolumeOff as MuteIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { format, formatDistanceToNow } from 'date-fns';
import { colors } from '../theme/modernTheme';
import { alpha } from '@mui/material/styles';

// Enhanced Call Center with extreme detail
const CallCenterEnhanced: React.FC = () => {
  // State
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderMenuAnchor, setOrderMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedOrderForMenu, setSelectedOrderForMenu] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showNewOrderDialog, setShowNewOrderDialog] = useState(false);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);

  // Mock data
  const mockOrders = [
    {
      id: 'ORD-001',
      customerName: 'Ahmed Al-Rashid',
      customerPhone: '+966501234567',
      customerAddress: 'Riyadh, Saudi Arabia',
      items: [
        { name: 'Chicken Burger', quantity: 2, price: 45.00 },
        { name: 'French Fries', quantity: 1, price: 15.00 },
        { name: 'Coca Cola', quantity: 2, price: 10.00 },
      ],
      total: 125.00,
      status: 'pending',
      paymentMethod: 'cash',
      orderType: 'delivery',
      createdAt: new Date('2024-01-20T10:30:00'),
      estimatedDelivery: new Date('2024-01-20T11:30:00'),
      notes: 'Please deliver to the main gate',
      driver: null,
      waitTime: 15,
    },
    {
      id: 'ORD-002',
      customerName: 'Fatima Hassan',
      customerPhone: '+966509876543',
      customerAddress: 'Jeddah, Saudi Arabia',
      items: [
        { name: 'Beef Burger', quantity: 1, price: 55.00 },
        { name: 'Margherita Pizza', quantity: 1, price: 65.00 },
      ],
      total: 120.00,
      status: 'confirmed',
      paymentMethod: 'card',
      orderType: 'pickup',
      createdAt: new Date('2024-01-20T10:15:00'),
      estimatedDelivery: new Date('2024-01-20T10:45:00'),
      notes: 'Extra cheese on pizza',
      driver: 'Mohammed Ali',
      waitTime: 8,
    },
    {
      id: 'ORD-003',
      customerName: 'Mohammed Ali',
      customerPhone: '+966507654321',
      customerAddress: 'Dammam, Saudi Arabia',
      items: [
        { name: 'Chocolate Cake', quantity: 1, price: 25.00 },
        { name: 'Coca Cola', quantity: 1, price: 10.00 },
      ],
      total: 35.00,
      status: 'preparing',
      paymentMethod: 'wallet',
      orderType: 'delivery',
      createdAt: new Date('2024-01-20T10:00:00'),
      estimatedDelivery: new Date('2024-01-20T10:45:00'),
      notes: 'Happy birthday!',
      driver: 'Ahmed Hassan',
      waitTime: 12,
    },
    {
      id: 'ORD-004',
      customerName: 'Sara Ahmed',
      customerPhone: '+966505555555',
      customerAddress: 'Riyadh, Saudi Arabia',
      items: [
        { name: 'Chicken Burger', quantity: 3, price: 45.00 },
        { name: 'French Fries', quantity: 2, price: 15.00 },
        { name: 'Coca Cola', quantity: 3, price: 10.00 },
      ],
      total: 195.00,
      status: 'ready',
      paymentMethod: 'cash',
      orderType: 'delivery',
      createdAt: new Date('2024-01-20T09:45:00'),
      estimatedDelivery: new Date('2024-01-20T10:30:00'),
      notes: 'Large family order',
      driver: 'Omar Khalil',
      waitTime: 5,
    },
    {
      id: 'ORD-005',
      customerName: 'Khalid Omar',
      customerPhone: '+966506666666',
      customerAddress: 'Jeddah, Saudi Arabia',
      items: [
        { name: 'Margherita Pizza', quantity: 2, price: 65.00 },
        { name: 'Coca Cola', quantity: 2, price: 10.00 },
      ],
      total: 150.00,
      status: 'delivered',
      paymentMethod: 'card',
      orderType: 'delivery',
      createdAt: new Date('2024-01-20T09:30:00'),
      estimatedDelivery: new Date('2024-01-20T10:15:00'),
      notes: 'Extra crispy crust',
      driver: 'Yusuf Ahmed',
      waitTime: 0,
    },
  ];

  // Initialize orders
  useEffect(() => {
    setOrders(mockOrders);
  }, []);

  // Auto refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate new orders or status updates
      console.log('Auto refreshing orders...');
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Handlers
  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    setPage(0);
  };

  const handleOrderSelect = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleOrderMenuOpen = (event: React.MouseEvent<HTMLElement>, order: any) => {
    setOrderMenuAnchor(event.currentTarget);
    setSelectedOrderForMenu(order);
  };

  const handleOrderMenuClose = () => {
    setOrderMenuAnchor(null);
    setSelectedOrderForMenu(null);
  };

  const handleBulkAction = (action: string) => {
    console.log('Bulk action:', action, 'on orders:', selectedOrders);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const filteredOrders = getFilteredOrders();
      setSelectedOrders(filteredOrders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const getFilteredOrders = () => {
    let filtered = orders;
    
    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(order => order.status === activeFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerPhone.includes(searchQuery) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'confirmed': return colors.info;
      case 'preparing': return colors.info;
      case 'ready': return colors.success;
      case 'delivered': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.black[400];
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const formatWaitTime = (waitTime: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - waitTime.getTime()) / 1000 / 60);
    return `${diff} min`;
  };

  const filteredOrders = getFilteredOrders();

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${colors.white[600]}`,
          backgroundColor: colors.white[50],
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.black[800], mb: 1 }}>
              Call Center
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage incoming orders and customer requests
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, alignItems: 'center' }}>
              <Chip
                label={`${filteredOrders.length} Orders`}
                color="primary"
                size="small"
              />
              <IconButton
                onClick={() => setSoundEnabled(!soundEnabled)}
                sx={{
                  color: soundEnabled ? colors.yellow[600] : colors.black[400],
                }}
              >
                {soundEnabled ? <SoundIcon /> : <MuteIcon />}
              </IconButton>
              <IconButton
                onClick={() => setAutoRefresh(!autoRefresh)}
                sx={{
                  color: autoRefresh ? colors.success : colors.black[400],
                }}
              >
                <RefreshIcon />
              </IconButton>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowNewOrderDialog(true)}
                sx={{
                  backgroundColor: colors.yellow[500],
                  color: colors.black[800],
                  '&:hover': {
                    backgroundColor: colors.yellow[400],
                  },
                }}
              >
                New Order
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Filters */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${colors.white[600]}`,
          backgroundColor: colors.white[100],
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={4}>
            <TextField
              placeholder="Search orders, customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={8}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[
                { id: 'all', label: 'All', count: orders.length },
                { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
                { id: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
                { id: 'preparing', label: 'Preparing', count: orders.filter(o => o.status === 'preparing').length },
                { id: 'ready', label: 'Ready', count: orders.filter(o => o.status === 'ready').length },
                { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
              ].map((filter) => (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? 'contained' : 'outlined'}
                  onClick={() => handleFilterChange(filter.id)}
                  sx={{
                    backgroundColor: activeFilter === filter.id ? colors.yellow[500] : 'transparent',
                    color: activeFilter === filter.id ? colors.black[800] : colors.black[700],
                    '&:hover': {
                      backgroundColor: activeFilter === filter.id ? colors.yellow[400] : colors.white[200],
                    },
                  }}
                >
                  {filter.label}
                  <Chip
                    label={filter.count}
                    size="small"
                    sx={{
                      ml: 1,
                      backgroundColor: alpha(colors.black[800], 0.1),
                      color: colors.black[800],
                      fontSize: '0.625rem',
                    }}
                  />
                </Button>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Orders Table */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedOrders.length > 0 && selectedOrders.length < filteredOrders.length}
                    checked={selectedOrders.length === filteredOrders.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Order</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Items</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Wait Time</TableCell>
                <TableCell>Driver</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow
                  key={order.id}
                  hover
                  onClick={() => handleOrderSelect(order)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectOrder(order.id);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {order.id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {format(order.createdAt, 'HH:mm')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {order.customerName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.customerPhone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {order.items.length} items
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.items[0]?.name}
                        {order.items.length > 1 && ` +${order.items.length - 1} more`}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight={600} color={colors.yellow[600]}>
                      SAR {order.total.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(order.status)}
                      size="small"
                      sx={{
                        backgroundColor: alpha(getStatusColor(order.status), 0.1),
                        color: getStatusColor(order.status),
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {order.waitTime} min
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {order.driver ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                          {order.driver.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">
                          {order.driver}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Unassigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOrderMenuOpen(e, order);
                      }}
                    >
                      <MoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: colors.yellow[500],
          color: colors.black[800],
          '&:hover': {
            backgroundColor: colors.yellow[400],
          },
        }}
        onClick={() => setShowNewOrderDialog(true)}
      >
        <AddIcon />
      </Fab>

      {/* Order Menu */}
      <Menu
        anchorEl={orderMenuAnchor}
        open={Boolean(orderMenuAnchor)}
        onClose={handleOrderMenuClose}
      >
        <MenuItem onClick={handleOrderMenuClose}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          View Details
        </MenuItem>
        <MenuItem onClick={handleOrderMenuClose}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit Order
        </MenuItem>
        <MenuItem onClick={handleOrderMenuClose}>
          <ListItemIcon>
            <MessageIcon fontSize="small" />
          </ListItemIcon>
          Send Message
        </MenuItem>
        <MenuItem onClick={handleOrderMenuClose}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          Print Receipt
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleOrderMenuClose} sx={{ color: colors.error }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: colors.error }} />
          </ListItemIcon>
          Cancel Order
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CallCenterEnhanced;
