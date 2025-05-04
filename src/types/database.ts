
export interface Shop {
  id: string;
  name: string;
  base_url: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  shop_id: string;
  current_price: number;
  url: string;
  created_at: string;
  updated_at: string;
  shop?: Shop; // For joined queries
}

export interface PriceHistory {
  id: string;
  product_id: string;
  price: number;
  checked_at: string;
  product?: Product; // For joined queries
}

export interface Alert {
  id: string;
  user_id: string;
  product_id: string;
  threshold: number;
  direction: 'up' | 'down';
  created_at: string;
  product?: Product; // For joined queries
}
