const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Socket.io connection handling
const connectedUsers = new Map();
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user authentication
  socket.on('authenticate', (data) => {
    const { userId, branchId, role } = data;
    connectedUsers.set(socket.id, { userId, branchId, role });
    userSockets.set(userId, socket.id);
    
    // Join branch-specific room for real-time updates
    socket.join(`branch_${branchId}`);
    socket.join(`user_${userId}`);
    
    console.log(`User ${userId} authenticated in branch ${branchId}`);
  });

  // Handle real-time events
  socket.on('order_created', (orderData) => {
    // Broadcast to all connected clients in the same branch
    io.to(`branch_${orderData.branchId}`).emit('order_created', orderData);
    console.log('Order created:', orderData.id);
  });

  socket.on('order_updated', (orderData) => {
    io.to(`branch_${orderData.branchId}`).emit('order_updated', orderData);
    console.log('Order updated:', orderData.id);
  });

  socket.on('customer_updated', (customerData) => {
    io.to(`branch_${customerData.branchId}`).emit('customer_updated', customerData);
    console.log('Customer updated:', customerData.id);
  });

  socket.on('inventory_updated', (inventoryData) => {
    io.to(`branch_${inventoryData.branchId}`).emit('inventory_updated', inventoryData);
    console.log('Inventory updated:', inventoryData.id);
  });

  socket.on('payment_processed', (paymentData) => {
    io.to(`branch_${paymentData.branchId}`).emit('payment_processed', paymentData);
    console.log('Payment processed:', paymentData.id);
  });

  socket.on('notification_sent', (notificationData) => {
    io.to(`branch_${notificationData.branchId}`).emit('notification_sent', notificationData);
    console.log('Notification sent:', notificationData.id);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const userData = connectedUsers.get(socket.id);
    if (userData) {
      userSockets.delete(userData.userId);
      connectedUsers.delete(socket.id);
      console.log(`User ${userData.userId} disconnected`);
    }
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/agents', require('./routes/agents'));
app.use('/api/branches', require('./routes/branches'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/audit', require('./routes/audit'));

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    connectedUsers: connectedUsers.size
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server ready for real-time connections`);
});

module.exports = { app, io, connectedUsers, userSockets }; 