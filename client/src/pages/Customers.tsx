import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  IconButton,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Pagination,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  ImportExport as ImportExportIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import CreateCustomerModal from '../components/customers/CreateCustomerModal';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalOrders: number;
  totalSpent: number;
  accountBalance: number;
  lastOrderAt?: string;
  isBlacklisted: boolean;
  houseAccountEnabled: boolean;
  tagAssignments: Array<{
    tag: {
      id: string;
      name: string;
      color: string;
    };
  }>;
  _count: {
    addresses: number;
  };
  createdAt: string;
}

interface CustomersResponse {
  customers: Customer[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

const Customers: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 25
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Tab configuration matching Foodics
  const tabs = [
    { value: 'all', label: 'All', count: pagination.totalCount },
    { value: 'has_orders', label: 'Has Orders', count: 0 },
    { value: 'negative_balance', label: 'Has Negative Balance', count: 0 },
    { value: 'blacklisted', label: 'Blacklisted', count: 0 },
    { value: 'deleted', label: 'Deleted', count: 0 }
  ];

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        filter: activeTab,
        search: searchQuery,
        page: page.toString(),
        limit: '25',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      const response = await fetch(`/api/customers?${queryParams}`);
      const data: { success: boolean; data: CustomersResponse } = await response.json();

      if (data.success) {
        setCustomers(data.data.customers);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [activeTab, searchQuery, page]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
    setPage(1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleCustomerClick = (customer: Customer) => {
    navigate(`/customers/${customer.id}`);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, customer: Customer) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedCustomer(customer);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCustomer(null);
  };

  const handleCreateCustomer = (customerData: any) => {
    // Refresh customers list
    fetchCustomers();
    setShowCreateModal(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return format(new Date(dateString), 'MMMM dd, hh:mma');
  };

  const getCustomerInitials = (name: string) => {
    if (name.startsWith('#')) return name.substring(1, 5);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Customers
          </Typography>
          <Tooltip title="Customer management information">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ImportExportIcon />}
            sx={{ textTransform: 'none' }}
          >
            Import / Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateModal(true)}
            sx={{ textTransform: 'none' }}
          >
            Add Customer
          </Button>
        </Box>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search customers..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              label={tab.label}
              value={tab.value}
              sx={{ textTransform: 'none' }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total Orders</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Last Order</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Account Balance</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 60 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No customers found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    hover
                    onClick={() => handleCustomerClick(customer)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                          {getCustomerInitials(customer.name)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {customer.name}
                          </Typography>
                          {customer.tagAssignments.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                              {customer.tagAssignments.slice(0, 2).map((assignment) => (
                                <Chip
                                  key={assignment.tag.id}
                                  label={assignment.tag.name}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.75rem',
                                    backgroundColor: assignment.tag.color,
                                    color: 'white'
                                  }}
                                />
                              ))}
                              {customer.tagAssignments.length > 2 && (
                                <Typography variant="caption" color="text.secondary">
                                  +{customer.tagAssignments.length - 2}
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2">{customer.phone}</Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      {customer.email ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2">{customer.email}</Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {customer.totalOrders}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(customer.lastOrderAt)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          color: customer.accountBalance < 0 ? 'error.main' : 'text.primary'
                        }}
                      >
                        {formatCurrency(customer.accountBalance)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, customer)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </Paper>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMenuClose}>
          <PersonIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          Edit Customer
        </MenuItem>
        {selectedCustomer?.isBlacklisted ? (
          <MenuItem onClick={handleMenuClose}>
            Remove from Blacklist
          </MenuItem>
        ) : (
          <MenuItem onClick={handleMenuClose}>
            Add to Blacklist
          </MenuItem>
        )}
      </Menu>

      {/* Create Customer Modal */}
      <CreateCustomerModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCustomer}
      />
    </Box>
  );
};

export default Customers;
