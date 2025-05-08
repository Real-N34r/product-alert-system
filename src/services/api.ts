
import { supabase } from "@/integrations/supabase/client";
import { Shop, Product, PriceHistory, Alert } from "@/types/database";

// Shop API
export const shopApi = {
  getAll: async (): Promise<Shop[]> => {
    const { data, error } = await supabase.from('shops').select('*');
    if (error) throw error;
    return data as Shop[];
  },
  
  getById: async (id: string): Promise<Shop> => {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Shop;
  },
  
  create: async (shop: Omit<Shop, 'id' | 'created_at'>): Promise<Shop> => {
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("Must be logged in to create a shop");
    
    const { data, error } = await supabase
      .from('shops')
      .insert([{ ...shop, user_id: user.id }])
      .select()
      .single();
    if (error) throw error;
    return data as Shop;
  },
  
  update: async (id: string, shop: Partial<Shop>): Promise<Shop> => {
    const { data, error } = await supabase
      .from('shops')
      .update(shop)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Shop;
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('shops')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Product API
export const productApi = {
  getAll: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*, shop:shops(*)');
    if (error) throw error;
    return data as Product[];
  },
  
  getById: async (id: string): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .select('*, shop:shops(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Product;
  },
  
  getByShopId: async (shopId: string): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*, shop:shops(*)')
      .eq('shop_id', shopId);
    if (error) throw error;
    return data as Product[];
  },
  
  create: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'shop'>): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  },
  
  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Price History API
export const priceHistoryApi = {
  getByProductId: async (productId: string): Promise<PriceHistory[]> => {
    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('product_id', productId)
      .order('checked_at', { ascending: false });
    if (error) throw error;
    return data as PriceHistory[];
  },
  
  create: async (priceHistory: Omit<PriceHistory, 'id' | 'checked_at'>): Promise<PriceHistory> => {
    const { data, error } = await supabase
      .from('price_history')
      .insert([priceHistory])
      .select()
      .single();
    if (error) throw error;
    return data as PriceHistory;
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('price_history')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Alert API
export const alertApi = {
  getUserAlerts: async (): Promise<Alert[]> => {
    const { data, error } = await supabase
      .from('alerts')
      .select('*, product:products(*, shop:shops(*))')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Alert[];
  },
  
  getByProductId: async (productId: string): Promise<Alert[]> => {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('product_id', productId);
    if (error) throw error;
    return data as Alert[];
  },
  
  create: async (alert: Omit<Alert, 'id' | 'user_id' | 'created_at' | 'product'>): Promise<Alert> => {
    // Get the current user's ID
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User must be authenticated to create an alert');
    
    const newAlert = {
      ...alert,
      user_id: user.id,
    };
    
    const { data, error } = await supabase
      .from('alerts')
      .insert([newAlert])
      .select()
      .single();
    if (error) throw error;
    return data as Alert;
  },
  
  update: async (id: string, alert: Partial<Alert>): Promise<Alert> => {
    const { data, error } = await supabase
      .from('alerts')
      .update(alert)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Alert;
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
