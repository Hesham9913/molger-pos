import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  CallCenterState, 
  User, 
  Order, 
  Call, 
  Notification, 
  CallCenterFilters,
  OrderStatus,
  CreateCustomerForm,
  CreateOrderForm
} from '../shared/types';

interface CallCenterStore extends CallCenterState {
  // Actions
  initializeCallCenter: (user: User, branchId: string) => void;
  setCurrentAgent: (agent: User) => void;
  setCurrentBranch: (branch: any) => void;
  
  // Call Queue Management
  addIncomingCall: (call: Call) => void;
  removeIncomingCall: (callId: string) => void;
  updateCallStatus: (callId: string, status: any) => void;
  assignCallToAgent: (callId: string, agentId: string) => void;
  
  // Order Management
  addOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;
  removeOrder: (orderId: string) => void;
  setSelectedOrder: (order: Order | null) => void;
  
  // Notifications
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
  
  // Filters and Search
  setFilters: (filters: Partial<CallCenterFilters>) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
  
  // UI State
  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
  setNewCustomerModalOpen: (open: boolean) => void;
  setNewOrderModalOpen: (open: boolean) => void;
  
  // Customer Management
  createCustomer: (customerData: CreateCustomerForm) => Promise<void>;
  updateCustomer: (customerId: string, customerData: Partial<CreateCustomerForm>) => Promise<void>;
  
  // Order Actions
  createOrder: (orderData: CreateOrderForm) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  assignOrderToAgent: (orderId: string, agentId: string) => Promise<void>;
  
  // Real-time Updates
  handleOrderCreated: (order: Order) => void;
  handleOrderUpdated: (order: Order) => void;
  handleCustomerUpdated: (customer: any) => void;
  handlePaymentProcessed: (paymentData: any) => void;
  handleInventoryUpdated: (inventoryData: any) => void;
  
  // Utility
  getFilteredOrders: () => Order[];
  getFilteredCalls: () => Call[];
  getUnreadNotificationsCount: () => number;
}

// Function to create initial state with fresh dates
const createInitialState = (): CallCenterState => ({
  currentAgent: null,
  currentBranch: null,
  incomingCalls: [],
  activeOrders: [],
  selectedOrder: null,
  notifications: [],
  filters: {
    status: [],
    customerType: 'all',
    dateRange: {
      start: new Date(new Date().setHours(0, 0, 0, 0)),
      end: new Date(new Date().setHours(23, 59, 59, 999))
    },
    agentId: undefined
  },
  searchQuery: '',
  isDrawerOpen: false,
  isNewCustomerModalOpen: false,
  isNewOrderModalOpen: false,
});

export const useCallCenterStore = create<CallCenterStore>()(
  devtools(
    (set, get) => ({
      ...createInitialState(),

      // Initialize
      initializeCallCenter: (user: User, branchId: string) => {
        try {
          // Create a default branch object if none exists
          const defaultBranch = {
            id: branchId,
            name: 'Main Branch',
            address: '',
            phone: '',
            managerId: user.id,
            isActive: true,
            settings: {
              timezone: 'UTC',
              currency: 'USD',
              taxRate: 0,
              deliveryFee: 0,
              minimumOrderAmount: 0,
              operatingHours: {},
              notifications: { email: true, sms: true, push: true }
            },
            createdAt: new Date(),
            updatedAt: new Date()
          };

          set({ 
            currentAgent: user,
            currentBranch: defaultBranch
          });
          // Load initial data here
        } catch (error) {
          console.error('Error in initializeCallCenter:', error);
          // Set minimal safe state with default branch
          set({ 
            currentAgent: user,
            currentBranch: {
              id: branchId,
              name: 'Default Branch',
              address: '',
              phone: '',
              managerId: user.id,
              isActive: true,
              settings: {
                timezone: 'UTC',
                currency: 'USD',
                taxRate: 0,
                deliveryFee: 0,
                minimumOrderAmount: 0,
                operatingHours: {},
                notifications: { email: true, sms: true, push: true }
              },
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
        }
      },

      setCurrentAgent: (agent: User) => {
        set({ currentAgent: agent });
      },

      setCurrentBranch: (branch: any) => {
        set({ currentBranch: branch });
      },

      // Call Queue Management
      addIncomingCall: (call: Call) => {
        set((state) => ({
          incomingCalls: [...state.incomingCalls, call]
        }));
      },

      removeIncomingCall: (callId: string) => {
        set((state) => ({
          incomingCalls: state.incomingCalls.filter(call => call.id !== callId)
        }));
      },

      updateCallStatus: (callId: string, status: any) => {
        set((state) => ({
          incomingCalls: state.incomingCalls.map(call =>
            call.id === callId ? { ...call, status } : call
          )
        }));
      },

      assignCallToAgent: (callId: string, agentId: string) => {
        set((state) => ({
          incomingCalls: state.incomingCalls.map(call =>
            call.id === callId ? { ...call, agentId } : call
          )
        }));
      },

      // Order Management
      addOrder: (order: Order) => {
        set((state) => ({
          activeOrders: [...state.activeOrders, order]
        }));
      },

      updateOrder: (order: Order) => {
        set((state) => ({
          activeOrders: state.activeOrders.map(o =>
            o.id === order.id ? order : o
          ),
          selectedOrder: state.selectedOrder?.id === order.id ? order : state.selectedOrder
        }));
      },

      removeOrder: (orderId: string) => {
        set((state) => ({
          activeOrders: state.activeOrders.filter(order => order.id !== orderId),
          selectedOrder: state.selectedOrder?.id === orderId ? null : state.selectedOrder
        }));
      },

      setSelectedOrder: (order: Order | null) => {
        set({ selectedOrder: order });
      },

      // Notifications
      addNotification: (notification: Notification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications]
        }));
      },

      markNotificationAsRead: (notificationId: string) => {
        set((state) => ({
          notifications: state.notifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      // Filters and Search
      setFilters: (filters: Partial<CallCenterFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...filters }
        }));
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      resetFilters: () => {
        set({ filters: createInitialState().filters, searchQuery: '' });
      },

      // UI State
      toggleDrawer: () => {
        set((state) => ({ isDrawerOpen: !state.isDrawerOpen }));
      },

      setDrawerOpen: (open: boolean) => {
        set({ isDrawerOpen: open });
      },

      setNewCustomerModalOpen: (open: boolean) => {
        set({ isNewCustomerModalOpen: open });
      },

      setNewOrderModalOpen: (open: boolean) => {
        set({ isNewOrderModalOpen: open });
      },

      // Customer Management
      createCustomer: async (customerData: CreateCustomerForm) => {
        try {
          // API call to create customer
          const response = await fetch('/api/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData)
          });
          
          if (!response.ok) throw new Error('Failed to create customer');
          
          const customer = await response.json();
          // Handle success
        } catch (error) {
          console.error('Error creating customer:', error);
          throw error;
        }
      },

      updateCustomer: async (customerId: string, customerData: Partial<CreateCustomerForm>) => {
        try {
          const response = await fetch(`/api/customers/${customerId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData)
          });
          
          if (!response.ok) throw new Error('Failed to update customer');
          
          const customer = await response.json();
          // Handle success
        } catch (error) {
          console.error('Error updating customer:', error);
          throw error;
        }
      },

      // Order Actions
      createOrder: async (orderData: CreateOrderForm) => {
        try {
          const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
          });
          
          if (!response.ok) throw new Error('Failed to create order');
          
          const order = await response.json();
          get().addOrder(order);
        } catch (error) {
          console.error('Error creating order:', error);
          throw error;
        }
      },

      updateOrderStatus: async (orderId: string, status: OrderStatus) => {
        try {
          const response = await fetch(`/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          });
          
          if (!response.ok) throw new Error('Failed to update order status');
          
          const order = await response.json();
          get().updateOrder(order);
        } catch (error) {
          console.error('Error updating order status:', error);
          throw error;
        }
      },

      assignOrderToAgent: async (orderId: string, agentId: string) => {
        try {
          const response = await fetch(`/api/orders/${orderId}/assign`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agentId })
          });
          
          if (!response.ok) throw new Error('Failed to assign order');
          
          const order = await response.json();
          get().updateOrder(order);
        } catch (error) {
          console.error('Error assigning order:', error);
          throw error;
        }
      },

      // Real-time Updates
      handleOrderCreated: (order: Order) => {
        get().addOrder(order);
        get().addNotification({
          id: `order-${order.id}`,
          userId: get().currentAgent?.id || '',
          type: 'order_created' as any,
          title: 'New Order Created',
          message: `Order #${order.id} has been created`,
          data: order,
          isRead: false,
          createdAt: new Date()
        });
      },

      handleOrderUpdated: (order: Order) => {
        get().updateOrder(order);
        get().addNotification({
          id: `order-update-${order.id}`,
          userId: get().currentAgent?.id || '',
          type: 'order_updated' as any,
          title: 'Order Updated',
          message: `Order #${order.id} has been updated`,
          data: order,
          isRead: false,
          createdAt: new Date()
        });
      },

      handleCustomerUpdated: (customer: any) => {
        // Handle customer updates
        get().addNotification({
          id: `customer-${customer.id}`,
          userId: get().currentAgent?.id || '',
          type: 'customer_call' as any,
          title: 'Customer Updated',
          message: `${customer.name} has been updated`,
          data: customer,
          isRead: false,
          createdAt: new Date()
        });
      },

      handlePaymentProcessed: (paymentData: any) => {
        get().addNotification({
          id: `payment-${paymentData.orderId}`,
          userId: get().currentAgent?.id || '',
          type: 'payment_received' as any,
          title: 'Payment Processed',
          message: `Payment received for Order #${paymentData.orderId}`,
          data: paymentData,
          isRead: false,
          createdAt: new Date()
        });
      },

      handleInventoryUpdated: (inventoryData: any) => {
        get().addNotification({
          id: `inventory-${inventoryData.productId}`,
          userId: get().currentAgent?.id || '',
          type: 'inventory_low' as any,
          title: 'Inventory Alert',
          message: `Low stock for product ${inventoryData.productId}`,
          data: inventoryData,
          isRead: false,
          createdAt: new Date()
        });
      },

      // Utility
      getFilteredOrders: () => {
        const state = get();
        let filtered = state.activeOrders;

        // Apply status filter
        if (state.filters.status.length > 0) {
          filtered = filtered.filter(order => 
            state.filters.status.includes(order.status)
          );
        }

        // Apply search query
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase();
          filtered = filtered.filter(order =>
            order.id.toLowerCase().includes(query) ||
            order.customerId.toLowerCase().includes(query)
          );
        }

        return filtered;
      },

      getFilteredCalls: () => {
        const state = get();
        return state.incomingCalls;
      },

      getUnreadNotificationsCount: () => {
        const state = get();
        return state.notifications.filter(n => !n.isRead).length;
      },
    }),
    {
      name: 'call-center-store',
    }
  )
); 