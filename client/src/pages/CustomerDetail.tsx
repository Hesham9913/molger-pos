import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Add as AddIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  Discount as DiscountIcon,
  Schedule as ScheduleIcon,
  Restaurant as RestaurantIcon,
  Store as StoreIcon,
  Block as BlockIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import CreateAddressModal from '../components/customers/CreateAddressModal';

interface CustomerDetail {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  totalDiscounts: number;
  accountBalance: number;
  lastOrderAt?: string;
  isBlacklisted: boolean;
  houseAccountEnabled: boolean;
  favoriteProduct?: {
    id: string;
    name: string;
    nameAr?: string;
  };
  favoriteBranch?: {
    id: string;
    name: string;
  };
  addresses: Array<{
    id: string;
    name?: string;
    detailedAddress: string;
    additionalInfo?: string;
    isDefault: boolean;
    deliveryZone: {
      id: string;
      name: string;
      deliveryFee: number;
      estimatedDeliveryTime: number;
    };
  }>;
  tagAssignments: Array<{
    id: string;
    tag: {
      id: string;
      name: string;
      color: string;
      description?: string;
    };
  }>;
  orders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    orderType: string;
    createdAt: string;
  }>;
}

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCustomer();
    }
  }, [id]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/customers/${id}`);
      const data = await response.json();

      if (data.success) {
        setCustomer(data.data);
      } else {
        setError(data.message || 'Failed to fetch customer');
      }
    } catch (err) {
      setError('Failed to fetch customer details');
    } finally {
      setLoading(false);
    }
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
    return format(new Date(dateString), 'MMMM dd, yyyy hh:mm a');
  };

  const handleAddAddress = (addressData: any) => {
    fetchCustomer(); // Refresh customer data
    setShowAddressModal(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !customer) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || 'Customer not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/customers')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, flexGrow: 1 }}>
          {customer.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {customer.houseAccountEnabled && (
            <Chip
              icon={<AccountBalanceIcon />}
              label="House Account"
              color="info"
              variant="outlined"
            />
          )}
          {customer.isBlacklisted && (
            <Chip
              icon={<BlockIcon />}
              label="Blacklisted"
              color="error"
            />
          )}
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            sx={{ textTransform: 'none' }}
          >
            Edit Customer
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <ReceiptIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {customer.totalOrders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Done Orders
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <MoneyIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {formatCurrency(customer.totalSpent)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Spent (EGP)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <DiscountIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'warning.main' }}>
                    {formatCurrency(customer.totalDiscounts)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Discounts (EGP)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <ScheduleIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatDate(customer.lastOrderAt)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last Order
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <RestaurantIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {customer.favoriteProduct?.name || '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Favourite Product
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <StoreIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {customer.favoriteBranch?.name || '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Favourite Branch
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Customer Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Customer Information
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                  Name:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {customer.name}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PhoneIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
                  Phone:
                </Typography>
                <Typography variant="body1">{customer.phone}</Typography>
              </Box>

              {customer.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
                    Email:
                  </Typography>
                  <Typography variant="body1">{customer.email}</Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                  House Accounts:
                </Typography>
                <Chip
                  label={customer.houseAccountEnabled ? 'Enabled' : 'Disabled'}
                  color={customer.houseAccountEnabled ? 'success' : 'default'}
                  size="small"
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                  Blacklist:
                </Typography>
                <Chip
                  label={customer.isBlacklisted ? 'Yes' : 'No'}
                  color={customer.isBlacklisted ? 'error' : 'success'}
                  size="small"
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                  Balance:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 500,
                    color: customer.accountBalance < 0 ? 'error.main' : 'success.main'
                  }}
                >
                  {formatCurrency(customer.accountBalance)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Tags Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Tags
              </Typography>
              <Button
                variant="outlined"
                size="small"
                sx={{ textTransform: 'none' }}
              >
                Add Tags
              </Button>
            </Box>

            {customer.tagAssignments.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {customer.tagAssignments.map((assignment) => (
                  <Chip
                    key={assignment.id}
                    label={assignment.tag.name}
                    sx={{
                      backgroundColor: assignment.tag.color,
                      color: 'white'
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                You can add tags to this customer for filtering or assigning promotions.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Addresses Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Addresses
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setShowAddressModal(true)}
                sx={{ textTransform: 'none' }}
              >
                Add Address
              </Button>
            </Box>

            {customer.addresses.length > 0 ? (
              <List>
                {customer.addresses.map((address, index) => (
                  <React.Fragment key={address.id}>
                    <ListItem sx={{ px: 0 }}>
                      <LocationIcon sx={{ mr: 2, color: 'action.active' }} />
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {address.name || 'Address'}
                            </Typography>
                            {address.isDefault && (
                              <Chip label="Default" size="small" color="primary" />
                            )}
                            <Chip
                              label={address.deliveryZone.name}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {address.detailedAddress}
                            </Typography>
                            {address.additionalInfo && (
                              <Typography variant="body2" color="text.secondary">
                                {address.additionalInfo}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              Delivery Fee: {formatCurrency(address.deliveryZone.deliveryFee)} • 
                              Est. Time: {address.deliveryZone.estimatedDeliveryTime} mins
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < customer.addresses.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                You can add this customer's addresses and assign them to delivery zones for delivery orders.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Create Address Modal */}
      <CreateAddressModal
        open={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSubmit={handleAddAddress}
        customerId={customer.id}
      />
    </Box>
  );
};

export default CustomerDetail;
