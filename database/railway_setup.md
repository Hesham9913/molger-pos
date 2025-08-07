# 🚀 Railway Database Setup Guide

## 📋 **Overview**
This guide provides complete setup instructions for deploying the PostgreSQL database on Railway and connecting it to your Node.js/TypeScript backend.

## 🛠️ **Railway Database Setup**

### 1. **Create Railway Account**
- Go to [railway.app](https://railway.app)
- Sign up with GitHub or Google
- Create a new project

### 2. **Add PostgreSQL Database**
```bash
# In Railway Dashboard:
1. Click "New Service"
2. Select "Database" → "PostgreSQL"
3. Choose your preferred region
4. Click "Deploy"
```

### 3. **Get Connection Details**
```bash
# In Railway Dashboard:
1. Click on your PostgreSQL service
2. Go to "Connect" tab
3. Copy the connection details:
   - Host: postgresql://...
   - Database: postgres
   - Username: postgres
   - Password: [auto-generated]
   - Port: 5432
```

## 🔧 **Environment Variables**

### **Create `.env` file in your backend:**
```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@host:port/database"
DB_HOST=your-railway-host
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-railway-password

# Application Configuration
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Redis Configuration (for caching)
REDIS_URL=your-redis-url

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS Configuration
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number

# Payment Gateway
PAYMENT_GATEWAY=stripe
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable

# Notification
PUSH_NOTIFICATIONS=true
FCM_SERVER_KEY=your-fcm-server-key
```

## 📦 **Backend Dependencies**

### **Install Required Packages:**
```bash
npm install prisma @prisma/client
npm install bcryptjs jsonwebtoken
npm install express cors helmet morgan
npm install dotenv
npm install -D @types/node @types/express
```

### **Prisma Setup:**
```bash
# Initialize Prisma
npx prisma init

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

## 🗄️ **Database Migration Script**

### **Create `migrate.js`:**
```javascript
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const migrationFiles = [
  '01_auth_users.sql',
  '02_branch_staff.sql',
  '03_products_menu.sql',
  '04_pricing_discounts.sql',
  '05_inventory.sql',
  '06_orders_transactions.sql',
  '07_customers.sql',
  '08_payments_delivery.sql',
  '09_reports_audit.sql',
  '10_system_config.sql'
];

async function runMigrations() {
  console.log('🚀 Starting database migrations...');
  
  for (const file of migrationFiles) {
    const filePath = path.join(__dirname, 'database', file);
    
    if (fs.existsSync(filePath)) {
      console.log(`📄 Running migration: ${file}`);
      
      try {
        await new Promise((resolve, reject) => {
          exec(`psql "${process.env.DATABASE_URL}" -f "${filePath}"`, (error, stdout, stderr) => {
            if (error) {
              console.error(`❌ Error in ${file}:`, error);
              reject(error);
            } else {
              console.log(`✅ Completed: ${file}`);
              resolve();
            }
          });
        });
      } catch (error) {
        console.error(`❌ Migration failed for ${file}`);
        process.exit(1);
      }
    } else {
      console.log(`⚠️  File not found: ${file}`);
    }
  }
  
  console.log('🎉 All migrations completed successfully!');
}

runMigrations().catch(console.error);
```

## 🔌 **Database Connection Test**

### **Create `test-connection.js`:**
```javascript
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test query
    const userCount = await prisma.user.count();
    console.log(`📊 Users in database: ${userCount}`);
    
    // Test roles query
    const roles = await prisma.role.findMany({
      where: { deleted_at: null }
    });
    console.log(`👥 Roles found: ${roles.length}`);
    
    await prisma.$disconnect();
    console.log('🔌 Connection closed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
```

## 🚀 **Deployment Commands**

### **Local Development:**
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Railway database URL

# Run database migrations
node migrate.js

# Test connection
node test-connection.js

# Start development server
npm run dev
```

### **Production Deployment:**
```bash
# Build the application
npm run build

# Run migrations
node migrate.js

# Start production server
npm start
```

## 📊 **Database Monitoring**

### **Railway Dashboard:**
- Monitor database performance
- View connection metrics
- Check storage usage
- Review logs

### **Prisma Studio:**
```bash
# Open Prisma Studio for database management
npx prisma studio
```

## 🔒 **Security Best Practices**

### **Environment Variables:**
- Never commit `.env` files to version control
- Use different databases for development/staging/production
- Rotate database passwords regularly
- Use strong JWT secrets

### **Database Security:**
- Enable SSL connections
- Use connection pooling
- Implement rate limiting
- Regular security updates

## 📈 **Performance Optimization**

### **Connection Pooling:**
```javascript
// In your Prisma configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pooling
  connection: {
    pool: {
      min: 2,
      max: 10,
    },
  },
});
```

### **Index Optimization:**
- All tables include proper indices
- Composite indices for complex queries
- Partial indices for soft deletes
- Performance monitoring queries included

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **Connection Refused:**
   - Check Railway database status
   - Verify connection string
   - Ensure firewall allows connections

2. **Migration Errors:**
   - Check SQL syntax
   - Verify table dependencies
   - Review foreign key constraints

3. **Performance Issues:**
   - Monitor query execution plans
   - Check index usage
   - Optimize slow queries

### **Support Commands:**
```bash
# Reset database (development only)
npx prisma migrate reset

# Generate new migration
npx prisma migrate dev --name update_schema

# View database schema
npx prisma db pull

# Push schema changes
npx prisma db push
```

## 📞 **Support**

For Railway-specific issues:
- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)

For Prisma issues:
- Prisma Documentation: [prisma.io/docs](https://prisma.io/docs)
- Prisma GitHub: [github.com/prisma/prisma](https://github.com/prisma/prisma)
