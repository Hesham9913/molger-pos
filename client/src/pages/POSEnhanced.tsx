import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Avatar,
  Badge,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  Tooltip,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Print as PrintIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  AccountBalance as WalletIcon,
  CreditCard as CardIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as DeliveryIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Loyalty as LoyaltyIcon,
  ShoppingCart as ShoppingCartIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  ContentCopy as DuplicateIcon,
  Reorder as ReorderIcon,
  Block as BlockIcon,
  Star as StarIcon,
  WhatsApp as WhatsAppIcon,
  Sms as SmsIcon,
  History as HistoryIcon,
  Note as NoteIcon,
  Map as MapIcon,
  Timer as TimerIcon,
  Assignment as AssignmentIcon,
  DirectionsCar as CarIcon,
  AccessTime as TimeIcon,
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
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon,
  PersonAdd as PersonAddIcon,
  Discount as DiscountIcon,
  Percent as PercentIcon,
  Calculate as CalculateIcon,
  Cancel as CancelIcon,
  Check as CheckIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  StarBorder as StarBorderIcon,
  LocalOffer as LocalOfferIcon,
  Inventory as InventoryIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { format } from 'date-fns';
import { colors } from '../theme/modernTheme';
import { alpha } from '@mui/material/styles';

// Enhanced POS with extreme detail
const POSEnhanced: React.FC = () => {
  // State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [shiftOpen, setShiftOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Mock data
  const categories = [
    { id: 'all', name: 'All Products', icon: '🍽️' },
    { id: 'burgers', name: 'Burgers', icon: '🍔' },
    { id: 'pizza', name: 'Pizza', icon: '🍕' },
    { id: 'drinks', name: 'Drinks', icon: '🥤' },
    { id: 'sides', name: 'Sides', icon: '🍟' },
    { id: 'desserts', name: 'Desserts', icon: '🍰' },
  ];

  const products = [
    {
      id: 'PROD-001',
      name: 'Chicken Burger',
      category: 'burgers',
      price: 45.00,
      cost: 15.00,
      image: '🍔',
      stock: 25,
      isFavorite: true,
      isPromo: false,
      modifiers: ['Cheese', 'Bacon', 'Extra Sauce'],
      description: 'Grilled chicken breast with fresh vegetables',
    },
    {
      id: 'PROD-002',
      name: 'Beef Burger',
      category: 'burgers',
      price: 55.00,
      cost: 20.00,
      image: '🍔',
      stock: 15,
      isFavorite: false,
      isPromo: true,
      modifiers: ['Cheese', 'Bacon', 'Extra Sauce'],
      description: 'Premium beef patty with signature sauce',
    },
    {
      id: 'PROD-003',
      name: 'Margherita Pizza',
      category: 'pizza',
      price: 65.00,
      cost: 25.00,
      image: '🍕',
      stock: 8,
      isFavorite: true,
      isPromo: false,
      modifiers: ['Extra Cheese', 'Mushrooms', 'Pepperoni'],
      description: 'Classic tomato sauce with mozzarella',
    },
    {
      id: 'PROD-004',
      name: 'Coca Cola',
      category: 'drinks',
      price: 10.00,
      cost: 3.00,
      image: '🥤',
      stock: 50,
      isFavorite: false,
      isPromo: false,
      modifiers: ['Ice', 'Lemon'],
      description: 'Refreshing carbonated beverage',
    },
    {
      id: 'PROD-005',
      name: 'French Fries',
      category: 'sides',
      price: 15.00,
      cost: 5.00,
      image: '🍟',
      stock: 30,
      isFavorite: false,
      isPromo: false,
      modifiers: ['Salt', 'Ketchup', 'Mayo'],
      description: 'Crispy golden fries',
    },
    {
      id: 'PROD-006',
      name: 'Chocolate Cake',
      category: 'desserts',
      price: 25.00,
      cost: 10.00,
      image: '🍰',
      stock: 5,
      isFavorite: true,
      isPromo: false,
      modifiers: ['Extra Chocolate', 'Whipped Cream'],
      description: 'Rich chocolate cake with cream',
    },
  ];

  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: MoneyIcon },
    { id: 'card', name: 'Card', icon: CardIcon },
    { id: 'wallet', name: 'Wallet', icon: WalletIcon },
    { id: 'loyalty', name: 'Loyalty Points', icon: LoyaltyIcon },
  ];

  // Handlers
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleProductClick = (product: any) => {
    const existingItem = cartItems.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setCartItems(prev => prev.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems(prev => [...prev, { product, quantity: 1, notes: '', modifiers: [] }]);
    }
  };

  const handleQuantityChange = (productId: string, change: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) {
          return null;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean));
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    setShowCustomerDialog(false);
  };

  const handlePayment = () => {
    if (cartItems.length === 0) return;
    setShowPaymentDialog(true);
  };

  const handlePaymentComplete = () => {
    // Process payment and create order
    console.log('Processing payment...');
    setShowPaymentDialog(false);
    setCartItems([]);
    setSelectedCustomer(null);
    setPaymentAmount('');
  };

  const handleDiscount = () => {
    setShowDiscountDialog(true);
  };

  const handleHold = () => {
    console.log('Holding order...');
  };

  const handleRecall = () => {
    console.log('Recalling held orders...');
  };

  // Keyboard shortcuts
  useHotkeys('f1', () => console.log('Open help'));
  useHotkeys('f2', () => setShowCustomerDialog(true));
  useHotkeys('f3', () => handleDiscount());
  useHotkeys('f4', () => handlePayment());
  useHotkeys('f5', () => handleHold());
  useHotkeys('f6', () => handleRecall());
  useHotkeys('f7', () => console.log('Print receipt'));
  useHotkeys('f8', () => console.log('Open drawer'));
  useHotkeys('f9', () => console.log('Close shift'));
  useHotkeys('f10', () => console.log('Open settings'));

  // Filtered products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Cart calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.15; // 15% VAT
  const total = subtotal + tax;

  const getStockColor = (stock: number) => {
    if (stock === 0) return colors.error;
    if (stock <= 5) return colors.warning;
    return colors.success;
  };

  const getStockLabel = (stock: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 5) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${colors.white[600]}`,
          backgroundColor: colors.white[50],
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={3}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.black[800] }}>
              POS Terminal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Main Branch - Riyadh
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                placeholder="Search products, barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                sx={{
                  width: 300,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: colors.white[100],
                    '&:hover': {
                      backgroundColor: colors.white[200],
                    },
                    '&.Mui-focused': {
                      backgroundColor: colors.white[50],
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.yellow[500],
                      },
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: colors.black[400] }} />
                    </InputAdornment>
                  ),
                }}
              />
              <IconButton
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                sx={{ color: colors.black[400] }}
              >
                {viewMode === 'grid' ? <ViewListIcon /> : <ViewModuleIcon />}
              </IconButton>
              <IconButton sx={{ color: colors.black[400] }}>
                <FilterIcon />
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
              <Chip
                label={shiftOpen ? 'Shift Open' : 'Shift Closed'}
                color={shiftOpen ? 'success' : 'error'}
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                Cashier: Ahmed
              </Typography>
              <IconButton
                onClick={() => setSoundEnabled(!soundEnabled)}
                sx={{
                  color: soundEnabled ? colors.yellow[600] : colors.black[400],
                }}
              >
                {soundEnabled ? <SoundIcon /> : <MuteIcon />}
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Product Grid */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Category Tabs */}
          <Box sx={{ borderBottom: `1px solid ${colors.white[600]}` }}>
            <Tabs
              value={selectedCategory}
              onChange={(_, newValue) => handleCategoryChange(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  minWidth: 120,
                },
              }}
            >
              {categories.map((category) => (
                <Tab
                  key={category.id}
                  value={category.id}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Box>

          {/* Product Grid */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <Grid container spacing={2}>
              {filteredProducts.map((product) => (
                <Grid item xs={viewMode === 'grid' ? 3 : 12} key={product.id}>
                  <Card
                    sx={{
                      height: viewMode === 'grid' ? 200 : 80,
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                      },
                      display: 'flex',
                      flexDirection: viewMode === 'grid' ? 'column' : 'row',
                      alignItems: viewMode === 'grid' ? 'center' : 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      opacity: product.stock === 0 ? 0.5 : 1,
                    }}
                    onClick={() => handleProductClick(product)}
                  >
                    <CardContent sx={{ textAlign: 'center', p: viewMode === 'grid' ? 2 : 1 }}>
                      <Typography variant="h3" sx={{ mb: 1 }}>
                        {product.image}
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {product.description}
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color={colors.yellow[600]}>
                        SAR {product.price.toFixed(2)}
                      </Typography>
                      
                      {/* Stock indicator */}
                      <Chip
                        label={getStockLabel(product.stock)}
                        size="small"
                        sx={{
                          backgroundColor: alpha(getStockColor(product.stock), 0.1),
                          color: getStockColor(product.stock),
                          fontSize: '0.625rem',
                          mt: 1,
                        }}
                      />

                      {/* Badges */}
                      <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                        {product.isFavorite && (
                          <StarIcon sx={{ color: colors.yellow[500], fontSize: 16 }} />
                        )}
                        {product.isPromo && (
                          <LocalOfferIcon sx={{ color: colors.error, fontSize: 16 }} />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* Order Cart */}
        <Box
          sx={{
            width: 400,
            borderLeft: `1px solid ${colors.white[600]}`,
            backgroundColor: colors.white[50],
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Cart Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: `1px solid ${colors.white[600]}`,
              backgroundColor: colors.white[100],
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Order Cart
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PersonAddIcon />}
                onClick={() => setShowCustomerDialog(true)}
              >
                {selectedCustomer ? selectedCustomer.name : 'Add Customer'}
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DiscountIcon />}
                onClick={handleDiscount}
              >
                Discount
              </Button>
            </Box>
          </Box>

          {/* Cart Items */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {cartItems.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: colors.black[400],
                }}
              >
                <ShoppingCartIcon sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6">Cart is Empty</Typography>
                <Typography variant="body2">Add products to start an order</Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {cartItems.map((item, index) => (
                  <ListItem
                    key={item.product.id}
                    sx={{
                      border: `1px solid ${colors.white[600]}`,
                      borderRadius: 2,
                      mb: 1,
                      backgroundColor: colors.white[50],
                    }}
                  >
                    <ListItemText
                      primary={item.product.name}
                      secondary={`SAR ${item.product.price.toFixed(2)} each`}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                      secondaryTypographyProps={{ fontSize: '0.75rem' }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item.product.id, -1)}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography variant="body2" fontWeight={600} sx={{ minWidth: 30, textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item.product.id, 1)}
                      >
                        <AddIcon />
                      </IconButton>
                      <Typography variant="body2" fontWeight={600} sx={{ minWidth: 60, textAlign: 'right' }}>
                        SAR {(item.product.price * item.quantity).toFixed(2)}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveItem(item.product.id)}
                        sx={{ color: colors.error }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {/* Cart Summary */}
          <Box
            sx={{
              p: 2,
              borderTop: `1px solid ${colors.white[600]}`,
              backgroundColor: colors.white[100],
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Subtotal</Typography>
                <Typography variant="body2">SAR {subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">VAT (15%)</Typography>
                <Typography variant="body2">SAR {tax.toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={600}>Total</Typography>
                <Typography variant="h6" fontWeight={600} color={colors.yellow[600]}>
                  SAR {total.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleHold}
                disabled={cartItems.length === 0}
              >
                Hold
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleRecall}
              >
                Recall
              </Button>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handlePayment}
              disabled={cartItems.length === 0}
              sx={{
                backgroundColor: colors.yellow[500],
                color: colors.black[800],
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: colors.yellow[400],
                },
              }}
            >
              Pay Now
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Payment Dialog */}
      <Dialog
        open={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Payment
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Payment Method
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                {paymentMethods.map((method) => (
                  <Button
                    key={method.id}
                    variant={paymentMethod === method.id ? 'contained' : 'outlined'}
                    onClick={() => setPaymentMethod(method.id)}
                    startIcon={<method.icon />}
                    sx={{
                      backgroundColor: paymentMethod === method.id ? colors.yellow[500] : 'transparent',
                      color: paymentMethod === method.id ? colors.black[800] : colors.black[700],
                      '&:hover': {
                        backgroundColor: paymentMethod === method.id ? colors.yellow[400] : colors.white[200],
                      },
                    }}
                  >
                    {method.name}
                  </Button>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Amount
              </Typography>
              <TextField
                fullWidth
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={`Total: SAR ${total.toFixed(2)}`}
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">SAR</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Order Summary
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {cartItems.map((item) => (
                      <TableRow key={item.product.id}>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">SAR {(item.product.price * item.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} sx={{ fontWeight: 600 }}>Total</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        SAR {total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPaymentDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePaymentComplete}
            sx={{
              backgroundColor: colors.yellow[500],
              color: colors.black[800],
              '&:hover': {
                backgroundColor: colors.yellow[400],
              },
            }}
          >
            Complete Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Customer Dialog */}
      <Dialog
        open={showCustomerDialog}
        onClose={() => setShowCustomerDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Select Customer
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Search customers..."
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <List>
            {[
              { id: 'CUST-001', name: 'Ahmed Al-Rashid', phone: '+966501234567', loyaltyPoints: 450 },
              { id: 'CUST-002', name: 'Fatima Hassan', phone: '+966509876543', loyaltyPoints: 120 },
              { id: 'CUST-003', name: 'Mohammed Ali', phone: '+966507654321', loyaltyPoints: 890 },
            ].map((customer) => (
              <ListItem
                key={customer.id}
                button
                onClick={() => handleCustomerSelect(customer)}
                sx={{
                  border: `1px solid ${colors.white[600]}`,
                  borderRadius: 2,
                  mb: 1,
                }}
              >
                <ListItemText
                  primary={customer.name}
                  secondary={`${customer.phone} • ${customer.loyaltyPoints} points`}
                />
                <Chip
                  label="VIP"
                  size="small"
                  sx={{
                    backgroundColor: alpha(colors.yellow[500], 0.1),
                    color: colors.yellow[700],
                  }}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCustomerDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => setShowCustomerDialog(false)}
            sx={{
              backgroundColor: colors.yellow[500],
              color: colors.black[800],
              '&:hover': {
                backgroundColor: colors.yellow[400],
              },
            }}
          >
            Add New Customer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Discount Dialog */}
      <Dialog
        open={showDiscountDialog}
        onClose={() => setShowDiscountDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Apply Discount
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Discount Type
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" startIcon={<PercentIcon />}>
                  Percentage
                </Button>
                <Button variant="outlined" startIcon={<MoneyIcon />}>
                  Fixed Amount
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                placeholder="Enter discount amount"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">SAR</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDiscountDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => setShowDiscountDialog(false)}
            sx={{
              backgroundColor: colors.yellow[500],
              color: colors.black[800],
              '&:hover': {
                backgroundColor: colors.yellow[400],
              },
            }}
          >
            Apply Discount
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default POSEnhanced;
