import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Avatar,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Archive as ArchiveIcon,
  Visibility as ViewIcon,
  VisibilityOff as ViewOffIcon,
  Star as StarIcon,
  LocalOffer as LocalOfferIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Restaurant as MenuIcon,
  Extension as ModifierIcon,
  CardGiftcard as GiftCardIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  DragIndicator as DragIcon,
  Sort as SortIcon,
  FilterList as FilterListIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  GridView as GridViewIcon,
  List as ListViewIcon,
  SortByAlpha as SortAlphaIcon,
  SortByAlpha as SortAlphaDescIcon,
  AttachMoney as PriceIcon,
  Schedule as TimeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Loyalty as LoyaltyIcon,
  ShoppingCart as ShoppingCartIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Keyboard as KeyboardIcon,
  VolumeUp as SoundIcon,
  VolumeOff as MuteIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { format } from 'date-fns';
import { colors } from '../theme/modernTheme';
import { alpha } from '@mui/material/styles';

// Enhanced Menu Management with extreme detail
const MenuManagement: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Mock data
  const products = [
    {
      id: 'PROD-001',
      name: 'Chicken Burger',
      category: 'Burgers',
      price: 45.00,
      cost: 15.00,
      status: 'active',
      stock: 25,
      isPromo: false,
      isFavorite: true,
      modifiers: ['Cheese', 'Bacon', 'Extra Sauce'],
      description: 'Grilled chicken breast with fresh vegetables',
      image: '🍔',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
    },
    {
      id: 'PROD-002',
      name: 'Beef Burger',
      category: 'Burgers',
      price: 55.00,
      cost: 20.00,
      status: 'active',
      stock: 15,
      isPromo: true,
      isFavorite: false,
      modifiers: ['Cheese', 'Bacon', 'Extra Sauce'],
      description: 'Premium beef patty with signature sauce',
      image: '🍔',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18'),
    },
    {
      id: 'PROD-003',
      name: 'Margherita Pizza',
      category: 'Pizza',
      price: 65.00,
      cost: 25.00,
      status: 'active',
      stock: 8,
      isPromo: false,
      isFavorite: true,
      modifiers: ['Extra Cheese', 'Mushrooms', 'Pepperoni'],
      description: 'Classic tomato sauce with mozzarella',
      image: '🍕',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-19'),
    },
    {
      id: 'PROD-004',
      name: 'Coca Cola',
      category: 'Drinks',
      price: 10.00,
      cost: 3.00,
      status: 'active',
      stock: 50,
      isPromo: false,
      isFavorite: false,
      modifiers: ['Ice', 'Lemon'],
      description: 'Refreshing carbonated beverage',
      image: '🥤',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: 'PROD-005',
      name: 'French Fries',
      category: 'Sides',
      price: 15.00,
      cost: 5.00,
      status: 'active',
      stock: 30,
      isPromo: false,
      isFavorite: false,
      modifiers: ['Salt', 'Ketchup', 'Mayo'],
      description: 'Crispy golden fries',
      image: '🍟',
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-16'),
    },
  ];

  const categories = [
    { id: 'CAT-001', name: 'Burgers', description: 'All burger items', itemCount: 5, status: 'active' },
    { id: 'CAT-002', name: 'Pizza', description: 'All pizza items', itemCount: 3, status: 'active' },
    { id: 'CAT-003', name: 'Drinks', description: 'All beverage items', itemCount: 8, status: 'active' },
    { id: 'CAT-004', name: 'Sides', description: 'All side dishes', itemCount: 6, status: 'active' },
    { id: 'CAT-005', name: 'Desserts', description: 'All dessert items', itemCount: 4, status: 'active' },
  ];

  const menuGroups = [
    { id: 'GRP-001', name: 'Main Menu', description: 'Primary menu items', itemCount: 15, status: 'active' },
    { id: 'GRP-002', name: 'Kids Menu', description: 'Items for children', itemCount: 8, status: 'active' },
    { id: 'GRP-003', name: 'Breakfast', description: 'Morning menu items', itemCount: 12, status: 'active' },
    { id: 'GRP-004', name: 'Lunch Specials', description: 'Lunch time offers', itemCount: 10, status: 'active' },
  ];

  const combos = [
    { id: 'COMBO-001', name: 'Burger Combo', description: 'Burger + Fries + Drink', price: 75.00, status: 'active' },
    { id: 'COMBO-002', name: 'Pizza Combo', description: 'Pizza + Salad + Drink', price: 85.00, status: 'active' },
    { id: 'COMBO-003', name: 'Kids Combo', description: 'Small Burger + Fries + Juice', price: 45.00, status: 'active' },
  ];

  const modifiers = [
    { id: 'MOD-001', name: 'Extra Cheese', price: 5.00, category: 'Toppings', status: 'active' },
    { id: 'MOD-002', name: 'Bacon', price: 8.00, category: 'Toppings', status: 'active' },
    { id: 'MOD-003', name: 'Mushrooms', price: 3.00, category: 'Toppings', status: 'active' },
    { id: 'MOD-004', name: 'Extra Sauce', price: 2.00, category: 'Sauces', status: 'active' },
  ];

  const giftCards = [
    { id: 'GC-001', name: 'Birthday Gift Card', value: 100.00, status: 'active' },
    { id: 'GC-002', name: 'Holiday Gift Card', value: 50.00, status: 'active' },
    { id: 'GC-003', name: 'Corporate Gift Card', value: 200.00, status: 'active' },
  ];

  // Handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const handleAddItem = () => {
    setShowAddDialog(true);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setShowEditDialog(true);
  };

  const handleDeleteItem = (itemId: string) => {
    console.log('Deleting item:', itemId);
  };

  const handleDuplicateItem = (item: any) => {
    console.log('Duplicating item:', item);
  };

  const handleArchiveItem = (itemId: string) => {
    console.log('Archiving item:', itemId);
  };

  const handleBulkAction = (action: string) => {
    console.log('Bulk action:', action, 'on items:', selectedItems);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const currentData = getFilteredData();
      setSelectedItems(currentData.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getFilteredData = () => {
    let data = products;
    
    // Apply search filter
    if (searchQuery) {
      data = data.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      data = data.filter(item => item.status === filterStatus);
    }
    
    // Apply sorting
    data.sort((a, b) => {
      let aValue = a[sortBy as keyof typeof a];
      let bValue = b[sortBy as keyof typeof b];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return data;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.success;
      case 'inactive': return colors.error;
      case 'draft': return colors.warning;
      default: return colors.black[400];
    }
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return colors.error;
    if (stock <= 5) return colors.warning;
    return colors.success;
  };

  const renderProductsTab = () => (
    <Box>
      {/* Toolbar */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setFilterStatus(filterStatus === 'all' ? 'active' : 'all')}
          >
            {filterStatus === 'all' ? 'All' : 'Active Only'}
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            sx={{ color: colors.black[400] }}
          >
            {viewMode === 'grid' ? <ViewListIcon /> : <ViewModuleIcon />}
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddItem}
            sx={{
              backgroundColor: colors.yellow[500],
              color: colors.black[800],
              '&:hover': {
                backgroundColor: colors.yellow[400],
              },
            }}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Products Grid/List */}
      {viewMode === 'grid' ? (
        <Grid container spacing={2}>
          {getFilteredData().map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card
                sx={{
                  height: 280,
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                  },
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h3" sx={{ fontSize: '2rem' }}>
                      {product.image}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {product.isFavorite && (
                        <StarIcon sx={{ color: colors.yellow[500], fontSize: 16 }} />
                      )}
                      {product.isPromo && (
                        <LocalOfferIcon sx={{ color: colors.error, fontSize: 16 }} />
                      )}
                    </Box>
                  </Box>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {product.description}
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color={colors.yellow[600]} sx={{ mb: 1 }}>
                    SAR {product.price.toFixed(2)}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={product.status}
                      size="small"
                      sx={{
                        backgroundColor: alpha(getStatusColor(product.status), 0.1),
                        color: getStatusColor(product.status),
                      }}
                    />
                    <Chip
                      label={`Stock: ${product.stock}`}
                      size="small"
                      sx={{
                        backgroundColor: alpha(getStockColor(product.stock), 0.1),
                        color: getStockColor(product.stock),
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedItems.length > 0 && selectedItems.length < getFilteredData().length}
                    checked={selectedItems.length === getFilteredData().length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredData().map((product) => (
                <TableRow key={product.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedItems.includes(product.id)}
                      onChange={() => handleSelectItem(product.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h4">{product.image}</Typography>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {product.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight={600} color={colors.yellow[600]}>
                      SAR {product.price.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={product.stock}
                      size="small"
                      sx={{
                        backgroundColor: alpha(getStockColor(product.stock), 0.1),
                        color: getStockColor(product.stock),
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.status}
                      size="small"
                      sx={{
                        backgroundColor: alpha(getStatusColor(product.status), 0.1),
                        color: getStatusColor(product.status),
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small">
                      <MoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  const renderCategoriesTab = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Categories</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddItem}
          sx={{
            backgroundColor: colors.yellow[500],
            color: colors.black[800],
            '&:hover': {
              backgroundColor: colors.yellow[400],
            },
          }}
        >
          Add Category
        </Button>
      </Box>
      <Grid container spacing={2}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                  {category.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {category.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip label={`${category.itemCount} items`} size="small" />
                  <Chip
                    label={category.status}
                    size="small"
                    sx={{
                      backgroundColor: alpha(getStatusColor(category.status), 0.1),
                      color: getStatusColor(category.status),
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderMenuGroupsTab = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Menu Groups</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddItem}
          sx={{
            backgroundColor: colors.yellow[500],
            color: colors.black[800],
            '&:hover': {
              backgroundColor: colors.yellow[400],
            },
          }}
        >
          Add Menu Group
        </Button>
      </Box>
      <Grid container spacing={2}>
        {menuGroups.map((group) => (
          <Grid item xs={12} sm={6} md={4} key={group.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                  {group.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {group.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip label={`${group.itemCount} items`} size="small" />
                  <Chip
                    label={group.status}
                    size="small"
                    sx={{
                      backgroundColor: alpha(getStatusColor(group.status), 0.1),
                      color: getStatusColor(group.status),
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderCombosTab = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Combos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddItem}
          sx={{
            backgroundColor: colors.yellow[500],
            color: colors.black[800],
            '&:hover': {
              backgroundColor: colors.yellow[400],
            },
          }}
        >
          Add Combo
        </Button>
      </Box>
      <Grid container spacing={2}>
        {combos.map((combo) => (
          <Grid item xs={12} sm={6} md={4} key={combo.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                  {combo.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {combo.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight={700} color={colors.yellow[600]}>
                    SAR {combo.price.toFixed(2)}
                  </Typography>
                  <Chip
                    label={combo.status}
                    size="small"
                    sx={{
                      backgroundColor: alpha(getStatusColor(combo.status), 0.1),
                      color: getStatusColor(combo.status),
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderModifiersTab = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Modifiers</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddItem}
          sx={{
            backgroundColor: colors.yellow[500],
            color: colors.black[800],
            '&:hover': {
              backgroundColor: colors.yellow[400],
            },
          }}
        >
          Add Modifier
        </Button>
      </Box>
      <Grid container spacing={2}>
        {modifiers.map((modifier) => (
          <Grid item xs={12} sm={6} md={4} key={modifier.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                  {modifier.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Category: {modifier.category}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight={700} color={colors.yellow[600]}>
                    SAR {modifier.price.toFixed(2)}
                  </Typography>
                  <Chip
                    label={modifier.status}
                    size="small"
                    sx={{
                      backgroundColor: alpha(getStatusColor(modifier.status), 0.1),
                      color: getStatusColor(modifier.status),
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderGiftCardsTab = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Gift Cards</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddItem}
          sx={{
            backgroundColor: colors.yellow[500],
            color: colors.black[800],
            '&:hover': {
              backgroundColor: colors.yellow[400],
            },
          }}
        >
          Add Gift Card
        </Button>
      </Box>
      <Grid container spacing={2}>
        {giftCards.map((giftCard) => (
          <Grid item xs={12} sm={6} md={4} key={giftCard.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                  {giftCard.name}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight={700} color={colors.yellow[600]}>
                    SAR {giftCard.value.toFixed(2)}
                  </Typography>
                  <Chip
                    label={giftCard.status}
                    size="small"
                    sx={{
                      backgroundColor: alpha(getStatusColor(giftCard.status), 0.1),
                      color: getStatusColor(giftCard.status),
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

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
        <Typography variant="h4" sx={{ fontWeight: 700, color: colors.black[800], mb: 1 }}>
          Menu Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your menu items, categories, and configurations
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: `1px solid ${colors.white[600]}`,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              minWidth: 120,
            },
          }}
        >
          <Tab label="Products" />
          <Tab label="Categories" />
          <Tab label="Menu Groups" />
          <Tab label="Combos" />
          <Tab label="Modifiers" />
          <Tab label="Gift Cards" />
        </Tabs>

        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {activeTab === 0 && renderProductsTab()}
          {activeTab === 1 && renderCategoriesTab()}
          {activeTab === 2 && renderMenuGroupsTab()}
          {activeTab === 3 && renderCombosTab()}
          {activeTab === 4 && renderModifiersTab()}
          {activeTab === 5 && renderGiftCardsTab()}
        </Box>
      </Box>
    </Box>
  );
};

export default MenuManagement;
