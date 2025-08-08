const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult, query, param } = require('express-validator');
const router = express.Router();

const prisma = new PrismaClient();

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Helper function to log customer activity
const logCustomerActivity = async (customerId, action, entityType, entityId = null, oldValues = null, newValues = null, performedBy = null, req = null) => {
  try {
    await prisma.customerActivityLog.create({
      data: {
        customerId,
        action,
        entityType,
        entityId,
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
        performedBy,
        ipAddress: req?.ip || null,
        userAgent: req?.get('User-Agent') || null
      }
    });
  } catch (error) {
    console.error('Failed to log customer activity:', error);
  }
};

// GET /api/customers - Get all customers with filtering
router.get('/', [
  query('filter').optional().isIn(['all', 'has_orders', 'negative_balance', 'blacklisted', 'deleted']),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sortBy').optional().isIn(['name', 'phone', 'totalOrders', 'lastOrderAt', 'accountBalance', 'createdAt']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], validateRequest, async (req, res) => {
  try {
    const {
      filter = 'all',
      search = '',
      page = 1,
      limit = 25,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build where clause based on filter
    let where = {};
    
    switch (filter) {
      case 'has_orders':
        where.totalOrders = { gt: 0 };
        break;
      case 'negative_balance':
        where.accountBalance = { lt: 0 };
        break;
      case 'blacklisted':
        where.isBlacklisted = true;
        break;
      case 'deleted':
        where.deletedAt = { not: null };
        break;
      default:
        where.deletedAt = null;
    }

    // Add search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get customers with counts
    const [customers, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          favoriteProduct: { select: { id: true, name: true } },
          favoriteBranch: { select: { id: true, name: true } },
          tagAssignments: {
            where: { deletedAt: null },
            include: { tag: { select: { id: true, name: true, color: true } } }
          },
          _count: { select: { addresses: { where: { deletedAt: null } } } }
        }
      }),
      prisma.customer.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers',
      error: error.message
    });
  }
});

// GET /api/customers/:id - Get single customer with full details
router.get('/:id', [
  param('id').isUUID()
], validateRequest, async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        favoriteProduct: { select: { id: true, name: true, nameAr: true } },
        favoriteBranch: { select: { id: true, name: true } },
        addresses: {
          where: { deletedAt: null },
          include: {
            deliveryZone: {
              select: { id: true, name: true, deliveryFee: true, estimatedDeliveryTime: true }
            }
          },
          orderBy: { isDefault: 'desc' }
        },
        tagAssignments: {
          where: { deletedAt: null },
          include: {
            tag: { select: { id: true, name: true, color: true, description: true } },
            assignedByUser: { select: { id: true, firstName: true, lastName: true } }
          }
        },
        orders: {
          where: { deletedAt: null },
          select: {
            id: true, orderNumber: true, totalAmount: true, 
            status: true, orderType: true, createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer',
      error: error.message
    });
  }
});

// POST /api/customers - Create new customer
router.post('/', [
  body('name').notEmpty().trim().isLength({ min: 1, max: 255 }),
  body('phone').notEmpty().trim().matches(/^\+?[\d\s\-\(\)]+$/).isLength({ min: 8, max: 20 }),
  body('email').optional({ nullable: true }).isEmail().normalizeEmail(),
  body('notes').optional({ nullable: true }).trim().isLength({ max: 1000 })
], validateRequest, async (req, res) => {
  try {
    const { name, phone, email, notes } = req.body;
    const userId = req.user?.id;

    // Check if phone already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { phone }
    });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Phone number already exists',
        field: 'phone'
      });
    }

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email: email || null,
        notes: notes || null,
        createdBy: userId
      }
    });

    // Log activity
    await logCustomerActivity(customer.id, 'created', 'customer', customer.id, null, customer, userId, req);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create customer',
      error: error.message
    });
  }
});

// GET /api/customers/delivery-zones/all - Get all delivery zones
router.get('/delivery-zones/all', async (req, res) => {
  try {
    const zones = await prisma.deliveryZone.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { name: 'asc' }
    });

    res.json({ success: true, data: zones });
  } catch (error) {
    console.error('Error fetching delivery zones:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery zones',
      error: error.message
    });
  }
});

// POST /api/customers/:id/addresses - Add customer address
router.post('/:id/addresses', [
  param('id').isUUID(),
  body('deliveryZoneId').isUUID(),
  body('name').optional({ nullable: true }).trim().isLength({ max: 100 }),
  body('detailedAddress').notEmpty().trim().isLength({ min: 10, max: 500 }),
  body('additionalInfo').optional({ nullable: true }).trim().isLength({ max: 200 })
], validateRequest, async (req, res) => {
  try {
    const { id: customerId } = req.params;
    const { deliveryZoneId, name, detailedAddress, additionalInfo } = req.body;
    const userId = req.user?.id;

    // Create address
    const address = await prisma.customerAddress.create({
      data: {
        customerId,
        deliveryZoneId,
        name: name || null,
        detailedAddress,
        additionalInfo: additionalInfo || null,
        createdBy: userId
      },
      include: {
        deliveryZone: {
          select: { id: true, name: true, deliveryFee: true, estimatedDeliveryTime: true }
        }
      }
    });

    // Log activity
    await logCustomerActivity(customerId, 'address_added', 'address', address.id, null, address, userId, req);

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: address
    });
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create address',
      error: error.message
    });
  }
});

module.exports = router;