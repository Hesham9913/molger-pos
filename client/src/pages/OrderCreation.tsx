import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Badge,
  Tooltip,
  Alert,
  CircularProgress,
  Avatar,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Store as StoreIcon,
  LocalShipping as DeliveryIcon,
  TakeoutDining as PickupIcon,
  Restaurant as DineInIcon,
  Schedule as ScheduleIcon,
  Note as NoteIcon,
  Receipt as ReceiptIcon,
  Kitchen as KitchenIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  History as HistoryIcon,
  Insights as InsightsIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme/modernTheme';
import { alpha } from '@mui/material/styles';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  isFavorite: boolean;
  modifiers: Modifier[];
}

interface Modifier {
  id: string;
  name: string;
  price: number;
  required: boolean;
}

interface Category {
  id: string;
  name: string;
  image: string;
  productCount: number;
}

interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedModifiers: Modifier[];
  notes: string;
  totalPrice: number;
}

interface OrderCreationProps {
  orderData: any;
  onBack: () => void;
}

const OrderCreation: React.FC<OrderCreationProps> = ({ orderData, onBack }) => {
  const navigate = useNavigate();
  
  // State
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerNotes, setCustomerNotes] = useState('');
  const [receiptNotes, setReceiptNotes] = useState('');
  const [kitchenNotes, setKitchenNotes] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [scheduledTime, setScheduledTime] = useState<Date | null>(null);
  const [showCustomerInsights, setShowCustomerInsights] = useState(false);
  const [showQuantityDialog, setShowQuantityDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data
  const categories: Category[] = [
    { id: '1', name: 'Burgers', image: '🍔', productCount: 8 },
    { id: '2', name: 'Pizza', image: '🍕', productCount: 12 },
    { id: '3', name: 'Drinks', image: '🥤', productCount: 15 },
    { id: '4', name: 'Sides', image: '🍟', productCount: 6 },
    { id: '5', name: 'Desserts', image: '🍰', productCount: 4 },
  ];

  const products: Product[] = [
    {
      id: '1',
      name: 'Beef Burger',
      description: 'Premium beef patty with fresh vegetables',
      price: 25.00,
      image: '🍔',
      category: '1',
      inStock: true,
      isFavorite: true,
      modifiers: [
        { id: '1', name: 'Extra Cheese', price: 2.00, required: false },
        { id: '2', name: 'Bacon', price: 3.00, required: false },
        { id: '3', name: 'Extra Sauce', price: 1.00, required: false },
      ],
    },
    {
      id: '2',
      name: 'Chicken Burger',
      description: 'Grilled chicken breast with signature sauce',
      price: 22.00,
      image: '🍔',
      category: '1',
      inStock: true,
      isFavorite: false,
      modifiers: [
        { id: '1', name: 'Extra Cheese', price: 2.00, required: false },
        { id: '2', name: 'Bacon', price: 3.00, required: false },
      ],
    },
    {
      id: '3',
      name: 'Margherita Pizza',
      description: 'Classic tomato sauce with mozzarella',
      price: 35.00,
      image: '🍕',
      category: '2',
      inStock: true,
      isFavorite: true,
      modifiers: [
        { id: '4', name: 'Extra Cheese', price: 3.00, required: false },
        { id: '5', name: 'Mushrooms', price: 2.00, required: false },
      ],
    },
    {
      id: '4',
      name: 'Coca Cola',
      description: 'Refreshing carbonated beverage',
      price: 8.00,
      image: '🥤',
      category: '3',
      inStock: true,
      isFavorite: false,
      modifiers: [],
    },
  ];

  // Filtered products
  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * 0.15; // 15% VAT
  const total = subtotal + tax;

  // Handle product selection
  const handleProductClick = (product: Product) => {
    if (!product.inStock) return;
    
    setSelectedProduct(product);
    setSelectedQuantity(1);
    setShowQuantityDialog(true);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!selectedProduct) return;

    const newItem: CartItem = {
      id: `${selectedProduct.id}-${Date.now()}`,
      product: selectedProduct,
      quantity: selectedQuantity,
      selectedModifiers: [],
      notes: '',
      totalPrice: selectedProduct.price * selectedQuantity,
    };

    setCart([...cart, newItem]);
    setShowQuantityDialog(false);
    setSelectedProduct(null);
  };

  // Handle remove from cart
  const handleRemoveFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  // Handle quantity change
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }

    setCart(cart.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: item.product.price * newQuantity,
        };
      }
      return item;
    }));
  };

  // Handle submit order
  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // Navigate to success page or back to call center
      navigate('/call-center');
      setIsSubmitting(false);
    }, 2000);
  };

  // Handle save as draft
  const handleSaveDraft = () => {
    // Save order as draft
    console.log('Saving as draft...');
  };

  // Keyboard shortcuts
  useHotkeys('escape', () => {
    if (showQuantityDialog) {
      setShowQuantityDialog(false);
    } else {
      onBack();
    }
  });

  useHotkeys('ctrl+enter, cmd+enter', () => {
    if (cart.length > 0) {
      handleSubmitOrder();
    }
  });

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: `1px solid ${colors.white[600]}`,
        backgroundColor: colors.white[50],
      }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <IconButton onClick={onBack} size="small">
              <ArrowBackIcon />
            </IconButton>
          </Grid>
          <Grid item xs>
            <Typography variant="h5" sx={{ fontWeight: 700, color: colors.black[800] }}>
              New Order - {orderData.customerName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {orderData.orderType} • {orderData.selectedBranch}
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<InsightsIcon />}
              onClick={() => setShowCustomerInsights(true)}
            >
              Customer Insights
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Sidebar - Customer Info & Cart */}
        <Box sx={{ width: 350, borderRight: `1px solid ${colors.white[600]}`, display: 'flex', flexDirection: 'column' }}>
          {/* Customer Summary */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${colors.white[600]}` }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Customer Summary
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ mr: 2 }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {orderData.customerName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {orderData.customerPhone}
                </Typography>
                {orderData.customer?.tags && (
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                    {orderData.customer.tags.map((tag: string) => (
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
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <StoreIcon sx={{ mr: 1, color: colors.black[400] }} />
              <Typography variant="body2">
                Branch: {orderData.selectedBranch}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {orderData.orderType === 'delivery' ? (
                <DeliveryIcon sx={{ mr: 1, color: colors.black[400] }} />
              ) : orderData.orderType === 'pickup' ? (
                <PickupIcon sx={{ mr: 1, color: colors.black[400] }} />
              ) : (
                <DineInIcon sx={{ mr: 1, color: colors.black[400] }} />
              )}
              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                {orderData.orderType}
              </Typography>
            </Box>

            {orderData.orderType === 'delivery' && orderData.selectedAddress && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationIcon sx={{ mr: 1, color: colors.black[400] }} />
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  {orderData.customer?.addresses.find((a: any) => a.id === orderData.selectedAddress)?.address}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Order Details */}
          <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Order Details
            </Typography>

            {/* Customer Notes */}
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Add customer notes..."
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              sx={{ mb: 2 }}
            />

            {/* Schedule Order */}
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ScheduleIcon />}
              sx={{ mb: 2 }}
            >
              Schedule the order
            </Button>

            {/* Cart Items */}
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Order Items ({cart.length})
            </Typography>

            {cart.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CartIcon sx={{ fontSize: 48, color: colors.black[300], mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  No items added yet
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {cart.map((item) => (
                  <ListItem key={item.id} sx={{ px: 0, py: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Typography variant="h4" sx={{ mr: 2 }}>
                        {item.product.image}
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          SAR {item.product.price.toFixed(2)} × {item.quantity}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveFromCart(item.id)}
                          sx={{ color: colors.error }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}

            {/* Totals */}
            {cart.length > 0 && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: colors.white[100], borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2">SAR {subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">VAT (15%):</Typography>
                  <Typography variant="body2">SAR {tax.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: colors.yellow[600] }}>
                    SAR {total.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ p: 2, borderTop: `1px solid ${colors.white[600]}` }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Payment Mode</InputLabel>
              <Select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                label="Payment Mode"
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="card">Card</MenuItem>
                <MenuItem value="online">Online</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Receipt Notes..."
              value={receiptNotes}
              onChange={(e) => setReceiptNotes(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Kitchen Notes..."
              value={kitchenNotes}
              onChange={(e) => setKitchenNotes(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={cart.length === 0 || !paymentMode || isSubmitting}
              onClick={handleSubmitOrder}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
              sx={{
                backgroundColor: colors.yellow[500],
                color: colors.black[800],
                mb: 1,
                '&:hover': {
                  backgroundColor: colors.yellow[400],
                },
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Order'}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleSaveDraft}
              startIcon={<SaveIcon />}
            >
              Save as Draft
            </Button>
          </Box>
        </Box>

        {/* Main Content - Products */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Search and Filters */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${colors.white[600]}` }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <TextField
                  fullWidth
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: colors.black[400], mr: 1 }} />,
                  }}
                />
              </Grid>
              <Grid item>
                <IconButton
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  sx={{ color: colors.black[400] }}
                >
                  {viewMode === 'grid' ? <ViewListIcon /> : <ViewModuleIcon />}
                </IconButton>
              </Grid>
            </Grid>
          </Box>

          {/* Categories */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${colors.white[600]}` }}>
            <Box sx={{ display: 'flex', gap: 1, overflow: 'auto' }}>
              <Chip
                label="All"
                onClick={() => setSelectedCategory('')}
                color={selectedCategory === '' ? 'primary' : 'default'}
                sx={{ minWidth: 80 }}
              />
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  label={`${category.image} ${category.name}`}
                  onClick={() => setSelectedCategory(category.id)}
                  color={selectedCategory === category.id ? 'primary' : 'default'}
                  sx={{ minWidth: 100 }}
                />
              ))}
            </Box>
          </Box>

          {/* Products Grid */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <Grid container spacing={2}>
              {filteredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <Card
                    sx={{
                      cursor: product.inStock ? 'pointer' : 'not-allowed',
                      opacity: product.inStock ? 1 : 0.5,
                      transition: 'all 0.2s ease',
                      '&:hover': product.inStock ? {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                      } : {},
                    }}
                    onClick={() => handleProductClick(product)}
                  >
                    <CardMedia
                      component="div"
                      sx={{
                        height: 120,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 48,
                        backgroundColor: colors.white[100],
                      }}
                    >
                      {product.image}
                    </CardMedia>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
                          {product.name}
                        </Typography>
                        <IconButton size="small">
                          {product.isFavorite ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                        </IconButton>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        {product.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: colors.yellow[600] }}>
                          SAR {product.price.toFixed(2)}
                        </Typography>
                        {!product.inStock && (
                          <Chip label="Out of Stock" size="small" color="error" />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Box>

      {/* Quantity Dialog */}
      <Dialog
        open={showQuantityDialog}
        onClose={() => setShowQuantityDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Add to Order
        </DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h1" sx={{ mb: 2 }}>
                {selectedProduct.image}
              </Typography>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {selectedProduct.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedProduct.description}
              </Typography>
              <Typography variant="h6" sx={{ color: colors.yellow[600], mb: 2 }}>
                SAR {selectedProduct.price.toFixed(2)}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <IconButton
                  onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                >
                  <RemoveIcon />
                </IconButton>
                <Typography variant="h5" sx={{ minWidth: 40, textAlign: 'center' }}>
                  {selectedQuantity}
                </Typography>
                <IconButton
                  onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQuantityDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddToCart}
            variant="contained"
            sx={{
              backgroundColor: colors.yellow[500],
              color: colors.black[800],
              '&:hover': {
                backgroundColor: colors.yellow[400],
              },
            }}
          >
            Add to Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Customer Insights Dialog */}
      <Dialog
        open={showCustomerInsights}
        onClose={() => setShowCustomerInsights(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Customer Insights - {orderData.customerName}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Customer buying history and preferences will be displayed here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCustomerInsights(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderCreation;
