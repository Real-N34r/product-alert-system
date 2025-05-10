
import { supabase } from "@/integrations/supabase/client";
import { PriceHistory } from "@/types/database";

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
