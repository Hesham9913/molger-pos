// Core Entity Types
export interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
  role: UserRole;
  branchId: string;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  managerId: string;
  isActive: boolean;
  settings: BranchSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  addresses: Address[];
  tags: string[];
  isVip: boolean;
  isBlacklisted: boolean;
  notes: Note[];
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  customerId: string;
  branchId: string;
  agentId: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes: string;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  modifiers: OrderItemModifier[];
}

export interface OrderItemModifier {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  price: number;
  cost: number;
  isActive: boolean;
  stockQuantity: number;
  minStockLevel: number;
  imageUrl?: string;
  branchId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  branchId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Call {
  id: string;
  customerId: string;
  orderId?: string;
  agentId: string;
  status: CallStatus;
  duration: number; // in seconds
  notes: string;
  recordingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

// Enums
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  AGENT = 'agent',
  CASHIER = 'cashier',
  KITCHEN = 'kitchen',
  DRIVER = 'driver'
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

export enum FulfillmentStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered'
}

export enum CallStatus {
  INCOMING = 'incoming',
  CONNECTED = 'connected',
  ON_HOLD = 'on_hold',
  TRANSFERRED = 'transferred',
  ENDED = 'ended',
  MISSED = 'missed'
}

export enum NotificationType {
  ORDER_CREATED = 'order_created',
  ORDER_UPDATED = 'order_updated',
  ORDER_CANCELLED = 'order_cancelled',
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_FAILED = 'payment_failed',
  INVENTORY_LOW = 'inventory_low',
  INVENTORY_OUT = 'inventory_out',
  CUSTOMER_CALL = 'customer_call',
  SYSTEM_ALERT = 'system_alert'
}

// Real-time Event Types
export interface SocketEvent {
  type: string;
  data: any;
  timestamp: Date;
  userId?: string;
  branchId?: string;
}

export interface OrderEvent extends SocketEvent {
  type: 'order_created' | 'order_updated' | 'order_cancelled';
  data: Order;
}

export interface CustomerEvent extends SocketEvent {
  type: 'customer_created' | 'customer_updated';
  data: Customer;
}

export interface PaymentEvent extends SocketEvent {
  type: 'payment_processed' | 'payment_failed' | 'payment_refunded';
  data: {
    orderId: string;
    amount: number;
    method: string;
    status: PaymentStatus;
  };
}

export interface InventoryEvent extends SocketEvent {
  type: 'inventory_updated' | 'inventory_low' | 'inventory_out';
  data: {
    productId: string;
    quantity: number;
    previousQuantity: number;
  };
}

// UI State Types
export interface CallCenterState {
  currentAgent: User | null;
  currentBranch: Branch | null;
  incomingCalls: Call[];
  activeOrders: Order[];
  selectedOrder: Order | null;
  notifications: Notification[];
  filters: CallCenterFilters;
  searchQuery: string;
  isDrawerOpen: boolean;
  isNewCustomerModalOpen: boolean;
  isNewOrderModalOpen: boolean;
}

export interface CallCenterFilters {
  status: OrderStatus[];
  customerType: 'all' | 'vip' | 'blacklist' | 'new';
  dateRange: {
    start: Date;
    end: Date;
  };
  agentId?: string;
  showQueue?: boolean;
}

// Utility Types
export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Note {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface BranchSettings {
  timezone: string;
  currency: string;
  taxRate: number;
  deliveryFee: number;
  minimumOrderAmount: number;
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface CreateCustomerForm {
  name: string;
  phone: string;
  email?: string;
  addresses: Omit<Address, 'id'>[];
  tags: string[];
  notes?: string;
}

export interface CreateOrderForm {
  customerId: string;
  items: {
    productId: string;
    quantity: number;
    notes?: string;
    modifiers: string[];
  }[];
  notes?: string;
  estimatedDeliveryTime?: Date;
}

// Keyboard Shortcuts
export interface KeyboardShortcut {
  key: string;
  action: string;
  description: string;
  global?: boolean;
}

export const CALL_CENTER_SHORTCUTS: KeyboardShortcut[] = [
  { key: 'n', action: 'new_order', description: 'Create new order', global: true },
  { key: 'c', action: 'new_customer', description: 'Create new customer', global: true },
  { key: 'f', action: 'focus_search', description: 'Focus search field', global: true },
  { key: 'q', action: 'toggle_queue', description: 'Toggle queue view', global: true },
  { key: 'Escape', action: 'close_drawer', description: 'Close current drawer' },
  { key: 'Enter', action: 'confirm_action', description: 'Confirm current action' },
  { key: 'Tab', action: 'next_field', description: 'Move to next field' },
  { key: 'Shift+Tab', action: 'previous_field', description: 'Move to previous field' },
]; 