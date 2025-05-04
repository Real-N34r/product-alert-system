
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

// Set up CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configure supported websites with their selectors
const SUPPORTED_SITES = {
  'startech.com.bd': {
    name: 'Star Tech',
    baseUrl: 'https://www.startech.com.bd',
    productListSelector: '.p-item',
    nameSelector: 'h4.p-item-name',
    priceSelector: '.p-item-price',
    urlSelector: 'a',
    categoryPaths: [
      '/laptop-notebook/laptop',
      '/computer-components/processor',
      '/computer-components/graphics-card',
    ],
  },
  'ryans.com': {
    name: 'Ryans',
    baseUrl: 'https://www.ryanscomputers.com',
    productListSelector: '.category-products-grid .item',
    nameSelector: 'h2.product-name a',
    priceSelector: '.special-price .price',
    urlSelector: 'h2.product-name a',
    categoryPaths: [
      '/category/laptop-all-71',
      '/category/processor-all-196',
      '/category/graphics-card-all-106',
    ],
  },
  'techlandbd.com': {
    name: 'TechLand',
    baseUrl: 'https://www.techlandbd.com',
    productListSelector: '.product-item',
    nameSelector: '.product-title a',
    priceSelector: '.price',
    urlSelector: '.product-title a',
    categoryPaths: [
      '/computers/laptops',
      '/computer-components/processor',
      '/computer-components/graphics-card',
    ],
  },
  'ultratech.com.bd': {
    name: 'Ultra Tech',
    baseUrl: 'https://ultratech.com.bd',
    productListSelector: '.product-box',
    nameSelector: '.product-box-heading a',
    priceSelector: '.product-price',
    urlSelector: '.product-box-heading a',
    categoryPaths: [
      '/product-category/laptop',
      '/product-category/processor',
      '/product-category/graphics-card',
    ],
  },
  'binarylogic.com.bd': {
    name: 'Binary Logic',
    baseUrl: 'https://www.binarylogic.com.bd',
    productListSelector: '.product-item',
    nameSelector: '.product-item-link',
    priceSelector: '.price',
    urlSelector: '.product-item-link',
    categoryPaths: [
      '/laptop',
      '/processor',
      '/graphics-card',
    ],
  },
  'skyland.com.bd': {
    name: 'Skyland',
    baseUrl: 'https://www.skyland.com.bd',
    productListSelector: '.product-layout',
    nameSelector: '.name a',
    priceSelector: '.price-new',
    urlSelector: '.name a',
    categoryPaths: [
      '/laptop',
      '/processor',
      '/graphics-card',
    ],
  },
};

// Function to scrape products from a given URL
async function scrapeProducts(site, categoryPath) {
  const siteConfig = SUPPORTED_SITES[site];
  if (!siteConfig) {
    throw new Error(`Unsupported website: ${site}`);
  }

  const url = `${siteConfig.baseUrl}${categoryPath}`;
  console.log(`Scraping products from ${url}`);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const products = [];

    $(siteConfig.productListSelector).each((i, element) => {
      // Limit to first 10 products per page for efficiency
      if (i >= 10) return false;

      try {
        // Extract product details
        const nameElement = siteConfig.nameSelector.includes(' ')
          ? $(element).find(siteConfig.nameSelector)
          : $(element).find(siteConfig.nameSelector);
        
        const priceElement = $(element).find(siteConfig.priceSelector);
        const urlElement = $(element).find(siteConfig.urlSelector);

        const name = nameElement.text().trim();
        let priceText = priceElement.text().trim().replace(/[^\d.,]/g, '');
        priceText = priceText.replace(/,/g, '');
        const price = parseFloat(priceText) || 0;
        let url = urlElement.attr('href') || '';

        // Ensure URL is absolute
        if (url && !url.startsWith('http')) {
          url = `${siteConfig.baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
        }

        if (name && price > 0 && url) {
          products.push({
            name,
            current_price: price,
            url,
            shop_name: siteConfig.name,
          });
        }
      } catch (error) {
        console.error(`Error parsing product: ${error}`);
      }
    });

    return products;
  } catch (error) {
    console.error(`Error scraping ${url}: ${error}`);
    return [];
  }
}

// Function to save products to the database
async function saveProducts(supabase, products, shopName) {
  try {
    // First, get or create the shop
    let { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('*')
      .eq('name', shopName)
      .maybeSingle();

    if (shopError) throw shopError;

    // If shop doesn't exist, create it
    if (!shop) {
      const baseUrl = products.length > 0 
        ? new URL(products[0].url).origin 
        : "";
      
      const { data: newShop, error: createShopError } = await supabase
        .from('shops')
        .insert([{ name: shopName, base_url: baseUrl }])
        .select()
        .single();
      
      if (createShopError) throw createShopError;
      shop = newShop;
    }

    // Insert or update products
    for (const product of products) {
      // Check if product with similar name and url exists
      const { data: existingProducts, error: findError } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shop.id)
        .ilike('name', `%${product.name.substring(0, 30)}%`);
      
      if (findError) {
        console.error(`Error finding product: ${findError.message}`);
        continue;
      }

      let productId;

      if (existingProducts && existingProducts.length > 0) {
        // Update existing product
        const existingProduct = existingProducts[0];
        productId = existingProduct.id;
        
        // Only update if price changed
        if (existingProduct.current_price !== product.current_price) {
          const { error: updateError } = await supabase
            .from('products')
            .update({ 
              current_price: product.current_price,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingProduct.id);
            
          if (updateError) {
            console.error(`Error updating product: ${updateError.message}`);
            continue;
          }
          
          // Add to price history
          await supabase
            .from('price_history')
            .insert([{
              product_id: existingProduct.id,
              price: product.current_price,
            }]);
        }
      } else {
        // Create new product
        const { data: newProduct, error: insertError } = await supabase
          .from('products')
          .insert([{
            name: product.name,
            url: product.url,
            current_price: product.current_price,
            shop_id: shop.id,
          }])
          .select()
          .single();
          
        if (insertError) {
          console.error(`Error inserting product: ${insertError.message}`);
          continue;
        }
        
        productId = newProduct.id;
        
        // Add to price history
        await supabase
          .from('price_history')
          .insert([{
            product_id: newProduct.id,
            price: product.current_price,
          }]);
      }
    }

    return { success: true, count: products.length };
  } catch (error) {
    console.error(`Database error: ${error}`);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { site, categoryPath } = await req.json();
    
    if (!site || !SUPPORTED_SITES[site]) {
      return new Response(
        JSON.stringify({ error: 'Invalid site parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const siteConfig = SUPPORTED_SITES[site];
    const paths = categoryPath ? [categoryPath] : siteConfig.categoryPaths;
    
    const results = [];
    for (const path of paths) {
      const products = await scrapeProducts(site, path);
      if (products.length > 0) {
        const saveResult = await saveProducts(supabaseClient, products, siteConfig.name);
        results.push({ path, ...saveResult });
      } else {
        results.push({ path, success: false, error: 'No products found' });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(`Error in scrape-products function: ${error}`);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
