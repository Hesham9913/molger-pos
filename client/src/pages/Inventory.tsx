import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Inventory: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Inventory Management
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Inventory module will be implemented here with real-time stock tracking.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Inventory; 