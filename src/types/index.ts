export interface PlatformComparison {
  id?: number;
  productId: string;
  platformName: string; // 'Blinkit' | 'Zepto' | 'Swiggy Instamart' | 'BigBasket' | 'DMart' | 'Flipkart'
  platformSlug: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  deliveryFee: number;
  deliveryTime: string;
  offerText?: string | null;
  officialUrl: string;
  inStock: boolean;
  isLowest: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  quantity: string;
  imageUrl: string;
  rating: string;
  ratingCount: number;
  inStock: boolean;
  description?: string | null;
  smartcartPrice: number;
  smartcartDiscount: number;
  smartcartDeliveryTime: string;
  smartcartDeliveryFee: number;
  comparisons?: PlatformComparison[];
  lowestPrice?: number;
  lowestPlatform?: string;
}

export interface CartItem {
  id: number;
  productId: string;
  quantity: number;
  product: Product;
  subtotal: number;
}

export interface Address {
  id: number;
  userId: string;
  name: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  isDefault: boolean;
}

export interface TrackingCheckpoint {
  status: string;
  time: string;
  description: string;
  completed: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  brand: string;
  unit: string;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  deliveryAddress: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  totalAmount: number;
  couponCode?: string | null;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
  transactionId: string;
  orderStatus:
    | 'Order Placed'
    | 'Order Confirmed'
    | 'Processing'
    | 'Packed'
    | 'Shipped'
    | 'Out for Delivery'
    | 'Delivered'
    | 'Cancelled'
    | 'Returned';
  estimatedDeliveryDate: string;
  deliverySlot: string;
  trackingHistory: TrackingCheckpoint[];
  cancellationReason?: string | null;
  refundStatus: 'None' | 'Requested' | 'Processing' | 'Completed';
  refundAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: number;
  code: string;
  discountPercent: number;
  maxDiscount: number;
  minOrderValue: number;
  description: string;
  validTill: string;
  isActive: boolean;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  orderId?: string | null;
  category: string;
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  reply?: string | null;
  createdAt: string;
}

export interface NotificationItem {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: 'ORDER' | 'PAYMENT' | 'DELIVERY' | 'REFUND' | 'PROMO';
  read: boolean;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'customer' | 'admin';
  phone?: string;
  token?: string;
}
