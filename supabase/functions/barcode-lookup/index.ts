
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { barcode } = await req.json()

    if (!barcode) {
      return new Response(
        JSON.stringify({ error: 'Barcode is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Try multiple barcode APIs
    let productData = null;

    // Try OpenFoodFacts API first (free and comprehensive)
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        const product = data.product;
        productData = {
          name: product.product_name || product.product_name_en || 'Unknown Product',
          brand: product.brands || '',
          ingredients: product.ingredients_text || product.ingredients_text_en || '',
          ingredients_list: product.ingredients || [],
          allergens: product.allergens || '',
          nutrition_grade: product.nutrition_grades || '',
          image_url: product.image_front_url || product.image_url || '',
          categories: product.categories || '',
          source: 'OpenFoodFacts'
        };
      }
    } catch (error) {
      console.log('OpenFoodFacts API failed:', error.message);
    }

    // Fallback: Try UPC Database API
    if (!productData) {
      try {
        const response = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`);
        const data = await response.json();
        
        if (data.code === 'OK' && data.items && data.items.length > 0) {
          const item = data.items[0];
          productData = {
            name: item.title || 'Unknown Product',
            brand: item.brand || '',
            ingredients: item.description || '',
            ingredients_list: [],
            allergens: '',
            nutrition_grade: '',
            image_url: item.images && item.images[0] || '',
            categories: item.category || '',
            source: 'UPCItemDB'
          };
        }
      } catch (error) {
        console.log('UPCItemDB API failed:', error.message);
      }
    }

    if (!productData) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Product not found in database',
          suggestions: [
            'Try entering ingredients manually',
            'Check if the barcode is clear and readable',
            'This might be a local or new product not yet in databases'
          ]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Process ingredients text into array
    if (productData.ingredients && !productData.ingredients_list.length) {
      productData.ingredients_list = productData.ingredients
        .split(/[,;.]/)
        .map((ing: string) => ing.trim())
        .filter((ing: string) => ing.length > 0)
        .filter((ing: string) => !ing.match(/^\d+$/));
    }

    console.log('Product lookup successful:', {
      barcode,
      product_name: productData.name,
      source: productData.source
    });

    return new Response(
      JSON.stringify({
        success: true,
        product: productData,
        barcode,
        lookup_timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in barcode-lookup function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to lookup product',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})
