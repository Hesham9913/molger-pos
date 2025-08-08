const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function seedCustomerData() {
  console.log('🌱 Seeding customer module data...');
  
  try {
    // Create delivery zones
    const zones = [
      { name: 'Zone 1 - Downtown', description: 'Downtown and city center area', deliveryFee: 5.00, minimumOrderAmount: 15.00, estimatedDeliveryTime: 25 },
      { name: 'Zone 2 - Suburbs North', description: 'Northern suburban areas', deliveryFee: 7.50, minimumOrderAmount: 20.00, estimatedDeliveryTime: 35 },
      { name: 'Zone 3 - Suburbs South', description: 'Southern suburban areas', deliveryFee: 7.50, minimumOrderAmount: 20.00, estimatedDeliveryTime: 35 },
      { name: 'Zone 4 - Industrial', description: 'Industrial and business districts', deliveryFee: 10.00, minimumOrderAmount: 25.00, estimatedDeliveryTime: 45 },
      { name: 'Zone 5 - Outskirts', description: 'Far suburban and rural areas', deliveryFee: 15.00, minimumOrderAmount: 30.00, estimatedDeliveryTime: 60 }
    ];

    for (const zone of zones) {
      await prisma.deliveryZone.upsert({
        where: { name: zone.name },
        update: {},
        create: zone
      });
    }

    // Create customer tags
    const tags = [
      { name: 'VIP', color: '#FFD700', description: 'Very Important Person - Premium customers' },
      { name: 'Regular', color: '#4CAF50', description: 'Regular customers with consistent orders' },
      { name: 'New Customer', color: '#2196F3', description: 'Recently registered customers' },
      { name: 'High Value', color: '#9C27B0', description: 'Customers with high order values' },
      { name: 'Frequent Buyer', color: '#FF5722', description: 'Customers who order frequently' },
      { name: 'Corporate', color: '#795548', description: 'Corporate or business customers' },
      { name: 'Special Dietary', color: '#607D8B', description: 'Customers with special dietary requirements' }
    ];

    for (const tag of tags) {
      await prisma.customerTag.upsert({
        where: { name: tag.name },
        update: {},
        create: tag
      });
    }

    // Create sample customers
    const customers = [
      { name: '#7734', phone: '+20 106 550 0679', totalOrders: 1, totalSpent: 575.00, accountBalance: 0.00, houseAccountEnabled: false },
      { name: 'Mohamed Sakka', phone: '+20 347 8728', totalOrders: 1, totalSpent: 450.00, accountBalance: 0.00, houseAccountEnabled: false },
      { name: 'Ehab Ebrahem', phone: '+112 841 4126', totalOrders: 1, totalSpent: 320.00, accountBalance: 0.00, houseAccountEnabled: false },
      { name: '#7731', phone: '+20 444 3006', totalOrders: 1, totalSpent: 280.00, accountBalance: 0.00, houseAccountEnabled: false },
      { name: '#7730', phone: '+222 693 7247', totalOrders: 1, totalSpent: 195.00, accountBalance: 0.00, houseAccountEnabled: false },
      { name: 'Amr Hammad', phone: '+100 181 9650', totalOrders: 1, totalSpent: 380.00, accountBalance: 0.00, houseAccountEnabled: false },
      { name: '#7724', phone: '+228 909 0723', totalOrders: 1, totalSpent: 220.00, accountBalance: 0.00, houseAccountEnabled: false },
      { name: '#7722', phone: '+114 420 2566', totalOrders: 1, totalSpent: 165.00, accountBalance: 0.00, houseAccountEnabled: false }
    ];

    for (const customer of customers) {
      try {
        const created = await prisma.customer.create({
          data: {
            ...customer,
            lastOrderAt: new Date(Date.now() - Math.random() * 86400000 * 7) // Random time within last week
          }
        });
        console.log(`✅ Created customer: ${created.name}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Customer ${customer.name} already exists`);
        } else {
          console.error(`❌ Error creating customer ${customer.name}:`, error.message);
        }
      }
    }

    console.log('✅ Customer module data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding customer data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedCustomerData();
}

module.exports = { seedCustomerData };
