
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Common allergens database
const COMMON_ALLERGENS = {
  'milk': ['milk', 'dairy', 'lactose', 'casein', 'whey', 'butter', 'cream', 'cheese', 'yogurt'],
  'eggs': ['egg', 'albumin', 'lecithin', 'mayonnaise'],
  'fish': ['fish', 'salmon', 'tuna', 'cod', 'anchovy', 'sardine'],
  'shellfish': ['shellfish', 'shrimp', 'crab', 'lobster', 'clam', 'oyster', 'scallop'],
  'tree_nuts': ['almond', 'walnut', 'cashew', 'pecan', 'pistachio', 'brazil nut', 'hazelnut', 'macadamia'],
  'peanuts': ['peanut', 'groundnut', 'arachis'],
  'wheat': ['wheat', 'gluten', 'flour', 'bread', 'pasta', 'cereal'],
  'soy': ['soy', 'soya', 'tofu', 'tempeh', 'soy sauce', 'edamame']
}

interface AnalysisResult {
  allergens_detected: string[]
  ingredients_analyzed: string[]
  safety_score: number
  recommendations: string[]
}

function analyzeIngredients(ingredients: string[], userSymptoms: string): AnalysisResult {
  const detectedAllergens: string[] = []
  const recommendations: string[] = []
  
  // Convert ingredients to lowercase for matching
  const lowerIngredients = ingredients.map(ing => ing.toLowerCase().trim())
  
  // Check each ingredient against allergen database
  for (const [allergen, keywords] of Object.entries(COMMON_ALLERGENS)) {
    for (const ingredient of lowerIngredients) {
      for (const keyword of keywords) {
        if (ingredient.includes(keyword)) {
          if (!detectedAllergens.includes(allergen)) {
            detectedAllergens.push(allergen)
          }
        }
      }
    }
  }
  
  // Calculate safety score (0-100, higher is safer)
  const safetyScore = Math.max(0, 100 - (detectedAllergens.length * 15))
  
  // Generate recommendations based on detected allergens
  if (detectedAllergens.length === 0) {
    recommendations.push("No common allergens detected in the ingredients.")
    recommendations.push("This food appears safe based on common allergen analysis.")
  } else {
    recommendations.push(`⚠️ Detected allergens: ${detectedAllergens.join(', ')}`)
    recommendations.push("Please consult with your healthcare provider before consuming.")
    
    if (userSymptoms) {
      recommendations.push("Cross-reference with your known symptoms and allergies.")
    }
  }
  
  return {
    allergens_detected: detectedAllergens,
    ingredients_analyzed: lowerIngredients,
    safety_score: safetyScore,
    recommendations
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { ingredients, user_id, food_name } = await req.json()

    if (!ingredients || !Array.isArray(ingredients)) {
      return new Response(
        JSON.stringify({ error: 'Ingredients array is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get user symptoms if user_id is provided
    let userSymptoms = ''
    if (user_id) {
      const { data: patient } = await supabase
        .from('patients')
        .select('symptoms')
        .eq('id', user_id)
        .single()
      
      userSymptoms = patient?.symptoms || ''
    }

    // Analyze the ingredients
    const analysis = analyzeIngredients(ingredients, userSymptoms)

    // Log the analysis for debugging
    console.log('Food analysis completed:', {
      food_name,
      allergens_detected: analysis.allergens_detected,
      safety_score: analysis.safety_score
    })

    return new Response(
      JSON.stringify({
        success: true,
        analysis: {
          food_name: food_name || 'Unknown Food',
          ...analysis,
          analyzed_at: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in analyze-food function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze food',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})
