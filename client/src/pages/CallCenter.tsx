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
import { CALL_CENTER_SHORTCUTS } from '../../shared/types';
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
    handleOrderStatusChanged,
    handleCallAnswered,
    handleCallEnded,
    handleNotificationReceived
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
    setFilters(prev => ({ ...prev, showQueue: !prev.showQueue }));
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

    const handleOrderCreated = (order: any) => {
      handleOrderCreated(order);
      playSound('newOrder');
      showNotification('New order received!', 'success');
    };

    const handleOrderUpdated = (order: any) => {
      handleOrderUpdated(order);
      playSound('orderUpdate');
      showNotification('Order updated!', 'info');
    };

    const handleOrderStatusChanged = (data: any) => {
      handleOrderStatusChanged(data);
      playSound('statusChange');
      showNotification(`Order ${data.orderId} status changed to ${data.status}`, 'info');
    };

    const handleIncomingCall = (call: any) => {
      addIncomingCall(call);
      playSound('incomingCall');
      showNotification('New incoming call!', 'warning');
    };

    const handleCallAnswered = (data: any) => {
      handleCallAnswered(data);
      playSound('callAnswered');
      showNotification('Call answered!', 'success');
    };

    const handleCallEnded = (data: any) => {
      handleCallEnded(data);
      playSound('callEnded');
      showNotification('Call ended!', 'info');
    };

    const handleNotificationReceived = (notification: any) => {
      handleNotificationReceived(notification);
      playSound('notification');
      showNotification(notification.message, notification.type);
    };

    // Listen for real-time events
    socket.on('order_created', handleOrderCreated);
    socket.on('order_updated', handleOrderUpdated);
    socket.on('order_status_changed', handleOrderStatusChanged);
    socket.on('incoming_call', handleIncomingCall);
    socket.on('call_answered', handleCallAnswered);
    socket.on('call_ended', handleCallEnded);
    socket.on('notification', handleNotificationReceived);

    return () => {
      socket.off('order_created', handleOrderCreated);
      socket.off('order_updated', handleOrderUpdated);
      socket.off('order_status_changed', handleOrderStatusChanged);
      socket.off('incoming_call', handleIncomingCall);
      socket.off('call_answered', handleCallAnswered);
      socket.off('call_ended', handleCallEnded);
      socket.off('notification', handleNotificationReceived);
    };
  }, [socket, showNotification, handleOrderCreated, handleOrderUpdated, handleOrderStatusChanged, addIncomingCall, handleCallAnswered, handleCallEnded, handleNotificationReceived]);

  // Loading state
  if (!currentAgent || !currentBranch) {
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
        currentAgent={currentAgent}
        currentBranch={currentBranch}
        incomingCalls={incomingCalls}
        notifications={notifications}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchInputRef={searchInputRef}
        shortcuts={CALL_CENTER_SHORTCUTS}
      />

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Call Queue Panel */}
        <CallQueuePanel
          incomingCalls={incomingCalls}
          onCallAnswered={handleCallAnswered}
          onCallEnded={handleCallEnded}
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
          currentBranch={currentBranch}
        />

        <NewOrderModal
          open={isNewOrderModalOpen}
          onClose={() => setNewOrderModalOpen(false)}
          currentBranch={currentBranch}
          currentAgent={currentAgent}
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