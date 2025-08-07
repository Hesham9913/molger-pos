import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Order } from '../../shared/types';

interface OrderDetailsDrawerProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onOrderUpdate?: (order: Order) => void;
  currentAgent?: any;
}

const OrderDetailsDrawer: React.FC<OrderDetailsDrawerProps> = ({
  open,
  order,
  onClose,
  onOrderUpdate,
  currentAgent,

}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 400,
          maxWidth: '90vw',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Order Details</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {order ? (
          <Box>
            <Typography variant="body1">
              Order #{order.id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Status: {order.status}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total: ${order.total}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No order selected
          </Typography>
        )}
      </Box>
    </Drawer>
  );
};

export default OrderDetailsDrawer; 