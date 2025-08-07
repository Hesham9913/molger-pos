const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Mock user data (in real app, this would come from database)
const mockUsers = [
  {
    id: '1',
    name: 'John Agent',
    email: 'agent@hpos.com',
    password: '$2a$10$example.hash', // bcrypt hash of 'password'
    photo: null,
    role: 'agent',
    branchId: '1',
    permissions: [
      { resource: 'orders', actions: ['create', 'read', 'update'] },
      { resource: 'customers', actions: ['create', 'read', 'update'] },
    ],
    isActive: true,
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Manager User',
    email: 'manager@hpos.com',
    password: '$2a$10$example.hash',
    photo: null,
    role: 'manager',
    branchId: '1',
    permissions: [
      { resource: 'orders', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'customers', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'inventory', actions: ['read', 'update'] },
    ],
    isActive: true,
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock branches
const mockBranches = [
  {
    id: '1',
    name: 'Main Branch',
    address: '123 Main St, City',
    phone: '+1 555-0123',
    managerId: '2',
    isActive: true,
    settings: {
      timezone: 'America/New_York',
      currency: 'USD',
      taxRate: 0.08,
      deliveryFee: 5.00,
      minimumOrderAmount: 10.00,
      operatingHours: {
        monday: { open: '09:00', close: '22:00', isOpen: true },
        tuesday: { open: '09:00', close: '22:00', isOpen: true },
        wednesday: { open: '09:00', close: '22:00', isOpen: true },
        thursday: { open: '09:00', close: '22:00', isOpen: true },
        friday: { open: '09:00', close: '23:00', isOpen: true },
        saturday: { open: '10:00', close: '23:00', isOpen: true },
        sunday: { open: '10:00', close: '21:00', isOpen: true },
      },
      notifications: {
        email: true,
        sms: true,
        push: true,
      },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // In real app, verify password with bcrypt
    // For demo, accept any password
    if (password !== 'password') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Find user's branch
    const branch = mockBranches.find(b => b.id === user.branchId);

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        branchId: user.branchId 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return user data (without password) and token
    const { password: _, ...userData } = user;
    res.json({
      user: { ...userData, branch },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate token endpoint
router.get('/validate', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find user
    const user = mockUsers.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Find user's branch
    const branch = mockBranches.find(b => b.id === user.branchId);

    // Return user data (without password)
    const { password: _, ...userData } = user;
    res.json({ ...userData, branch });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  // In a real app, you might want to blacklist the token
  res.json({ message: 'Logged out successfully' });
});

module.exports = router; 