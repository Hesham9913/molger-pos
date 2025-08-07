# H POS - Ultra-Modern Call Center & POS Platform

A fully interconnected, cloud-based Call Center and POS platform for restaurants/retail with real-time synchronization across all modules.

## 🚀 Features

### Core Architecture
- **Real-time bi-directional sync** across all modules (Call Center, POS, Inventory, Reporting, Admin, Odoo)
- **Event-driven architecture** with WebSocket connections for instant updates
- **Multi-tenant, multi-branch** with granular role-based permissions
- **Offline-capable** with sync when reconnected

### Call Center Module (Current Implementation)
- **Live Operations Dashboard** with real-time order tracking
- **Incoming Call Queue** with status tracking and agent assignment
- **Order Management** with bulk actions and filtering
- **Customer Management** with VIP/blacklist tracking
- **Real-time Notifications** with sound cues and visual alerts
- **Keyboard Shortcuts** for efficient workflow
- **Multi-language Support** (Arabic/English) with RTL support
- **Accessibility Features** (WCAG 2.1 AA compliant)

### Technical Stack
- **Frontend**: React + TypeScript + Material-UI
- **Backend**: Node.js + Express + Socket.io
- **Database**: PostgreSQL + Redis
- **Real-time**: Socket.io for live updates
- **Authentication**: JWT-based with role permissions
- **Deployment**: Docker-ready, cloud-agnostic

## 📁 Project Structure

```
H POS/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   └── call-center/   # Call Center specific components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   ├── stores/           # Zustand state management
│   │   └── utils/            # Utility functions
│   └── public/               # Static assets
├── server/                    # Node.js backend
│   ├── routes/               # API route handlers
│   └── index.js              # Main server file
├── shared/                   # Shared TypeScript types
└── package.json              # Root package.json
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn
- PostgreSQL (for production)
- Redis (for production)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd H-POS
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Create .env file in root
   cp .env.example .env
   
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start separately:
   npm run server:dev  # Backend on port 5000
   cd client && npm start  # Frontend on port 3000
   ```

### Production Setup

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Docker deployment**
   ```bash
   npm run docker:build
   npm run docker:run
   ```

## 🔐 Authentication

### Demo Credentials
- **Agent**: `agent@hpos.com` / `password`
- **Manager**: `manager@hpos.com` / `password`

### Role Permissions
- **Agent**: Create/read/update orders and customers
- **Manager**: Full access including inventory and reporting
- **Admin**: System-wide access and configuration

## 🎯 Call Center Features

### Main Dashboard
- **Top Bar**: Logo, agent status, notifications, settings, help
- **Left Panel**: Live call queue with filters and search
- **Central Area**: Order table with bulk actions
- **Right Drawer**: Detailed order/customer information

### Real-time Features
- **Live Order Updates**: Instant sync across all connected clients
- **Call Queue Management**: Real-time incoming call tracking
- **Notification System**: Sound cues and visual alerts
- **Socket.io Integration**: Bi-directional real-time communication

### Keyboard Shortcuts
- `N` - Create new order
- `C` - Create new customer
- `F` - Focus search field
- `B` - Open notifications
- `H` - Show help
- `S` - Open settings
- `ESC` - Close current modal/drawer

### Accessibility Features
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast Mode**: Visual accessibility options
- **RTL Support**: Arabic language support

## 🔄 Real-time Integration

### Event Flow
```
Call Center Action → WebSocket Event → All Connected Clients → UI Updates
POS Action → Same Event System → Call Center Updates
Inventory Change → Same Event System → All Module Updates
```

### Socket Events
- `order_created` - New order created
- `order_updated` - Order status/items updated
- `customer_updated` - Customer information changed
- `payment_processed` - Payment received/processed
- `inventory_updated` - Stock levels changed
- `notification_sent` - New notification

## 🗄️ Database Schema

### Core Entities
- **Users**: Agents, managers, admins with role-based permissions
- **Branches**: Multi-branch support with individual settings
- **Customers**: Customer profiles with order history and preferences
- **Orders**: Complete order lifecycle with real-time status
- **Products**: Inventory items with pricing and stock levels
- **Calls**: Call tracking and agent assignment
- **Audit Logs**: Complete audit trail for all actions

## 🚧 Upcoming Modules

### POS Module
- Point of sale interface
- Payment processing
- Receipt printing
- Cash drawer integration

### Inventory Module
- Stock management
- Low stock alerts
- Supplier management
- Cost tracking

### Reporting Module
- Sales analytics
- Performance metrics
- Custom reports
- Data export

### Admin Module
- User management
- System configuration
- Branch management
- Audit logs

## 🔧 Configuration

### Environment Variables
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/hpos
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key

# Client Configuration
CLIENT_URL=http://localhost:3000
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Branch Settings
Each branch can be configured with:
- Operating hours
- Tax rates
- Delivery fees
- Minimum order amounts
- Notification preferences

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

## 📊 Performance

### Optimization Features
- **Virtual Scrolling**: For large order lists
- **Lazy Loading**: Component and data loading
- **Caching**: Redis for session and data caching
- **Compression**: Gzip for API responses
- **CDN Ready**: Static asset optimization

### Monitoring
- **Health Checks**: `/health` endpoint
- **Performance Metrics**: Response time tracking
- **Error Logging**: Comprehensive error tracking
- **Audit Trail**: Complete action logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**H POS** - Building the future of restaurant and retail management with real-time interconnected systems. 