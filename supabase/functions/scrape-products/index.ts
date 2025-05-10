
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
      '/component/laptop',
      '/component/processor',
      '/component/graphics-card',
    ],
    categoryMapping: {
      'laptop': '/component/laptop',
      'cpu': '/component/processor',
      'graphics-card': '/component/graphics-card',
      'ram': '/component/ram',
      'motherboard': '/component/motherboard',
      'storage': '/component/hard-disk-drive',
      'power-supply': '/component/power-supply',
      'case': '/component/casing',
      'cooling': '/component/cpu-cooler',
      'monitor': '/monitor',
    }
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
    categoryMapping: {
      'laptop': '/category/laptop-all-71',
      'cpu': '/category/processor-all-196',
      'graphics-card': '/category/graphics-card-all-106',
      'ram': '/category/ram-all-197',
      'motherboard': '/category/motherboard-all-195',
      'storage': '/category/hard-disk-all-198',
      'power-supply': '/category/power-supply-all-199',
      'case': '/category/casing-all-194',
      'cooling': '/category/cooling-device-all-201',
      'monitor': '/category/monitor-all-85',
    }
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
    categoryMapping: {
      'laptop': '/computers/laptops',
      'cpu': '/computer-components/processor',
      'graphics-card': '/computer-components/graphics-card',
      'ram': '/computer-components/ram-memory',
      'motherboard': '/computer-components/motherboard',
      'storage': '/computer-components/storage-devices',
      'power-supply': '/computer-components/power-supply',
      'case': '/computer-components/casing',
      'cooling': '/computer-components/cooling-solutions',
      'monitor': '/monitors',
    }
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
    categoryMapping: {
      'laptop': '/product-category/laptop',
      'cpu': '/product-category/processor',
      'graphics-card': '/product-category/graphics-card',
      'ram': '/product-category/ram',
      'motherboard': '/product-category/motherboard',
      'storage': '/product-category/storage',
      'power-supply': '/product-category/power-supply',
      'case': '/product-category/casing',
      'cooling': '/product-category/cooling',
      'monitor': '/product-category/monitor',
    }
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
    categoryMapping: {
      'laptop': '/laptop',
      'cpu': '/processor',
      'graphics-card': '/graphics-card',
      'ram': '/ram',
      'motherboard': '/motherboard',
      'storage': '/storage',
      'power-supply': '/power-supply',
      'case': '/casing',
      'cooling': '/cooling',
      'monitor': '/monitor',
    }
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
    categoryMapping: {
      'laptop': '/laptop',
      'cpu': '/processor',
      'graphics-card': '/graphics-card',
      'ram': '/ram',
      'motherboard': '/motherboard',
      'storage': '/storage',
      'power-supply': '/power-supply',
      'case': '/casing',
      'cooling': '/cooling',
      'monitor': '/monitor',
    }
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
async function saveProducts(supabase, products, shopName, category = null) {
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
      // Set the category if provided
      const productData = {
        ...product,
        category: category
      };
      
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
        
        // Only update if price changed or adding a category
        if (existingProduct.current_price !== product.current_price || 
            (category && !existingProduct.category)) {
          
          const updateData: any = { 
            current_price: product.current_price,
            updated_at: new Date().toISOString()
          };
          
          // Add category if it's provided and not already set
          if (category && !existingProduct.category) {
            updateData.category = category;
          }
          
          const { error: updateError } = await supabase
            .from('products')
            .update(updateData)
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
            category: category
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

// Function to check if any products have dropped in price and notify users
async function checkPriceAlerts(supabase) {
  try {
    // Get all price drops from the last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: priceDrops, error: priceDropsError } = await supabase
      .from('price_history')
      .select(`
        product_id,
        price,
        checked_at,
        product:products(
          id,
          name,
          current_price,
          category
        )
      `)
      .gt('checked_at', yesterday.toISOString())
      .order('checked_at', { ascending: false });
      
    if (priceDropsError) throw priceDropsError;
    
    const processedProducts = new Set();
    const categoryPriceDrops = new Map();
    
    // Process price drops by product
    for (const drop of priceDrops) {
      const productId = drop.product_id;
      
      // Skip if we've already processed this product
      if (processedProducts.has(productId)) continue;
      processedProducts.add(productId);
      
      // Get previous price for this product
      const { data: previousPrices, error: previousPricesError } = await supabase
        .from('price_history')
        .select('price')
        .eq('product_id', productId)
        .lt('checked_at', drop.checked_at)
        .order('checked_at', { ascending: false })
        .limit(1);
        
      if (previousPricesError || !previousPrices?.length) continue;
      
      const currentPrice = drop.product.current_price;
      const previousPrice = previousPrices[0].price;
      
      // Check if price has decreased
      if (currentPrice < previousPrice) {
        // Track category price drops for category-based alerts
        if (drop.product.category) {
          if (!categoryPriceDrops.has(drop.product.category)) {
            categoryPriceDrops.set(drop.product.category, []);
          }
          categoryPriceDrops.get(drop.product.category).push({
            productId,
            productName: drop.product.name,
            currentPrice,
            previousPrice,
            priceDrop: previousPrice - currentPrice
          });
        }
        
        // Find alerts for specific products
        const { data: productAlerts, error: productAlertsError } = await supabase
          .from('alerts')
          .select('id, user_id, threshold, direction')
          .eq('product_id', productId);
          
        if (productAlertsError) continue;
        
        // Process product-specific alerts
        for (const alert of productAlerts) {
          // Check if price threshold is met
          if (alert.direction === 'down' && currentPrice <= alert.threshold) {
            // Here you would send a notification to the user
            console.log(`Alert triggered for user ${alert.user_id} - Product ${drop.product.name} price dropped to ${currentPrice}`);
          }
        }
      }
    }
    
    // Process category-based alerts
    for (const [category, drops] of categoryPriceDrops.entries()) {
      if (drops.length === 0) continue;
      
      // Find alerts for this category
      const { data: categoryAlerts, error: categoryAlertsError } = await supabase
        .from('alerts')
        .select(`
          id, 
          user_id, 
          threshold, 
          direction,
          category:product_categories!category_id(name)
        `)
        .eq('category_id', category);
        
      if (categoryAlertsError) continue;
      
      // Process each category alert
      for (const alert of categoryAlerts) {
        // Find the biggest price drop in this category
        const biggestDrop = drops.sort((a, b) => b.priceDrop - a.priceDrop)[0];
        
        // Check if any product's price threshold is met
        const matchingDrops = drops.filter(drop => 
          alert.direction === 'down' && drop.currentPrice <= alert.threshold);
          
        if (matchingDrops.length > 0) {
          // Here you would send a notification to the user
          console.log(`Category Alert triggered for user ${alert.user_id} - ${matchingDrops.length} products in ${category} category dropped below ${alert.threshold}`);
        }
      }
    }
    
    return { success: true, message: "Price alerts checked successfully" };
  } catch (error) {
    console.error(`Error checking price alerts: ${error}`);
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

    const { site, categorySlug, categoryPath } = await req.json();
    
    if (!site || !SUPPORTED_SITES[site]) {
      return new Response(
        JSON.stringify({ error: 'Invalid site parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const siteConfig = SUPPORTED_SITES[site];
    let paths = [];
    
    // If a specific category slug is provided (e.g. 'ram', 'cpu'), use its mapped path
    if (categorySlug && siteConfig.categoryMapping && siteConfig.categoryMapping[categorySlug]) {
      paths = [siteConfig.categoryMapping[categorySlug]];
    } 
    // If a specific category path is provided, use it
    else if (categoryPath) {
      paths = [categoryPath];
    } 
    // Otherwise, use the default category paths
    else {
      paths = siteConfig.categoryPaths;
    }
    
    const results = [];
    for (const path of paths) {
      const category = categorySlug || null; // Use the category slug if provided
      const products = await scrapeProducts(site, path);
      
      if (products.length > 0) {
        const saveResult = await saveProducts(supabaseClient, products, siteConfig.name, category);
        results.push({ path, category, ...saveResult });
      } else {
        results.push({ path, category, success: false, error: 'No products found' });
      }
    }
    
    // Check for price alerts after scraping
    await checkPriceAlerts(supabaseClient);

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
