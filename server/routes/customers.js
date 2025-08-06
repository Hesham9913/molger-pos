const express = require('express');
const router = express.Router();

// Mock customers data
const mockCustomers = [
  {
    id: 'CUST-001',
    name: 'John Doe',
    phone: '+1 555-0123',
    email: 'john.doe@example.com',
    addresses: [
      {
        id: 'addr-1',
        type: 'home',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        isDefault: true,
      },
    ],
    tags: ['vip', 'regular'],
    isVip: true,
    isBlacklisted: false,
    notes: [],
    totalOrders: 15,
    totalSpent: 450.75,
    lastOrderDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Get all customers
router.get('/', (req, res) => {
  res.json(mockCustomers);
});

// Get customer by ID
router.get('/:id', (req, res) => {
  const customer = mockCustomers.find(c => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  res.json(customer);
});

// Create new customer
router.post('/', (req, res) => {
  const newCustomer = {
    id: `CUST-${Date.now()}`,
    ...req.body,
    totalOrders: 0,
    totalSpent: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockCustomers.push(newCustomer);
  res.status(201).json(newCustomer);
});

// Update customer
router.put('/:id', (req, res) => {
  const customer = mockCustomers.find(c => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  
  Object.assign(customer, req.body, { updatedAt: new Date() });
  res.json(customer);
});

module.exports = router; 