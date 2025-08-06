import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
} from '@mui/material';
import { KeyboardShortcut } from '../../../shared/types';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}

const HelpModal: React.FC<HelpModalProps> = ({
  open,
  onClose,
  shortcuts,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Keyboard Shortcuts</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Typography variant="h6" gutterBottom>
            Available Shortcuts
          </Typography>
          <List>
            {shortcuts.map((shortcut, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={shortcut.description}
                  secondary={`Press ${shortcut.key}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default HelpModal; 