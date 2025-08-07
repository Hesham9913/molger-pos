import React, { useEffect, useRef } from 'react';
import { Box, Grid, Paper, useTheme } from '@mui/material';
import { useHotkeys } from 'react-hotkeys-hook';
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
  const theme = useTheme();

  // Keyboard shortcuts
  useHotkeys('n', () => setNewOrderModalOpen(true));
  useHotkeys('c', () => setNewCustomerModalOpen(true));
  useHotkeys('f', () => searchInputRef.current?.focus());
  useHotkeys('q', () => {
    // Toggle queue view
    setFilters({ showQueue: !filters.showQueue });
  });
  useHotkeys('Escape', () => {
    if (isDrawerOpen) {
      setDrawerOpen(false);
    }
    if (isNewCustomerModalOpen) {
      setNewCustomerModalOpen(false);
    }
    if (isNewOrderModalOpen) {
      setNewOrderModalOpen(false);
    }
  });

  // Real-time socket event handlers
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







    // Listen for real-time events
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
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: theme.palette.background.default
      }}>
        <div>Loading Call Center...</div>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <CallCenterTopBar
        agent={currentAgent}
        branch={currentBranch}
        unreadNotifications={notifications.filter(n => !n.isRead).length}
        searchInputRef={searchInputRef}
      />

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Call Queue Panel */}
        <CallQueuePanel
          calls={incomingCalls}
          onCallSelect={(call) => console.log('Call selected:', call)}
          onCreateNewCustomer={() => setNewCustomerModalOpen(true)}
        />

        {/* Order Table */}
        <OrderTable
          orders={activeOrders}
          filters={filters}
          onFiltersChange={setFilters}
          onOrderSelect={setSelectedOrder}
          selectedOrder={selectedOrder}
        />

        {/* Order Details Drawer */}
        <OrderDetailsDrawer
          order={selectedOrder}
          open={isDrawerOpen}
          onClose={() => setDrawerOpen(false)}
          onOrderUpdate={updateOrder}
          currentAgent={currentAgent}
        />

        {/* Modals */}
        <NewCustomerModal
          open={isNewCustomerModalOpen}
          onClose={() => setNewCustomerModalOpen(false)}
          onCreateCustomer={async (customerData) => {
            try {
              // This would call the store method
              console.log('Creating customer:', customerData);
            } catch (error) {
              console.error('Error creating customer:', error);
            }
          }}
        />

        <NewOrderModal
          open={isNewOrderModalOpen}
          onClose={() => setNewOrderModalOpen(false)}
          onCreateOrder={async (orderData) => {
            try {
              // This would call the store method
              console.log('Creating order:', orderData);
            } catch (error) {
              console.error('Error creating order:', error);
            }
          }}
        />

        <NotificationDrawer
          notifications={notifications}
          open={false}
          onClose={() => {}}
        />

        <HelpModal
          shortcuts={CALL_CENTER_SHORTCUTS}
          open={false}
          onClose={() => {}}
        />
      </Box>
    </Box>
  );
};

export default CallCenter; 