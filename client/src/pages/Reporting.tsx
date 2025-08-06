import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Reporting: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Reporting & Analytics
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Reporting module will be implemented here with comprehensive analytics.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Reporting; 