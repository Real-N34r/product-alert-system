
import { supabase } from "@/integrations/supabase/client";
import { Alert } from "@/types/database";

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
  
  getByCategoryId: async (categoryId: string): Promise<Alert[]> => {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('category_id', categoryId);
    if (error) throw error;
    return data as Alert[];
  },
  
  create: async (alert: Omit<Alert, 'id' | 'user_id' | 'created_at' | 'product'>): Promise<Alert> => {
    // Get the current user's ID
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User must be authenticated to create an alert');
    
    // Validate that either product_id or category_id is provided, but not both
    if ((!alert.product_id && !alert.category_id) || (alert.product_id && alert.category_id)) {
      throw new Error('Must specify either a product_id or category_id, but not both');
    }
    
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
