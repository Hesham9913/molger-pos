import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { CreateOrderForm } from '../../../shared/types';

interface NewOrderModalProps {
  open: boolean;
  onClose: () => void;
  onCreateOrder: (orderData: CreateOrderForm) => Promise<void>;
}

const NewOrderModal: React.FC<NewOrderModalProps> = ({
  open,
  onClose,
  onCreateOrder,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Order</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Customer ID"
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Order Items"
            margin="normal"
            multiline
            rows={4}
            placeholder="Enter order items..."
          />
          <TextField
            fullWidth
            label="Notes"
            margin="normal"
            multiline
            rows={2}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained">Create Order</Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewOrderModal; 