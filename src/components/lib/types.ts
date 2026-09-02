export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  created_at: string;
}

export interface Seller {
  id: string;
  name: string;
  slug: string;
  avatar_url: string | null;
  bio: string | null;
  rating: number;
  sales_count: number;
  joined_at: string;
}

export interface Model {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  category_id: string | null;
  seller_id: string | null;
  image_url: string;
  gallery: string[];
  file_formats: string[];
  file_path?: string | null;
  file_url?: string | null;
  polygons: number;
  vertices: number;
  textures: boolean;
  rigged: boolean;
  animated: boolean;
  sale_type: 'digital' | 'physical';
  is_physical: boolean;
  shipping_cost: number;
  shipping_details: string | null;
  license_type: string;
  rating: number;
  review_count: number;
  download_count: number;
  is_free: boolean;
  created_at: string;
  categories?: Category;
  sellers?: Seller;
}

export interface Review {
  id: string;
  model_id: string;
  user_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  model_id: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: string;
  created_at: string;
  stripe_payment_intent_id?: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  model_id: string;
  model_title: string;
  price: number;
}

export interface CartItem {
  modelId: string;
  title: string;
  price: number;
  image_url: string;
  slug: string;
}

export interface Profile {
  id: string;
  email: string | null;
  is_admin: boolean;
  created_at: string;
}
