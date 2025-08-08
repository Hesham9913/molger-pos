import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import {
  Close as CloseIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';

interface CreateCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => void;
}

interface CustomerFormData {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({
  open,
  onClose,
  onSubmit
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<CustomerFormData>();

  const phoneValue = watch('phone');

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  const onSubmitForm = async (data: CustomerFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Format phone number with country code if not already present
      let formattedPhone = data.phone;
      if (formattedPhone && !formattedPhone.startsWith('+')) {
        // Remove any existing country code and prepend Egypt code
        const cleanPhone = formattedPhone.replace(/^\+?20/, '').replace(/^0/, '');
        formattedPhone = `+20${cleanPhone}`;
      }

      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          phone: formattedPhone
        }),
      });

      const result = await response.json();

      if (!result.success) {
        if (result.field === 'phone' && response.status === 409) {
          setError('This phone number is already registered with another customer.');
          return;
        }
        throw new Error(result.message || 'Failed to create customer');
      }

      onSubmit(result.data);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate customer name if phone is entered and name is empty
  const generateCustomerName = (phone: string) => {
    if (phone && phone.length >= 8) {
      // Extract last 4 digits for auto-naming
      const lastFour = phone.replace(/\D/g, '').slice(-4);
      return `#${lastFour}`;
    }
    return '';
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxWidth: 500
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            Create Customer
          </Typography>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{ color: 'grey.500' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmitForm)}>
        <DialogContent sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Name Field */}
            <TextField
              label="Name *"
              fullWidth
              {...register('name', {
                required: 'Name is required',
                minLength: {
                  value: 1,
                  message: 'Name must be at least 1 character'
                },
                maxLength: {
                  value: 255,
                  message: 'Name must be less than 255 characters'
                }
              })}
              error={!!errors.name}
              helperText={errors.name?.message}
              InputProps={{
                startAdornment: (
                  <PersonIcon sx={{ color: 'action.active', mr: 1 }} />
                )
              }}
              placeholder="Enter customer name or leave blank for auto-generation"
            />

            {/* Phone Number Field */}
            <Box>
              <FormControl fullWidth>
                <InputLabel>Phone Number *</InputLabel>
                <Select
                  value="EG"
                  label="Country Code"
                  sx={{ mb: 1 }}
                  size="small"
                  disabled
                >
                  <MenuItem value="EG">Egypt (+20)</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Phone Number *"
                fullWidth
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[\d\s\-\(\)]{8,15}$/,
                    message: 'Please enter a valid phone number (8-15 digits)'
                  },
                  minLength: {
                    value: 8,
                    message: 'Phone number must be at least 8 digits'
                  },
                  maxLength: {
                    value: 15,
                    message: 'Phone number must be less than 15 characters'
                  }
                })}
                error={!!errors.phone}
                helperText={errors.phone?.message}
                InputProps={{
                  startAdornment: (
                    <PhoneIcon sx={{ color: 'action.active', mr: 1 }} />
                  )
                }}
                placeholder="Enter phone number"
                onChange={(e) => {
                  const phone = e.target.value;
                  // Auto-generate name if name field is empty
                  const nameField = document.querySelector('input[name="name"]') as HTMLInputElement;
                  if (nameField && !nameField.value) {
                    const autoName = generateCustomerName(phone);
                    if (autoName) {
                      nameField.value = autoName;
                    }
                  }
                }}
              />
            </Box>

            {/* Email Field */}
            <TextField
              label="Email"
              type="email"
              fullWidth
              {...register('email', {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address'
                }
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <EmailIcon sx={{ color: 'action.active', mr: 1 }} />
                )
              }}
              placeholder="Enter email address (optional)"
            />

            {/* Customer Notes */}
            <TextField
              label="Customer Notes"
              fullWidth
              multiline
              rows={3}
              {...register('notes', {
                maxLength: {
                  value: 1000,
                  message: 'Notes must be less than 1000 characters'
                }
              })}
              error={!!errors.notes}
              helperText={errors.notes?.message}
              InputProps={{
                startAdornment: (
                  <NotesIcon sx={{ color: 'action.active', mr: 1, alignSelf: 'flex-start', mt: 1 }} />
                )
              }}
              placeholder="Add any notes about the customer (optional)"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            Close
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ textTransform: 'none', minWidth: 100 }}
          >
            {loading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateCustomerModal;
