import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  Divider,
} from '@mui/material';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  language: string;
  onLanguageChange: (language: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onClose,
  isSoundEnabled,
  onToggleSound,
  isDarkMode,
  onToggleTheme,
  language,
  onLanguageChange,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={isSoundEnabled}
                onChange={onToggleSound}
              />
            }
            label="Enable Sound Notifications"
          />
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Appearance
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={isDarkMode}
                onChange={onToggleTheme}
              />
            }
            label="Dark Mode"
          />
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Language
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={language === 'ar'}
                onChange={() => onLanguageChange(language === 'en' ? 'ar' : 'en')}
              />
            }
            label="Arabic / English"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsModal; 