import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Admin: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Admin module will be implemented here with system management features.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Admin; 