import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schemas - shared between customers and farmers
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  address: text("address"),
  state: text("state").notNull(),
  role: text("role").notNull(), // "farmer", "customer", "admin"
  createdAt: timestamp("created_at").defaultNow(),
  isVerified: boolean("is_verified").default(false),
});

// Farmer specific details
export const farmers = pgTable("farmers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  farmName: text("farm_name"),
  farmSize: text("farm_size"),
  farmLocation: text("farm_location"),
  aadhaarNumber: text("aadhaar_number"),
  bankAccount: text("bank_account"),
  ifscCode: text("ifsc_code"),
  bio: text("bio"),
  avgRating: doublePrecision("avg_rating").default(0),
  totalRatings: integer("total_ratings").default(0),
});

// Categories for products
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameHi: text("name_hi").notNull(),
  icon: text("icon").notNull(),
  bgColor: text("bg_color").notNull(),
  iconColor: text("icon_color").notNull(),
});

// Products listed by farmers
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameHi: text("name_hi"),
  description: text("description").notNull(),
  descriptionHi: text("description_hi"),
  price: doublePrecision("price").notNull(),
  stock: integer("stock").notNull(),
  unit: text("unit").notNull(), // kg, liter, piece, etc.
  farmerId: integer("farmer_id").notNull().references(() => farmers.id),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  isOrganic: boolean("is_organic").default(false),
  isSeasonal: boolean("is_seasonal").default(false),
  avgRating: doublePrecision("avg_rating").default(0),
  totalRatings: integer("total_ratings").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Product images
export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  imageUrl: text("image_url").notNull(),
  isMain: boolean("is_main").default(false),
});

// Orders placed by customers
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => users.id),
  totalAmount: doublePrecision("total_amount").notNull(),
  status: text("status").notNull(), // "pending", "confirmed", "shipped", "delivered", "cancelled"
  paymentMethod: text("payment_method").notNull(), // "upi", "card", "wallet", "cod"
  paymentStatus: text("payment_status").notNull(), // "pending", "completed", "failed"
  deliveryAddress: text("delivery_address").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items - individual products within an order
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  productId: integer("product_id").notNull().references(() => products.id),
  farmerId: integer("farmer_id").notNull().references(() => farmers.id),
  quantity: integer("quantity").notNull(),
  price: doublePrecision("price").notNull(),
  status: text("status").notNull(), // "pending", "confirmed", "shipped", "delivered", "cancelled"
});

// Reviews given by customers
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  customerId: integer("customer_id").notNull().references(() => users.id),
  farmerId: integer("farmer_id").notNull().references(() => farmers.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages between farmers and customers
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cart items
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
});

// OTP records for verification
export const otps = pgTable("otps", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertFarmerSchema = createInsertSchema(farmers).omit({ id: true, avgRating: true, totalRatings: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, avgRating: true, totalRatings: true });
export const insertProductImageSchema = createInsertSchema(productImages).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, isRead: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, addedAt: true });
export const insertOtpSchema = createInsertSchema(otps).omit({ id: true, isVerified: true, createdAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Farmer = typeof farmers.$inferSelect;
export type InsertFarmer = z.infer<typeof insertFarmerSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type ProductImage = typeof productImages.$inferSelect;
export type InsertProductImage = z.infer<typeof insertProductImageSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type OTP = typeof otps.$inferSelect;
export type InsertOTP = z.infer<typeof insertOtpSchema>;
