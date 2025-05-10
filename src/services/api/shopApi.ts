
import { supabase } from "@/integrations/supabase/client";
import { Shop } from "@/types/database";

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
