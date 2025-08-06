import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const POS: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        POS System
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          POS module will be implemented here with full real-time integration.
        </Typography>
      </Paper>
    </Box>
  );
};

export default POS; 