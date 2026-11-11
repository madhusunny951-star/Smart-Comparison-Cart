import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table (Firebase Auth or guest checkout synced to PostgreSQL)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or permanent user identifier
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').notNull().default('customer'), // 'customer' | 'admin'
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Addresses table
export const addresses = pgTable('addresses', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  addressLine: text('address_line').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  pincode: text('pincode').notNull(),
  type: text('type').notNull().default('HOME'), // HOME | WORK | OTHER
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Products table
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  brand: text('brand').notNull(),
  category: text('category').notNull(),
  quantity: text('quantity').notNull(),
  imageUrl: text('image_url').notNull(),
  rating: text('rating').notNull().default('4.5'),
  ratingCount: integer('rating_count').notNull().default(120),
  inStock: boolean('in_stock').notNull().default(true),
  description: text('description'),
  smartcartPrice: integer('smartcart_price').notNull(),
  smartcartDiscount: integer('smartcart_discount').notNull().default(10),
  smartcartDeliveryTime: text('smartcart_delivery_time').notNull().default('15-25 mins'),
  smartcartDeliveryFee: integer('smartcart_delivery_fee').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Platform prices comparison table (Blinkit, Zepto, Swiggy Instamart, BigBasket, DMart, Flipkart)
export const platformPrices = pgTable('platform_prices', {
  id: serial('id').primaryKey(),
  productId: text('product_id').notNull(),
  platformName: text('platform_name').notNull(),
  platformSlug: text('platform_slug').notNull(),
  price: integer('price').notNull(),
  originalPrice: integer('original_price').notNull(),
  discountPercent: integer('discount_percent').notNull(),
  deliveryFee: integer('delivery_fee').notNull(),
  deliveryTime: text('delivery_time').notNull(),
  offerText: text('offer_text'),
  officialUrl: text('official_url').notNull(),
  inStock: boolean('in_stock').notNull().default(true),
  isLowest: boolean('is_lowest').notNull().default(false),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Shopping Cart items
export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  productId: text('product_id').notNull(),
  quantity: integer('quantity').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow(),
});

// Orders
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  userEmail: text('user_email').notNull(),
  userName: text('user_name').notNull(),
  userPhone: text('user_phone').notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  items: text('items').notNull(), // JSON stringified array of items
  subtotal: integer('subtotal').notNull(),
  discount: integer('discount').notNull().default(0),
  deliveryFee: integer('delivery_fee').notNull().default(0),
  totalAmount: integer('total_amount').notNull(),
  couponCode: text('coupon_code'),
  paymentMethod: text('payment_method').notNull(),
  paymentStatus: text('payment_status').notNull(), // PAID, PENDING, FAILED, REFUNDED
  transactionId: text('transaction_id').notNull(),
  orderStatus: text('order_status').notNull(), // 'Order Placed', 'Order Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'
  estimatedDeliveryDate: text('estimated_delivery_date').notNull(),
  deliverySlot: text('delivery_slot').notNull().default('Standard Express (Today)'),
  trackingHistory: text('tracking_history').notNull(), // JSON stringified array of checkpoints
  cancellationReason: text('cancellation_reason'),
  refundStatus: text('refund_status').notNull().default('None'), // 'None' | 'Requested' | 'Processing' | 'Completed'
  refundAmount: integer('refund_amount').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Payments
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  orderId: text('order_id').notNull(),
  transactionId: text('transaction_id').notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('INR'),
  paymentMethod: text('payment_method').notNull(),
  paymentGateway: text('payment_gateway').notNull().default('Razorpay'),
  status: text('status').notNull(), // 'SUCCESS' | 'PENDING' | 'FAILED'
  razorpayPaymentId: text('razorpay_payment_id'),
  razorpayOrderId: text('razorpay_order_id'),
  razorpaySignature: text('razorpay_signature'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Coupons
export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  discountPercent: integer('discount_percent').notNull(),
  maxDiscount: integer('max_discount').notNull(),
  minOrderValue: integer('min_order_value').notNull(),
  description: text('description').notNull(),
  validTill: text('valid_till').notNull(),
  isActive: boolean('is_active').notNull().default(true),
});

// Customer Support Tickets
export const supportTickets = pgTable('support_tickets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  userEmail: text('user_email').notNull(),
  orderId: text('order_id'),
  category: text('category').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull().default('Open'), // 'Open' | 'In Progress' | 'Resolved'
  reply: text('reply'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Notifications
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(), // ORDER | PAYMENT | DELIVERY | REFUND | PROMO
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});
