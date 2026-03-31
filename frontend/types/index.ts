export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  discount?: number; // percentage off, e.g. 10 = 10%
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number; // price at time of purchase
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discount: number; // percentage
  code: string;     // promo code
  expiresAt: string;
  active: boolean;
}

export interface CmsContent {
  key: string;
  title: string;
  body: string;
  updatedAt: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  summary: string;
  details: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewsPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  createdAt: string;
}

export interface ProjectInterest {
  id: string;
  projectId: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  createdAt: string;
}

export type PermissionSection =
  | "HOME"
  | "ABOUT"
  | "SERVICES"
  | "PROJECTS"
  | "BLOG"
  | "NEWS"
  | "CONTACT";
