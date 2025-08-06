import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Notification } from '../../../shared/types';

interface NotificationDrawerProps {
  open?: boolean;
  notifications?: Notification[];
  onClose?: () => void;
  onMarkAsRead?: (notificationId: string) => void;
}

const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  open = false,
  notifications = [],
  onClose,
  onMarkAsRead,
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 350,
          maxWidth: '90vw',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Notifications</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {notifications.length > 0 ? (
          <List>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem>
                  <ListItemText
                    primary={notification.title}
                    secondary={notification.message}
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No notifications
          </Typography>
        )}
      </Box>
    </Drawer>
  );
};

export default NotificationDrawer; 