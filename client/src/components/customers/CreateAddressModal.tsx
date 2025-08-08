import React, { useState, useEffect } from 'react';
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
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import {
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';

interface CreateAddressModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddressFormData) => void;
  customerId: string;
}

interface AddressFormData {
  name?: string;
  deliveryZoneId: string;
  detailedAddress: string;
  additionalInfo?: string;
}

interface DeliveryZone {
  id: string;
  name: string;
  description?: string;
  deliveryFee: number;
  minimumOrderAmount: number;
  estimatedDeliveryTime: number;
}

const CreateAddressModal: React.FC<CreateAddressModalProps> = ({
  open,
  onClose,
  onSubmit,
  customerId
}) => {
  const [loading, setLoading] = useState(false);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<AddressFormData>();

  const deliveryZoneId = watch('deliveryZoneId');

  useEffect(() => {
    if (open) {
      fetchDeliveryZones();
    }
  }, [open]);

  useEffect(() => {
    if (deliveryZoneId) {
      const zone = deliveryZones.find(z => z.id === deliveryZoneId);
      setSelectedZone(zone || null);
    }
  }, [deliveryZoneId, deliveryZones]);

  const fetchDeliveryZones = async () => {
    try {
      setZonesLoading(true);
      const response = await fetch('/api/customers/delivery-zones/all');
      const data = await response.json();

      if (data.success) {
        setDeliveryZones(data.data);
      } else {
        setError('Failed to load delivery zones');
      }
    } catch (err) {
      setError('Failed to load delivery zones');
    } finally {
      setZonesLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    setSelectedZone(null);
    onClose();
  };

  const onSubmitForm = async (data: AddressFormData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/customers/${customerId}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to create address');
      }

      onSubmit(result.data);
      reset();
      setSelectedZone(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleZoneChange = (event: SelectChangeEvent<string>) => {
    const zoneId = event.target.value;
    setValue('deliveryZoneId', zoneId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount);
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
            Create Address
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
            {/* Address Name */}
            <TextField
              label="Name *"
              fullWidth
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
              placeholder="e.g., Home, Office, Work"
              InputProps={{
                startAdornment: (
                  <InfoIcon sx={{ color: 'action.active', mr: 1 }} />
                )
              }}
            />

            {/* Delivery Zone */}
            <FormControl fullWidth error={!!errors.deliveryZoneId}>
              <InputLabel>Delivery Zone *</InputLabel>
              <Select
                value={deliveryZoneId || ''}
                label="Delivery Zone *"
                onChange={handleZoneChange}
                disabled={zonesLoading}
              >
              <input
                type="hidden"
                {...register('deliveryZoneId', {
                  required: 'Delivery zone is required'
                })}
              />
                {zonesLoading ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading zones...
                  </MenuItem>
                ) : deliveryZones.length === 0 ? (
                  <MenuItem disabled>No delivery zones available</MenuItem>
                ) : (
                  deliveryZones.map((zone) => (
                    <MenuItem key={zone.id} value={zone.id}>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {zone.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Fee: {formatCurrency(zone.deliveryFee)} • 
                          Min Order: {formatCurrency(zone.minimumOrderAmount)} • 
                          Est: {zone.estimatedDeliveryTime} mins
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.deliveryZoneId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                  {errors.deliveryZoneId.message}
                </Typography>
              )}
            </FormControl>

            {/* Selected Zone Info */}
            {selectedZone && (
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  {selectedZone.name} Details:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Delivery Fee: {formatCurrency(selectedZone.deliveryFee)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Minimum Order: {formatCurrency(selectedZone.minimumOrderAmount)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Estimated Delivery Time: {selectedZone.estimatedDeliveryTime} minutes
                  </Typography>
                  {selectedZone.description && (
                    <Typography variant="caption" color="text.secondary">
                      {selectedZone.description}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {/* Street Address */}
            <TextField
              label="Street *"
              fullWidth
              multiline
              rows={2}
              {...register('detailedAddress', {
                required: 'Detailed address is required',
                minLength: {
                  value: 10,
                  message: 'Address must be at least 10 characters'
                },
                maxLength: {
                  value: 500,
                  message: 'Address must be less than 500 characters'
                }
              })}
              error={!!errors.detailedAddress}
              helperText={errors.detailedAddress?.message}
              placeholder="Enter the complete street address"
              InputProps={{
                startAdornment: (
                  <LocationIcon sx={{ color: 'action.active', mr: 1, alignSelf: 'flex-start', mt: 1 }} />
                )
              }}
            />

            {/* Residence Type */}
            <FormControl fullWidth>
              <InputLabel>Residence Type</InputLabel>
              <Select
                defaultValue="None"
                label="Residence Type"
              >
                <MenuItem value="None">None</MenuItem>
                <MenuItem value="Apartment">Apartment</MenuItem>
                <MenuItem value="Villa">Villa</MenuItem>
                <MenuItem value="Office">Office</MenuItem>
                <MenuItem value="Shop">Shop</MenuItem>
              </Select>
            </FormControl>

            {/* Additional Info */}
            <TextField
              label="Additional Info"
              fullWidth
              multiline
              rows={2}
              {...register('additionalInfo', {
                maxLength: {
                  value: 200,
                  message: 'Additional info must be less than 200 characters'
                }
              })}
              error={!!errors.additionalInfo}
              helperText={errors.additionalInfo?.message}
              placeholder="Floor, apartment number, special instructions, etc."
              InputProps={{
                startAdornment: (
                  <InfoIcon sx={{ color: 'action.active', mr: 1, alignSelf: 'flex-start', mt: 1 }} />
                )
              }}
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
            disabled={loading || zonesLoading}
            sx={{ textTransform: 'none', minWidth: 100 }}
          >
            {loading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateAddressModal;
