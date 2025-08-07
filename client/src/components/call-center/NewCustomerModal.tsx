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
import { CreateCustomerForm } from '../../shared/types';

interface NewCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onCreateCustomer: (customerData: CreateCustomerForm) => Promise<void>;
}

const NewCustomerModal: React.FC<NewCustomerModalProps> = ({
  open,
  onClose,
  onCreateCustomer,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Customer</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Full Name"
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Phone Number"
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email (Optional)"
            margin="normal"
            type="email"
          />
          <TextField
            fullWidth
            label="Address"
            margin="normal"
            multiline
            rows={3}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained">Create Customer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewCustomerModal; 