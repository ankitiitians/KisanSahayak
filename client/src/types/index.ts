import { 
  User, 
  Farmer, 
  Product, 
  ProductImage, 
  Order, 
  OrderItem,
  Category,
  Review,
  Message,
  CartItem
} from '@shared/schema';

// Extended types that combine multiple entities
export type ProductWithImages = Product & {
  images: ProductImage[];
  farmerName?: string;
  farmerLocation?: string;
};

export type OrderWithItems = Order & {
  items: (OrderItem & { product: ProductWithImages })[];
};

export type CategoryWithProductCount = Category & {
  productCount: number;
};

export type FarmerWithUser = Farmer & {
  user: User;
};

export type MessageWithSenderInfo = Message & {
  senderName: string;
  senderRole: string;
};

export type CartItemWithProduct = CartItem & {
  product: ProductWithImages;
};

// Authentication related types
export type AuthUser = {
  id: number;
  name: string;
  role: string;
  phone: string;
};

// Form submission types
export type LoginFormData = {
  phone: string;
  password: string;
};

export type CustomerRegisterFormData = {
  name: string;
  phone: string;
  email?: string;
  password: string;
  confirmPassword: string;
  address: string;
  state: string;
};

export type FarmerRegisterFormData = CustomerRegisterFormData & {
  farmName?: string;
  farmLocation?: string;
  farmSize?: string;
  aadhaarNumber?: string;
  bankAccount?: string;
  ifscCode?: string;
};

export type ProductFormData = {
  name: string;
  nameHi?: string;
  description: string;
  descriptionHi?: string;
  price: number;
  stock: number;
  unit: string;
  categoryId: number;
  isOrganic: boolean;
  isSeasonal: boolean;
  images: File[];
};

export type OTPVerificationForm = {
  otp: string;
};

// API response types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

// Filter and search types
export type ProductFilters = {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  isOrganic?: boolean;
  isSeasonal?: boolean;
  searchTerm?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popularity';
};
