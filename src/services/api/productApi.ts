
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/database";

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
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("Must be logged in to create a product");
    
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
