const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Migration files in order of dependencies
const migrationFiles = [
  '01_auth_users.sql',
  '02_branch_staff.sql', 
  '03_products_menu.sql',
  '04_pricing_inventory.sql',
  '05_orders_customers.sql',
  '06_reports_audit.sql',
  '07_system_settings.sql',
  '08_devices_iot.sql',
  '09_marketing_loyalty.sql',
  '10_financial_accounting.sql'
];

async function runMigrations() {
  console.log('🚀 Starting database migrations...');
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Create logs directory if it doesn't exist
    const logsDir = path.join(__dirname, '../server/logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Run each migration file
    for (const file of migrationFiles) {
      const filePath = path.join(__dirname, file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${file} - file not found`);
        continue;
      }

      console.log(`➡️ Running migration: ${file}`);
      
      try {
        const sqlContent = fs.readFileSync(filePath, 'utf8');
        
        // Split SQL content into individual statements
        const statements = sqlContent
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        // Execute each statement
        for (const statement of statements) {
          if (statement.trim()) {
            await prisma.$executeRawUnsafe(statement);
          }
        }

        console.log(`✅ Successfully executed ${file}`);
      } catch (error) {
        console.error(`❌ Error executing ${file}:`, error.message);
        
        // Continue with other files even if one fails
        if (file.includes('01_') || file.includes('02_') || file.includes('03_')) {
          console.error('❌ Critical migration failed. Stopping...');
          process.exit(1);
        }
      }
    }

    console.log('🎉 All migrations completed successfully!');
    
    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    exec('npx prisma generate', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error generating Prisma client:', error);
        return;
      }
      console.log('✅ Prisma client generated successfully');
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Seed database with initial data
async function seedDatabase() {
  console.log('🌱 Seeding database with initial data...');
  
  try {
    await prisma.$connect();

    // Create default roles
    const roles = [
      { name: 'admin', displayName: 'Administrator', description: 'Full system access' },
      { name: 'manager', displayName: 'Manager', description: 'Branch management access' },
      { name: 'agent', displayName: 'Agent', description: 'Call center agent access' },
      { name: 'cashier', displayName: 'Cashier', description: 'POS access' }
    ];

    for (const role of roles) {
      await prisma.role.upsert({
        where: { name: role.name },
        update: {},
        create: role
      });
    }

    // Create default permissions
    const permissions = [
      { name: 'users:read', displayName: 'Read Users', resource: 'users', action: 'read' },
      { name: 'users:create', displayName: 'Create Users', resource: 'users', action: 'create' },
      { name: 'users:update', displayName: 'Update Users', resource: 'users', action: 'update' },
      { name: 'users:delete', displayName: 'Delete Users', resource: 'users', action: 'delete' },
      { name: 'orders:read', displayName: 'Read Orders', resource: 'orders', action: 'read' },
      { name: 'orders:create', displayName: 'Create Orders', resource: 'orders', action: 'create' },
      { name: 'orders:update', displayName: 'Update Orders', resource: 'orders', action: 'update' },
      { name: 'orders:delete', displayName: 'Delete Orders', resource: 'orders', action: 'delete' },
      { name: 'customers:read', displayName: 'Read Customers', resource: 'customers', action: 'read' },
      { name: 'customers:create', displayName: 'Create Customers', resource: 'customers', action: 'create' },
      { name: 'customers:update', displayName: 'Update Customers', resource: 'customers', action: 'update' },
      { name: 'customers:delete', displayName: 'Delete Customers', resource: 'customers', action: 'delete' },
      { name: 'products:read', displayName: 'Read Products', resource: 'products', action: 'read' },
      { name: 'products:create', displayName: 'Create Products', resource: 'products', action: 'create' },
      { name: 'products:update', displayName: 'Update Products', resource: 'products', action: 'update' },
      { name: 'products:delete', displayName: 'Delete Products', resource: 'products', action: 'delete' },
      { name: 'inventory:read', displayName: 'Read Inventory', resource: 'inventory', action: 'read' },
      { name: 'inventory:update', displayName: 'Update Inventory', resource: 'inventory', action: 'update' },
      { name: 'branches:read', displayName: 'Read Branches', resource: 'branches', action: 'read' },
      { name: 'branches:create', displayName: 'Create Branches', resource: 'branches', action: 'create' },
      { name: 'branches:update', displayName: 'Update Branches', resource: 'branches', action: 'update' },
      { name: 'branches:delete', displayName: 'Delete Branches', resource: 'branches', action: 'delete' },
      { name: 'audit:read', displayName: 'Read Audit Logs', resource: 'audit', action: 'read' }
    ];

    for (const permission of permissions) {
      await prisma.permission.upsert({
        where: { name: permission.name },
        update: {},
        create: permission
      });
    }

    // Create default admin user
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash('admin123', 12);
    const passwordSalt = bcrypt.genSaltSync(12);

    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@hpos.com' },
      update: {},
      create: {
        email: 'admin@hpos.com',
        passwordHash,
        passwordSalt,
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        isVerified: true,
        roles: {
          create: {
            roleId: (await prisma.role.findUnique({ where: { name: 'admin' } })).id
          }
        }
      }
    });

    // Create default branch
    const defaultBranch = await prisma.branch.upsert({
      where: { code: 'MAIN' },
      update: {},
      create: {
        name: 'Main Branch',
        code: 'MAIN',
        description: 'Main restaurant branch',
        address: '123 Main Street',
        city: 'City',
        state: 'State',
        country: 'Country',
        phone: '+1234567890',
        email: 'main@hpos.com',
        timezone: 'UTC',
        currency: 'USD',
        language: 'en',
        isActive: true,
        isMainBranch: true,
        settings: {
          taxRate: 0.08,
          deliveryFee: 5.00,
          minimumOrderAmount: 10.00
        }
      }
    });

    // Create default categories
    const categories = [
      { name: 'Pizza', nameAr: 'بيتزا', description: 'Fresh pizzas' },
      { name: 'Burgers', nameAr: 'برجر', description: 'Juicy burgers' },
      { name: 'Drinks', nameAr: 'مشروبات', description: 'Refreshing drinks' },
      { name: 'Desserts', nameAr: 'حلويات', description: 'Sweet desserts' }
    ];

    for (const category of categories) {
      try {
        await prisma.category.create({
          data: category
        });
      } catch (error) {
        // Category might already exist, skip
        console.log(`Category ${category.name} already exists, skipping...`);
      }
    }

    console.log('✅ Database seeded successfully!');
    console.log('🔑 Admin email: admin@hpos.com');
    console.log('🔑 Admin password: admin123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Main execution
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'migrate':
      await runMigrations();
      break;
    case 'seed':
      await seedDatabase();
      break;
    case 'setup':
      await runMigrations();
      await seedDatabase();
      break;
    default:
      console.log('Usage: node migrate.js [migrate|seed|setup]');
      console.log('  migrate - Run database migrations');
      console.log('  seed    - Seed database with initial data');
      console.log('  setup   - Run migrations and seed data');
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runMigrations, seedDatabase };
