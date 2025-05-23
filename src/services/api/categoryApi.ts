
import { supabase } from "@/integrations/supabase/client";
import { ProductCategory, Product } from "@/types/database";

export const categoryApi = {
  getAll: async (): Promise<ProductCategory[]> => {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('name');
    if (error) throw error;
    return data as ProductCategory[];
  },
  
  getById: async (id: string): Promise<ProductCategory> => {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as ProductCategory;
  },
  
  getBySlug: async (slug: string): Promise<ProductCategory> => {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data as ProductCategory;
  },
  
  getProductsByCategory: async (categorySlug: string): Promise<Product[]> => {
    console.log("Fetching products for category slug:", categorySlug);
    
    const { data, error } = await supabase
      .from('products')
      .select('*, shop:shops(*)')
      .eq('category', categorySlug);
      
    if (error) {
      console.error("Error fetching category products:", error);
      throw error;
    }
    
    console.log("Products found:", data?.length || 0);
    return data as Product[];
  }
};
