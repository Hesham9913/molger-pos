import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Divider,
  Badge,
  useTheme,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  PhoneInTalk as PhoneInTalkIcon,
  PhoneDisabled as PhoneDisabledIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Timer as TimerIcon,
  Star as StarIcon,
  Block as BlockIcon,
  NewReleases as NewIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

// Types
import { Call, CallStatus } from '../../../shared/types';

interface CallQueuePanelProps {
  calls: Call[];
  onCallSelect: (call: Call) => void;
  onCreateNewCustomer?: () => void;
}

type FilterType = 'all' | 'incoming' | 'connected' | 'on_hold' | 'missed';
type CustomerType = 'all' | 'vip' | 'blacklist' | 'new';

const CallQueuePanel: React.FC<CallQueuePanelProps> = ({
  calls,
  onCallSelect,
  onCreateNewCustomer,
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [customerTypeFilter, setCustomerTypeFilter] = useState<CustomerType>('all');

  // Filter calls based on search and filters
  const filteredCalls = useMemo(() => {
    return calls.filter((call) => {
      // Status filter
      if (statusFilter !== 'all' && call.status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const customerName = call.customerId.toLowerCase(); // This would be customer name in real app
        const orderId = call.orderId?.toLowerCase() || '';
        
        if (!customerName.includes(query) && !orderId.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [calls, searchQuery, statusFilter, customerTypeFilter]);

  const getCallStatusColor = (status: CallStatus) => {
    switch (status) {
      case 'incoming':
        return 'error';
      case 'connected':
        return 'success';
      case 'on_hold':
        return 'warning';
      case 'ended':
        return 'default';
      case 'missed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getCallStatusIcon = (status: CallStatus) => {
    switch (status) {
      case 'incoming':
        return <PhoneIcon color="error" />;
      case 'connected':
        return <PhoneInTalkIcon color="success" />;
      case 'on_hold':
        return <PhoneDisabledIcon color="warning" />;
      case 'ended':
        return <PhoneIcon color="disabled" />;
      case 'missed':
        return <PhoneDisabledIcon color="error" />;
      default:
        return <PhoneIcon />;
    }
  };

  const getCallDuration = (call: Call) => {
    if (call.status === 'connected' || call.status === 'on_hold') {
      const startTime = new Date(call.createdAt);
      const now = new Date();
      const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      return formatDistanceToNow(startTime, { addSuffix: true });
    }
    return '';
  };

  const getCustomerBadges = (call: Call) => {
    const badges = [];
    
    // This would be determined by customer data in real app
    const isVip = Math.random() > 0.8;
    const isBlacklisted = Math.random() > 0.95;
    const isNew = Math.random() > 0.7;

    if (isVip) {
      badges.push(
        <Tooltip key="vip" title="VIP Customer">
          <StarIcon sx={{ color: 'gold', fontSize: 16 }} />
        </Tooltip>
      );
    }

    if (isBlacklisted) {
      badges.push(
        <Tooltip key="blacklist" title="Blacklisted Customer">
          <BlockIcon sx={{ color: 'red', fontSize: 16 }} />
        </Tooltip>
      );
    }

    if (isNew) {
      badges.push(
        <Tooltip key="new" title="New Customer">
          <NewIcon sx={{ color: 'blue', fontSize: 16 }} />
        </Tooltip>
      );
    }

    return badges;
  };

  const handleCallAction = (call: Call, action: 'pickup' | 'assign' | 'callback') => {
    switch (action) {
      case 'pickup':
        // Handle pickup call
        onCallSelect(call);
        break;
      case 'assign':
        // Handle assign call
        break;
      case 'callback':
        // Handle callback
        break;
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Incoming Calls
          </Typography>
          <Badge badgeContent={calls.length} color="primary">
            <PhoneIcon />
          </Badge>
        </Box>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search calls..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {(['all', 'incoming', 'connected', 'on_hold', 'missed'] as FilterType[]).map((filter) => (
            <Chip
              key={filter}
              label={filter.charAt(0).toUpperCase() + filter.slice(1)}
              size="small"
              color={statusFilter === filter ? 'primary' : 'default'}
              onClick={() => setStatusFilter(filter)}
              variant={statusFilter === filter ? 'filled' : 'outlined'}
            />
          ))}
        </Box>

        {/* New Customer Button */}
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateNewCustomer}
          sx={{ mb: 1 }}
        >
          New Customer
        </Button>
      </Box>

      {/* Calls List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {filteredCalls.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              p: 3,
            }}
          >
            <PhoneIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body2" color="text.secondary" textAlign="center">
              No calls in queue
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredCalls.map((call, index) => (
              <React.Fragment key={call.id}>
                <ListItem
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    borderLeft: call.status === 'incoming' ? 3 : 0,
                    borderColor: 'error.main',
                  }}
                  onClick={() => onCallSelect(call)}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {getCallStatusIcon(call.status)}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          Customer {call.customerId}
                        </Typography>
                        {getCustomerBadges(call)}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Order: {call.orderId || 'No order'}
                        </Typography>
                        {getCallDuration(call) && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <TimerIcon sx={{ fontSize: 12 }} />
                            <Typography variant="caption" color="text.secondary">
                              {getCallDuration(call)}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                    <Chip
                      label={call.status}
                      size="small"
                      color={getCallStatusColor(call.status) as any}
                      variant="outlined"
                    />
                    
                    {call.status === 'incoming' && (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Pick up call">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCallAction(call, 'pickup');
                            }}
                          >
                            <PhoneInTalkIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Assign to agent">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCallAction(call, 'assign');
                            }}
                          >
                            <PersonIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>
                </ListItem>
                
                {index < filteredCalls.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default CallQueuePanel; 