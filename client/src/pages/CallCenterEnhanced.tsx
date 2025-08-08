import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  VolumeUp as SoundIcon,
  VolumeOff as MuteIcon,
  LocalShipping as DeliveryIcon,
  TakeoutDining as PickupIcon,
  Restaurant as DineInIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { useHotkeys } from 'react-hotkeys-hook';
import { formatDistanceToNow } from 'date-fns';
import { colors } from '../theme/modernTheme';
import { alpha } from '@mui/material/styles';
import NewOrderModal from '../components/call-center/NewOrderModal';
import OrderCreation from './OrderCreation';

const CallCenterEnhanced: React.FC = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedOrderForMenu, setSelectedOrderForMenu] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showNewOrderDialog, setShowNewOrderDialog] = useState(false);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderMenuAnchor, setOrderMenuAnchor] = useState<null | HTMLElement>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // New order workflow state
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showOrderCreation, setShowOrderCreation] = useState(false);
  const [currentOrderData, setCurrentOrderData] = useState<any>(null);

  // Mock data
  const mockOrders = [
    {
      id: 'ORD-001',
      customerName: 'Ahmed Hassan',
      customerPhone: '+966501234567',
      orderType: 'delivery',
      status: 'pending',
      total: 85.50,
      items: 3,
      waitTime: 15,
      driver: 'Mohammed Ali',
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
      address: '123 King Fahd Rd, Riyadh',
      tags: ['STAFF', 'VIP'],
    },
    {
      id: 'ORD-002',
      customerName: 'Sarah Johnson',
      customerPhone: '+966509876543',
      orderType: 'pickup',
      status: 'confirmed',
      total: 120.00,
      items: 4,
      waitTime: 25,
      driver: null,
      createdAt: new Date(Date.now() - 25 * 60 * 1000),
      address: null,
      tags: ['REGULAR'],
    },
    {
      id: 'ORD-003',
      customerName: 'Omar Khalil',
      customerPhone: '+966507654321',
      orderType: 'dine-in',
      status: 'preparing',
      total: 65.00,
      items: 2,
      waitTime: 10,
      driver: null,
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
      address: null,
      tags: ['NEW'],
    },
  ];

  const currentBranch = {
    id: '1',
    name: 'Main Branch',
    address: '123 Main St, Riyadh',
  };

  // Filtered orders
  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = !searchQuery || 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' || order.status === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Handle new order button click
  const handleNewOrderClick = () => {
    setShowNewOrderModal(true);
  };

  // Handle order modal submission
  const handleOrderModalSubmit = (orderData: any) => {
    setCurrentOrderData(orderData);
    setShowNewOrderModal(false);
    setShowOrderCreation(true);
  };

  // Handle back from order creation
  const handleOrderCreationBack = () => {
    setShowOrderCreation(false);
    setCurrentOrderData(null);
  };

  // Handle filter change
  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
  };

  // Handle order selection
  const handleOrderSelect = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Handle order menu open
  const handleOrderMenuOpen = (event: React.MouseEvent<HTMLElement>, order: any) => {
    setOrderMenuAnchor(event.currentTarget);
    setSelectedOrderForMenu(order);
  };

  // Handle order menu close
  const handleOrderMenuClose = () => {
    setOrderMenuAnchor(null);
    setSelectedOrderForMenu(null);
  };

  // Handle bulk action
  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action}`);
  };

  // Handle select all
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Implementation for select all
  };

  // Handle select order
  const handleSelectOrder = (orderId: string) => {
    // Implementation for select order
  };

  // Get filtered orders
  const getFilteredOrders = () => {
    return filteredOrders;
  };

  // Get status color
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

  // Get status label
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

  // Format wait time
  const formatWaitTime = (waitTime: Date) => {
    return formatDistanceToNow(waitTime, { addSuffix: true });
  };

  // If showing order creation, render that instead
  if (showOrderCreation && currentOrderData) {
    return (
      <OrderCreation
        orderData={currentOrderData}
        onBack={handleOrderCreationBack}
      />
    );
  }

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
                onClick={handleNewOrderClick}
                sx={{
                  backgroundColor: colors.yellow[500],
                  color: colors.black[800],
                  '&:hover': {
                    backgroundColor: colors.yellow[400],
                  },
                }}
              >
                New Call Center Order
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
                { id: 'all', label: 'All', count: mockOrders.length },
                { id: 'pending', label: 'Pending', count: mockOrders.filter(o => o.status === 'pending').length },
                { id: 'confirmed', label: 'Confirmed', count: mockOrders.filter(o => o.status === 'confirmed').length },
                { id: 'preparing', label: 'Preparing', count: mockOrders.filter(o => o.status === 'preparing').length },
                { id: 'ready', label: 'Ready', count: mockOrders.filter(o => o.status === 'ready').length },
                { id: 'delivered', label: 'Delivered', count: mockOrders.filter(o => o.status === 'delivered').length },
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
                      backgroundColor: activeFilter === filter.id ? colors.black[800] : colors.black[400],
                      color: 'white',
                      fontSize: '0.7rem',
                    }}
                  />
                </Button>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Orders Table */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Wait Time</TableCell>
                <TableCell>Driver</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredOrders().map((order) => (
                <TableRow 
                  key={order.id}
                  hover
                  onClick={() => handleOrderSelect(order)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {order.id}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(order.createdAt, { addSuffix: true })}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                        {order.customerName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {order.customerName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.customerPhone}
                        </Typography>
                        {order.tags && (
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                            {order.tags.map((tag: string) => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                sx={{
                                  backgroundColor: tag === 'VIP' ? colors.yellow[500] : colors.info,
                                  color: 'white',
                                  fontSize: '0.6rem',
                                  height: 16,
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {order.orderType === 'delivery' ? (
                        <DeliveryIcon sx={{ fontSize: 16, color: colors.info }} />
                      ) : order.orderType === 'pickup' ? (
                        <PickupIcon sx={{ fontSize: 16, color: colors.warning }} />
                      ) : (
                        <DineInIcon sx={{ fontSize: 16, color: colors.success }} />
                      )}
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {order.orderType}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(order.status)}
                      size="small"
                      sx={{
                        backgroundColor: alpha(getStatusColor(order.status), 0.1),
                        color: getStatusColor(order.status),
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 700, color: colors.yellow[600] }}>
                      SAR {order.total.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.items} items
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
      >
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={handleNewOrderClick}
          sx={{
            backgroundColor: colors.yellow[500],
            color: colors.black[800],
            borderRadius: 3,
            px: 3,
            py: 1.5,
            boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)',
            '&:hover': {
              backgroundColor: colors.yellow[400],
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(255, 215, 0, 0.4)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          New Order
        </Button>
      </Box>

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

      {/* New Order Modal */}
      <NewOrderModal
        open={showNewOrderModal}
        onClose={() => setShowNewOrderModal(false)}
        onSubmit={handleOrderModalSubmit}
        currentBranch={currentBranch}
      />
    </Box>
  );
};

export default CallCenterEnhanced;
