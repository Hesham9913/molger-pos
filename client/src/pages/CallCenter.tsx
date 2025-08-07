import React, { useEffect, useRef } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Card, 
  CardContent,
  Chip,
  IconButton,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useHotkeys } from 'react-hotkeys-hook';
import { motion, AnimatePresence } from 'framer-motion';
import CallCenterTopBar from '../components/call-center/CallCenterTopBar';
import CallQueuePanel from '../components/call-center/CallQueuePanel';
import OrderTable from '../components/call-center/OrderTable';
import OrderDetailsDrawer from '../components/call-center/OrderDetailsDrawer';
import NewCustomerModal from '../components/call-center/NewCustomerModal';
import NewOrderModal from '../components/call-center/NewOrderModal';
import NotificationDrawer from '../components/call-center/NotificationDrawer';
import HelpModal from '../components/call-center/HelpModal';
import { useCallCenterStore } from '../stores/callCenterStore';
import { useSocket } from '../hooks/useSocket';
import { useNotifications } from '../hooks/useNotifications';
import { CALL_CENTER_SHORTCUTS } from '../shared/types';
import { playSound } from '../utils/soundUtils';
import { colors } from '../theme/modernTheme';

const CallCenter: React.FC = () => {
  const {
    currentAgent,
    currentBranch,
    incomingCalls,
    activeOrders,
    selectedOrder,
    notifications,
    filters,
    searchQuery,
    isDrawerOpen,
    isNewCustomerModalOpen,
    isNewOrderModalOpen,
    setSearchQuery,
    setFilters,
    setSelectedOrder,
    setDrawerOpen,
    setNewCustomerModalOpen,
    setNewOrderModalOpen,
    addIncomingCall,
    updateOrder,
    handleOrderCreated,
    handleOrderUpdated,
    handleCustomerUpdated,
    handlePaymentProcessed,
    handleInventoryUpdated
  } = useCallCenterStore();

  const { socket } = useSocket();
  const { showNotification } = useNotifications();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts - must be called before any conditional returns
  useHotkeys('ctrl+n', () => setNewCustomerModalOpen(true));
  useHotkeys('ctrl+shift+n', () => setNewOrderModalOpen(true));
  useHotkeys('ctrl+f', () => searchInputRef.current?.focus());
  useHotkeys('ctrl+/', () => setFilters({ showQueue: !filters.showQueue }));
  useHotkeys('escape', () => {
    setDrawerOpen(false);
    setNewCustomerModalOpen(false);
    setNewOrderModalOpen(false);
  });

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleOrderCreatedLocal = (order: any) => {
      handleOrderCreated(order);
      playSound('newOrder');
      showNotification('New order received!', 'success');
    };

    const handleOrderUpdatedLocal = (order: any) => {
      handleOrderUpdated(order);
      playSound('orderUpdate');
      showNotification('Order updated!', 'info');
    };

    socket.on('order_created', handleOrderCreatedLocal);
    socket.on('order_updated', handleOrderUpdatedLocal);
    socket.on('customer_updated', handleCustomerUpdated);
    socket.on('payment_processed', handlePaymentProcessed);
    socket.on('inventory_updated', handleInventoryUpdated);

    return () => {
      socket.off('order_created', handleOrderCreatedLocal);
      socket.off('order_updated', handleOrderUpdatedLocal);
      socket.off('customer_updated', handleCustomerUpdated);
      socket.off('payment_processed', handlePaymentProcessed);
      socket.off('inventory_updated', handleInventoryUpdated);
    };
  }, [socket, showNotification, handleOrderCreated, handleOrderUpdated, handleCustomerUpdated, handlePaymentProcessed, handleInventoryUpdated]);

  // Loading state
  if (!currentAgent) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: `linear-gradient(135deg, ${colors.white[50]} 0%, ${colors.white[200]} 100%)`,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, color: colors.black[700] }}>
              Loading Call Center...
            </Typography>
            <Box
              sx={{
                width: 40,
                height: 40,
                margin: '0 auto',
                borderRadius: '50%',
                border: `4px solid ${colors.yellow[500]}`,
                borderTop: `4px solid transparent`,
                animation: 'spin 1s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
          </Card>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        height: '100vh',
        background: `linear-gradient(135deg, ${colors.white[50]} 0%, ${colors.white[100]} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Bar */}
      <CallCenterTopBar
        agent={currentAgent}
        branch={currentBranch}
        unreadNotifications={notifications.filter(n => !n.isRead).length}
        searchInputRef={searchInputRef}
      />

      <Container maxWidth={false} sx={{ height: 'calc(100vh - 72px)', p: 3 }}>
        <Grid container spacing={3} sx={{ height: '100%' }}>
          {/* Left Panel - Call Queue */}
          <Grid item xs={12} md={3}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              style={{ height: '100%' }}
            >
              <Card 
                sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: `1px solid ${colors.white[600]}`,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  background: `linear-gradient(135deg, ${colors.white[50]} 0%, ${colors.white[100]} 100%)`,
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${colors.black[800]} 0%, ${colors.black[700]} 100%)`,
                    color: colors.white[50],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: colors.yellow[500],
                        animation: incomingCalls.length > 0 ? 'pulse 2s infinite' : 'none',
                        '@keyframes pulse': {
                          '0%': { boxShadow: `0 0 0 0 ${colors.yellow[500]}` },
                          '70%': { boxShadow: `0 0 0 10px transparent` },
                          '100%': { boxShadow: `0 0 0 0 transparent` },
                        },
                      }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Incoming Calls
                    </Typography>
                    {incomingCalls.length > 0 && (
                      <Chip
                        label={incomingCalls.length}
                        size="small"
                        sx={{
                          backgroundColor: colors.yellow[500],
                          color: colors.black[800],
                          fontWeight: 700,
                          minWidth: 24,
                          height: 20,
                        }}
                      />
                    )}
                  </Box>
                  <IconButton size="small" sx={{ color: colors.white[200] }}>
                    <RefreshIcon />
                  </IconButton>
                </Box>
                
                <CardContent sx={{ p: 0, height: 'calc(100% - 80px)', overflow: 'hidden' }}>
                  <CallQueuePanel
                    calls={incomingCalls}
                    onCallSelect={(call) => console.log('Call selected:', call)}
                    onCreateNewCustomer={() => setNewCustomerModalOpen(true)}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Main Content - Orders Table */}
          <Grid item xs={12} md={9}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ height: '100%' }}
            >
              <Card 
                sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: `1px solid ${colors.white[600]}`,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  background: colors.white[50],
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Orders Header */}
                <Box
                  sx={{
                    p: 3,
                    borderBottom: `1px solid ${colors.white[600]}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: colors.white[50],
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: colors.black[800] }}>
                      Live Orders
                    </Typography>
                    <Chip
                      label={`${activeOrders.length} Active`}
                      variant="outlined"
                      sx={{
                        borderColor: colors.yellow[500],
                        color: colors.yellow[700],
                        fontWeight: 600,
                        backgroundColor: `rgba(255, 215, 0, 0.1)`,
                      }}
                    />
                  </Box>
                </Box>

                {/* Orders Content */}
                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                  <OrderTable
                    orders={activeOrders}
                    filters={filters}
                    onFiltersChange={setFilters}
                    selectedOrder={selectedOrder}
                    onOrderSelect={setSelectedOrder}
                  />
                </Box>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Fab
          color="secondary"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            background: `linear-gradient(135deg, ${colors.yellow[500]} 0%, ${colors.yellow[600]} 100%)`,
            color: colors.black[800],
            boxShadow: `0 8px 32px rgba(255, 215, 0, 0.4)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${colors.yellow[400]} 0%, ${colors.yellow[500]} 100%)`,
              transform: 'scale(1.1)',
              boxShadow: `0 12px 40px rgba(255, 215, 0, 0.5)`,
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onClick={() => setNewOrderModalOpen(true)}
        >
          <AddIcon />
        </Fab>
      </motion.div>

      {/* Modals and Drawers */}
      <AnimatePresence>
        {isDrawerOpen && selectedOrder && (
          <OrderDetailsDrawer
            open={isDrawerOpen}
            order={selectedOrder}
            onClose={() => setDrawerOpen(false)}
            onOrderUpdate={updateOrder}
            currentAgent={currentAgent}
          />
        )}

        {isNewCustomerModalOpen && (
          <NewCustomerModal
            open={isNewCustomerModalOpen}
            onClose={() => setNewCustomerModalOpen(false)}
            onCreateCustomer={async (customer) => {
              console.log('Customer created:', customer);
              setNewCustomerModalOpen(false);
            }}
          />
        )}

        {isNewOrderModalOpen && (
          <NewOrderModal
            open={isNewOrderModalOpen}
            onClose={() => setNewOrderModalOpen(false)}
            onSubmit={async (order) => {
              console.log('Order created:', order);
              setNewOrderModalOpen(false);
            }}
            currentBranch={{
              id: '1',
              name: 'Main Branch',
              address: '123 Main St, Riyadh',
            }}
          />
        )}
      </AnimatePresence>

      {/* Notification Drawer */}
      <NotificationDrawer
        notifications={notifications}
        open={false}
        onClose={() => {}}
      />

      {/* Help Modal */}
      <HelpModal
        open={false}
        onClose={() => {}}
        shortcuts={CALL_CENTER_SHORTCUTS}
      />
    </Box>
  );
};

export default CallCenter;