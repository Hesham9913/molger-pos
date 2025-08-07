import React, { useState } from 'react';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Avatar,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  ContentCopy as DuplicateIcon,
  Reorder as ReorderIcon,
  Block as BlockIcon,
  Star as StarIcon,
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
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Loyalty as LoyaltyIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as DeliveryIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  VisibilityOff as ViewOffIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { colors } from '../../theme/modernTheme';
import { alpha } from '@mui/material/styles';

interface OrderDetailsDrawerProps {
  open: boolean;
  order: any;
  onClose: () => void;
  onOrderUpdate?: (order: any) => void;
  currentAgent?: any;
  activeTab?: number;
  onTabChange?: (tab: number) => void;
}

const OrderDetailsDrawer: React.FC<OrderDetailsDrawerProps> = ({
  open,
  order,
  onClose,
  onOrderUpdate,
  currentAgent,
  activeTab = 0,
  onTabChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState('');
  const [driverMenuAnchor, setDriverMenuAnchor] = useState<null | HTMLElement>(null);

  if (!order) return null;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    if (onTabChange) {
      onTabChange(newValue);
    }
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Save order changes
    console.log('Saving order changes...');
  };

  const handleDuplicate = () => {
    console.log('Duplicating order...');
  };

  const handleReorder = () => {
    console.log('Creating reorder...');
  };

  const handlePrint = () => {
    console.log('Printing receipt...');
  };

  const handleSendMessage = (type: 'sms' | 'whatsapp' | 'email') => {
    console.log(`Sending ${type} to customer...`);
  };

  const handleFlagVip = () => {
    console.log('Flagging customer as VIP...');
  };

  const handleBlacklist = () => {
    console.log('Blacklisting customer...');
  };

  const handleAssignDriver = () => {
    setDriverMenuAnchor(document.body);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return colors.info;
      case 'confirmed': return colors.warning;
      case 'prepping': return colors.warning;
      case 'ready': return colors.success;
      case 'out-for-delivery': return colors.info;
      case 'delivered': return colors.success;
      case 'canceled': return colors.error;
      default: return colors.black[400];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <InfoIcon />;
      case 'confirmed': return <CheckCircleIcon />;
      case 'prepping': return <TimerIcon />;
      case 'ready': return <CheckCircleIcon />;
      case 'out-for-delivery': return <DeliveryIcon />;
      case 'delivered': return <CheckCircleIcon />;
      case 'canceled': return <BlockIcon />;
      default: return <InfoIcon />;
    }
  };

  const formatCurrency = (amount: number) => {
    return `SAR ${amount.toFixed(2)}`;
  };

  const calculateSubtotal = () => {
    return order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 600,
          backgroundColor: colors.white[50],
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${colors.white[600]}`,
          backgroundColor: colors.white[100],
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.black[800] }}>
            Order Details
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            {order.id}
          </Typography>
          <Chip
            label={order.status}
            size="small"
            icon={getStatusIcon(order.status)}
            sx={{
              backgroundColor: alpha(getStatusColor(order.status), 0.1),
              color: getStatusColor(order.status),
            }}
          />
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: `1px solid ${colors.white[600]}`,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
            },
          }}
        >
          <Tab label="Details" />
          <Tab label="Customer" />
          <Tab label="Timeline" />
          <Tab label="Notes" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Box>
              {/* Order Summary */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Order Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Order Type
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {order.orderType}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Payment Method
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {order.paymentMethod}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Created At
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {format(order.createdAt, 'MMM dd, yyyy HH:mm')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Estimated Delivery
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {format(order.estimatedDelivery, 'MMM dd, yyyy HH:mm')}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Items */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Order Items
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Item</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Price</TableCell>
                          <TableCell align="right">Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {order.items.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography variant="body1" fontWeight={600}>
                                {item.name}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body1">
                                {item.quantity}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body1">
                                {formatCurrency(item.price)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body1" fontWeight={600}>
                                {formatCurrency(item.price * item.quantity)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} sx={{ fontWeight: 600 }}>
                            Total
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatCurrency(order.total)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                >
                  Edit Order
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DuplicateIcon />}
                  onClick={handleDuplicate}
                >
                  Duplicate
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ReorderIcon />}
                  onClick={handleReorder}
                >
                  Reorder
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PrintReceiptIcon />}
                  onClick={handlePrint}
                >
                  Print Receipt
                </Button>
              </Box>
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Customer Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {order.customerName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {order.customerPhone}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Address
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {order.customerAddress}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<SmsIcon />}
                  onClick={() => handleSendMessage('sms')}
                >
                  Send SMS
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<WhatsAppIcon />}
                  onClick={() => handleSendMessage('whatsapp')}
                >
                  Send WhatsApp
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EmailIcon />}
                  onClick={() => handleSendMessage('email')}
                >
                  Send Email
                </Button>
              </Box>
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Order Timeline
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: colors.success }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Order Created"
                    secondary={format(order.createdAt, 'MMM dd, yyyy HH:mm')}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: colors.success }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Order Confirmed"
                    secondary={format(order.createdAt, 'MMM dd, yyyy HH:mm')}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TimerIcon sx={{ color: colors.warning }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Preparing"
                    secondary={format(order.createdAt, 'MMM dd, yyyy HH:mm')}
                  />
                </ListItem>
              </List>
            </Box>
          )}

          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Order Notes
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Add notes about this order..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{
                  backgroundColor: colors.yellow[500],
                  color: colors.black[800],
                  '&:hover': {
                    backgroundColor: colors.yellow[400],
                  },
                }}
              >
                Save Notes
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Driver Assignment Menu */}
      <Menu
        anchorEl={driverMenuAnchor}
        open={Boolean(driverMenuAnchor)}
        onClose={() => setDriverMenuAnchor(null)}
      >
        <MenuItem onClick={() => setDriverMenuAnchor(null)}>
          Assign Driver 1
        </MenuItem>
        <MenuItem onClick={() => setDriverMenuAnchor(null)}>
          Assign Driver 2
        </MenuItem>
        <MenuItem onClick={() => setDriverMenuAnchor(null)}>
          Assign Driver 3
        </MenuItem>
      </Menu>
    </Drawer>
  );
};

export default OrderDetailsDrawer; 