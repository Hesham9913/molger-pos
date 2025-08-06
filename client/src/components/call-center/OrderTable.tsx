import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Fab,
  Checkbox,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Print as PrintIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Phone as PhoneIcon,
  Message as MessageIcon,
  LocalShipping as DeliveryIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

// Types
import { Order, OrderStatus, PaymentStatus, FulfillmentStatus } from '../../../shared/types';

interface OrderTableProps {
  orders: Order[];
  onOrderSelect: (order: Order) => void;
  onCreateNewOrder: () => void;
  onBulkAction?: (action: string, orderIds: string[]) => void;
}

type OrderTableColumn = {
  id: keyof Order | 'actions';
  label: string;
  sortable?: boolean;
  width?: string;
};

const columns: OrderTableColumn[] = [
  { id: 'id', label: 'Order #', sortable: true, width: '120px' },
  { id: 'customerId', label: 'Customer', sortable: true, width: '150px' },
  { id: 'phone', label: 'Phone', sortable: false, width: '120px' },
  { id: 'branchId', label: 'Branch', sortable: true, width: '120px' },
  { id: 'status', label: 'Status', sortable: true, width: '120px' },
  { id: 'createdAt', label: 'Created', sortable: true, width: '120px' },
  { id: 'agentId', label: 'Agent', sortable: true, width: '120px' },
  { id: 'fulfillmentStatus', label: 'Fulfillment', sortable: true, width: '120px' },
  { id: 'paymentStatus', label: 'Payment', sortable: true, width: '100px' },
  { id: 'total', label: 'Total', sortable: true, width: '100px' },
  { id: 'actions', label: 'Actions', sortable: false, width: '80px' },
];

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onOrderSelect,
  onCreateNewOrder,
  onBulkAction,
}) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [orderBy, setOrderBy] = useState<keyof Order>('createdAt');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('desc');
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedOrderForMenu, setSelectedOrderForMenu] = useState<Order | null>(null);

  // Sort orders
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      
      if (orderDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [orders, orderBy, orderDirection]);

  // Paginate orders
  const paginatedOrders = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedOrders.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedOrders, page, rowsPerPage]);

  const handleSort = (columnId: keyof Order) => {
    const isAsc = orderBy === columnId && orderDirection === 'asc';
    setOrderDirection(isAsc ? 'desc' : 'asc');
    setOrderBy(columnId);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedOrders(paginatedOrders.map(order => order.id));
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

  const handleBulkAction = (action: string) => {
    if (onBulkAction && selectedOrders.length > 0) {
      onBulkAction(action, selectedOrders);
      setSelectedOrders([]);
    }
    setActionMenuAnchor(null);
  };

  const handleOrderAction = (order: Order, action: string) => {
    switch (action) {
      case 'view':
        onOrderSelect(order);
        break;
      case 'edit':
        // Handle edit
        break;
      case 'delete':
        // Handle delete
        break;
      case 'print':
        // Handle print
        break;
      case 'notify':
        // Handle notify
        break;
      case 'assign':
        // Handle assign
        break;
      case 'call':
        // Handle call
        break;
      case 'message':
        // Handle message
        break;
    }
    setActionMenuAnchor(null);
    setSelectedOrderForMenu(null);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'preparing':
        return 'primary';
      case 'ready':
        return 'success';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getFulfillmentStatusColor = (status: FulfillmentStatus) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'preparing':
        return 'primary';
      case 'ready':
        return 'success';
      case 'delivered':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Live Orders ({orders.length})
          </Typography>
          
          {selectedOrders.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {selectedOrders.length} selected
              </Typography>
              <Button
                size="small"
                onClick={(e) => setActionMenuAnchor(e.currentTarget)}
              >
                Bulk Actions
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Table */}
      <TableContainer sx={{ flex: 1 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedOrders.length > 0 && selectedOrders.length < paginatedOrders.length}
                  checked={paginatedOrders.length > 0 && selectedOrders.length === paginatedOrders.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  style={{ width: column.width }}
                  sortDirection={orderBy === column.id ? orderDirection : false}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? orderDirection : 'asc'}
                      onClick={() => handleSort(column.id as keyof Order)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.map((order) => (
              <TableRow
                key={order.id}
                hover
                selected={selectedOrders.includes(order.id)}
                onClick={() => onOrderSelect(order)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => handleSelectOrder(order.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    #{order.id}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2">
                    Customer {order.customerId}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    +1 555-0123
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2">
                    Branch {order.branchId}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Chip
                    label={order.status}
                    size="small"
                    color={getStatusColor(order.status) as any}
                    variant="outlined"
                  />
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {format(new Date(order.createdAt), 'MMM dd, HH:mm')}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2">
                    Agent {order.agentId}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Chip
                    label={order.fulfillmentStatus}
                    size="small"
                    color={getFulfillmentStatusColor(order.fulfillmentStatus) as any}
                    variant="outlined"
                  />
                </TableCell>
                
                <TableCell>
                  <Chip
                    label={order.paymentStatus}
                    size="small"
                    color={getPaymentStatusColor(order.paymentStatus) as any}
                    variant="outlined"
                  />
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {formatCurrency(order.total)}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Tooltip title="Actions">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrderForMenu(order);
                        setActionMenuAnchor(e.currentTarget);
                      }}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={orders.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />

      {/* Floating New Order Button */}
      <Fab
        color="primary"
        aria-label="New Order"
        onClick={onCreateNewOrder}
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>

      {/* Bulk Actions Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={() => setActionMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleBulkAction('print')}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Print Orders</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction('notify')}>
          <ListItemIcon>
            <NotificationsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Send Notifications</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction('assign')}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Reassign Orders</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction('complete')}>
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark Complete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Order Actions Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor) && Boolean(selectedOrderForMenu)}
        onClose={() => {
          setActionMenuAnchor(null);
          setSelectedOrderForMenu(null);
        }}
      >
        {selectedOrderForMenu && (
          <>
            <MenuItem onClick={() => handleOrderAction(selectedOrderForMenu, 'view')}>
              <ListItemIcon>
                <ViewIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>View Details</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleOrderAction(selectedOrderForMenu, 'edit')}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Order</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleOrderAction(selectedOrderForMenu, 'print')}>
              <ListItemIcon>
                <PrintIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Print Order</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleOrderAction(selectedOrderForMenu, 'call')}>
              <ListItemIcon>
                <PhoneIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Call Customer</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleOrderAction(selectedOrderForMenu, 'message')}>
              <ListItemIcon>
                <MessageIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Send Message</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleOrderAction(selectedOrderForMenu, 'assign')}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Assign Driver</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

export default OrderTable; 