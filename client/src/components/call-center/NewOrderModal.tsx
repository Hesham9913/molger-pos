import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Typography,
  Box,
  Chip,
  IconButton,
  Autocomplete,
  Alert,
  CircularProgress,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Close as CloseIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Add as AddIcon,
  History as HistoryIcon,
  Store as StoreIcon,
  LocalShipping as DeliveryIcon,
  TakeoutDining as PickupIcon,
  Restaurant as DineInIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { colors } from '../../theme/modernTheme';
import { alpha } from '@mui/material/styles';

interface Customer {
  id: string;
  name: string;
  phone: string;
  tags: string[];
  addresses: Address[];
  recentOrders: Order[];
}

interface Address {
  id: string;
  address: string;
  tag: string;
  isDefault: boolean;
}

interface Order {
  id: string;
  date: Date;
  total: number;
  status: string;
}

interface Branch {
  id: string;
  name: string;
  address: string;
}

interface NewOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (orderData: any) => void;
  currentBranch: Branch;
}

const orderTypes = [
  { value: 'delivery', label: 'Delivery', icon: DeliveryIcon },
  { value: 'pickup', label: 'Pickup', icon: PickupIcon },
  { value: 'dine-in', label: 'Dine-in', icon: DineInIcon },
];

const NewOrderModal: React.FC<NewOrderModalProps> = ({
  open,
  onClose,
  onSubmit,
  currentBranch,
}) => {
  // Form state
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(currentBranch.id);
  const [showRecentOrders, setShowRecentOrders] = useState(false);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Data state
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [suggestions, setSuggestions] = useState<Customer[]>([]);

  // Mock data - replace with API calls
  const mockBranches: Branch[] = [
    { id: '1', name: 'Main Branch', address: '123 Main St' },
    { id: '2', name: 'Downtown Branch', address: '456 Downtown Ave' },
    { id: '3', name: 'Mall Branch', address: '789 Mall Blvd' },
  ];

  const mockCustomers: Customer[] = [
    {
      id: '1',
      name: 'Ahmed Hassan',
      phone: '+966501234567',
      tags: ['STAFF', 'VIP'],
      addresses: [
        { id: '1', address: '123 King Fahd Rd, Riyadh', tag: 'Home', isDefault: true },
        { id: '2', address: '456 Olaya St, Riyadh', tag: 'Work', isDefault: false },
      ],
      recentOrders: [
        { id: '1', date: new Date('2024-01-15'), total: 85.50, status: 'Delivered' },
        { id: '2', date: new Date('2024-01-10'), total: 120.00, status: 'Delivered' },
      ],
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      phone: '+966509876543',
      tags: ['REGULAR'],
      addresses: [
        { id: '3', address: '789 Prince Sultan St, Jeddah', tag: 'Home', isDefault: true },
      ],
      recentOrders: [
        { id: '3', date: new Date('2024-01-12'), total: 65.00, status: 'Delivered' },
      ],
    },
  ];

  // Load branches on mount
  useEffect(() => {
    setBranches(mockBranches);
  }, []);

  // Phone number validation and customer search
  useEffect(() => {
    if (customerPhone.length >= 10) {
      setIsValidating(true);
      // Simulate API call
      setTimeout(() => {
        const foundCustomer = mockCustomers.find(c => c.phone.includes(customerPhone));
        if (foundCustomer) {
          setCustomer(foundCustomer);
          setCustomerName(foundCustomer.name);
          setSelectedAddress(foundCustomer.addresses.find(a => a.isDefault)?.id || '');
        } else {
          setCustomer(null);
          setCustomerName('');
          setSelectedAddress('');
        }
        setIsValidating(false);
      }, 500);
    } else {
      setCustomer(null);
      setCustomerName('');
      setSelectedAddress('');
    }
  }, [customerPhone]);

  // Generate suggestions for phone input
  useEffect(() => {
    if (customerPhone.length >= 3) {
      const filtered = mockCustomers.filter(c => 
        c.phone.includes(customerPhone) || c.name.toLowerCase().includes(customerPhone.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [customerPhone]);

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!customerPhone) {
      newErrors.customerPhone = 'Phone number is required';
    } else if (customerPhone.length < 10) {
      newErrors.customerPhone = 'Phone number must be at least 10 digits';
    }

    if (!customerName) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!orderType) {
      newErrors.orderType = 'Order type is required';
    }

    if (orderType === 'delivery' && !selectedAddress) {
      newErrors.address = 'Delivery address is required';
    }

    if (!selectedBranch) {
      newErrors.branch = 'Branch is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is valid for submit button
  const isFormValid = () => {
    return customerPhone && customerName && orderType && selectedBranch && 
           (orderType !== 'delivery' || selectedAddress);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const orderData = {
        customerPhone,
        customerName,
        orderType,
        selectedAddress: orderType === 'delivery' ? selectedAddress : null,
        selectedBranch,
        customer,
      };
      
      onSubmit(orderData);
      setIsLoading(false);
    }, 1000);
  };

  // Handle customer selection from suggestions
  const handleCustomerSelect = (selectedCustomer: Customer) => {
    setCustomer(selectedCustomer);
    setCustomerPhone(selectedCustomer.phone);
    setCustomerName(selectedCustomer.name);
    setSelectedAddress(selectedCustomer.addresses.find(a => a.isDefault)?.id || '');
  };

  // Handle order type change
  const handleOrderTypeChange = (newOrderType: string) => {
    setOrderType(newOrderType);
    if (newOrderType !== 'delivery') {
      setSelectedAddress('');
    } else if (customer && customer.addresses.length > 0) {
      setSelectedAddress(customer.addresses.find(a => a.isDefault)?.id || customer.addresses[0].id);
    }
  };

  // Keyboard shortcuts
  useHotkeys('escape', () => {
    if (open) onClose();
  });

  useHotkeys('enter', () => {
    if (open && isFormValid()) {
      handleSubmit();
    }
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1,
        borderBottom: `1px solid ${colors.white[600]}`,
      }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: colors.black[800] }}>
          New Call Center Order
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Customer Phone */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Customer Phone *
            </Typography>
            <Autocomplete
              freeSolo
              options={suggestions}
              getOptionLabel={(option) => 
                typeof option === 'string' ? option : `${option.name} (${option.phone})`
              }
              inputValue={customerPhone}
              onInputChange={(event, newInputValue) => {
                setCustomerPhone(newInputValue);
              }}
              onChange={(event, newValue) => {
                if (newValue && typeof newValue !== 'string') {
                  handleCustomerSelect(newValue);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Enter phone number"
                  error={!!errors.customerPhone}
                  helperText={errors.customerPhone}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                        <PhoneIcon sx={{ color: colors.black[400], mr: 1 }} />
                        {isValidating && <CircularProgress size={16} />}
                      </Box>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {option.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.phone}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {option.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{
                            backgroundColor: tag === 'VIP' ? colors.yellow[500] : colors.info,
                            color: 'white',
                            fontSize: '0.7rem',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              )}
            />
            {customer && (
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon sx={{ color: colors.success, fontSize: 16 }} />
                <Typography variant="caption" color="text.secondary">
                  Customer found
                </Typography>
                <Button
                  size="small"
                  startIcon={<HistoryIcon />}
                  onClick={() => setShowRecentOrders(true)}
                  sx={{ ml: 'auto' }}
                >
                  Show Recent Orders
                </Button>
              </Box>
            )}
          </Box>

          {/* Customer Name */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Customer Name *
            </Typography>
            <TextField
              fullWidth
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              error={!!errors.customerName}
              helperText={errors.customerName}
              InputProps={{
                startAdornment: <PersonIcon sx={{ color: colors.black[400], mr: 1 }} />,
              }}
            />
          </Box>

          {/* Order Type */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Order Type *
            </Typography>
            <FormControl fullWidth error={!!errors.orderType}>
              <Select
                value={orderType}
                onChange={(e) => handleOrderTypeChange(e.target.value)}
                displayEmpty
                startAdornment={
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                    {orderType && orderTypes.find(t => t.value === orderType)?.icon && 
                     React.createElement(orderTypes.find(t => t.value === orderType)!.icon, {
                       sx: { color: colors.black[400] }
                     })
                    }
                  </Box>
                }
              >
                <MenuItem value="" disabled>
                  Select order type
                </MenuItem>
                {orderTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <type.icon sx={{ color: colors.black[400] }} />
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.orderType && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.orderType}
                </Typography>
              )}
            </FormControl>
          </Box>

          {/* Address (Delivery only) */}
          {orderType === 'delivery' && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Delivery Address *
              </Typography>
              {customer && customer.addresses.length > 0 ? (
                <RadioGroup
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                >
                  {customer.addresses.map((address) => (
                    <FormControlLabel
                      key={address.id}
                      value={address.id}
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationIcon sx={{ color: colors.black[400], fontSize: 16 }} />
                          <Box>
                            <Typography variant="body2">
                              {address.address}
                            </Typography>
                            <Chip
                              label={address.tag}
                              size="small"
                              sx={{
                                backgroundColor: address.isDefault ? colors.yellow[500] : colors.info,
                                color: 'white',
                                fontSize: '0.7rem',
                                mt: 0.5,
                              }}
                            />
                          </Box>
                          <IconButton size="small" sx={{ ml: 'auto' }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      }
                      sx={{
                        border: `1px solid ${colors.white[600]}`,
                        borderRadius: 1,
                        p: 1,
                        mb: 1,
                        '&.Mui-checked': {
                          borderColor: colors.yellow[500],
                          backgroundColor: alpha(colors.yellow[500], 0.05),
                        },
                      }}
                    />
                  ))}
                </RadioGroup>
              ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                  No saved addresses found. Please add a new address.
                </Alert>
              )}
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
              >
                Add New Address
              </Button>
              {errors.address && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {errors.address}
                </Typography>
              )}
            </Box>
          )}

          {/* Branch */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Branch *
            </Typography>
            <FormControl fullWidth error={!!errors.branch}>
              <Select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                startAdornment={
                  <StoreIcon sx={{ color: colors.black[400], mr: 1 }} />
                }
              >
                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    <Box>
                      <Typography variant="body2">{branch.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {branch.address}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.branch && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.branch}
                </Typography>
              )}
            </FormControl>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={isLoading}
        >
          Close
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isFormValid() || isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
          sx={{
            backgroundColor: colors.yellow[500],
            color: colors.black[800],
            '&:hover': {
              backgroundColor: colors.yellow[400],
            },
            '&:disabled': {
              backgroundColor: colors.white[400],
              color: colors.black[400],
            },
          }}
        >
          {isLoading ? 'Creating...' : 'Save'}
        </Button>
      </DialogActions>

      {/* Recent Orders Drawer */}
      <Dialog
        open={showRecentOrders}
        onClose={() => setShowRecentOrders(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Recent Orders - {customer?.name}
        </DialogTitle>
        <DialogContent>
          <List>
            {customer?.recentOrders.map((order) => (
              <ListItem key={order.id} divider>
                <ListItemIcon>
                  <HistoryIcon />
                </ListItemIcon>
                <ListItemText
                  primary={`Order #${order.id}`}
                  secondary={`${order.date.toLocaleDateString()} - SAR ${order.total.toFixed(2)}`}
                />
                <ListItemSecondaryAction>
                  <Chip
                    label={order.status}
                    size="small"
                    color={order.status === 'Delivered' ? 'success' : 'warning'}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRecentOrders(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default NewOrderModal; 