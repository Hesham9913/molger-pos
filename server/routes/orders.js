const express = require('express');
const router = express.Router();

// Mock orders data
const mockOrders = [
  {
    id: 'ORD-001',
    customerId: 'CUST-001',
    branchId: '1',
    agentId: '1',
    items: [
      {
        id: 'item-1',
        productId: 'PROD-001',
        name: 'Margherita Pizza',
        quantity: 2,
        unitPrice: 12.99,
        totalPrice: 25.98,
        notes: 'Extra cheese',
        modifiers: [],
      },
    ],
    status: 'confirmed',
    paymentStatus: 'paid',
    fulfillmentStatus: 'preparing',
    subtotal: 25.98,
    tax: 2.08,
    discount: 0,
    total: 28.06,
    notes: 'Customer requested extra cheese',
    estimatedDeliveryTime: new Date(Date.now() + 45 * 60000), // 45 minutes from now
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Get all orders
router.get('/', (req, res) => {
  res.json(mockOrders);
});

// Get order by ID
router.get('/:id', (req, res) => {
  const order = mockOrders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// Create new order
router.post('/', (req, res) => {
  const newOrder = {
    id: `ORD-${Date.now()}`,
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockOrders.push(newOrder);
  res.status(201).json(newOrder);
});

// Update order status
router.put('/:id/status', (req, res) => {
  const order = mockOrders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  order.status = req.body.status;
  order.updatedAt = new Date();
  res.json(order);
});

// Assign order to agent
router.put('/:id/assign', (req, res) => {
  const order = mockOrders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  order.agentId = req.body.agentId;
  order.updatedAt = new Date();
  res.json(order);
});

module.exports = router; 