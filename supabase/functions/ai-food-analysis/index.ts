
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enhanced allergen database with more comprehensive detection
const ALLERGEN_DATABASE = {
  'milk': {
    keywords: ['milk', 'dairy', 'lactose', 'casein', 'whey', 'butter', 'cream', 'cheese', 'yogurt', 'ghee', 'buttermilk'],
    severity: 'high',
    alternatives: ['almond milk', 'oat milk', 'coconut milk', 'soy milk']
  },
  'eggs': {
    keywords: ['egg', 'albumin', 'lecithin', 'mayonnaise', 'meringue', 'custard'],
    severity: 'high',
    alternatives: ['flax eggs', 'chia eggs', 'applesauce', 'mashed banana']
  },
  'fish': {
    keywords: ['fish', 'salmon', 'tuna', 'cod', 'anchovy', 'sardine', 'mackerel', 'halibut'],
    severity: 'high',
    alternatives: ['plant-based protein', 'tofu', 'tempeh', 'legumes']
  },
  'shellfish': {
    keywords: ['shellfish', 'shrimp', 'crab', 'lobster', 'clam', 'oyster', 'scallop', 'mussels'],
    severity: 'high',
    alternatives: ['mushrooms', 'seaweed', 'plant-based seafood']
  },
  'tree_nuts': {
    keywords: ['almond', 'walnut', 'cashew', 'pecan', 'pistachio', 'brazil nut', 'hazelnut', 'macadamia', 'pine nuts'],
    severity: 'high',
    alternatives: ['sunflower seeds', 'pumpkin seeds', 'hemp seeds']
  },
  'peanuts': {
    keywords: ['peanut', 'groundnut', 'arachis', 'peanut butter', 'peanut oil'],
    severity: 'high',
    alternatives: ['sunflower seed butter', 'almond butter', 'tahini']
  },
  'wheat': {
    keywords: ['wheat', 'gluten', 'flour', 'bread', 'pasta', 'cereal', 'barley', 'rye', 'spelt'],
    severity: 'medium',
    alternatives: ['rice flour', 'quinoa', 'gluten-free oats', 'almond flour']
  },
  'soy': {
    keywords: ['soy', 'soya', 'tofu', 'tempeh', 'soy sauce', 'edamame', 'miso'],
    severity: 'medium',
    alternatives: ['coconut aminos', 'chickpeas', 'lentils', 'hemp protein']
  }
}

async function analyzeWithHuggingFace(ingredients: string[], userAllergies: string[]): Promise<any> {
  try {
    const prompt = `Analyze these food ingredients for allergens: ${ingredients.join(', ')}
    
Known user allergies: ${userAllergies.join(', ')}

Identify potential allergens, assess safety, and provide recommendations. Focus on:
1. Common allergens (milk, eggs, nuts, soy, wheat, fish, shellfish)
2. Hidden allergen sources
3. Cross-contamination risks
4. Safety score (0-100)
5. Alternative suggestions

Response format: detected allergens, safety assessment, recommendations`;

    // Using Hugging Face's free inference API
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 500,
          temperature: 0.1,
          return_full_text: false
        }
      }),
    });

    if (!response.ok) {
      console.log('Hugging Face API not available, using enhanced local analysis');
      return null;
    }

    const data = await response.json();
    const aiResponse = data.generated_text || data[0]?.generated_text || '';
    
    // Parse AI response and structure it
    return {
      ai_analysis: aiResponse,
      enhanced: true
    };
  } catch (error) {
    console.error('Hugging Face analysis error:', error);
    return null;
  }
}

function enhancedAllergenAnalysis(ingredients: string[], userAllergies: string[]): any {
  const detectedAllergens: any[] = [];
  const recommendations: string[] = [];
  const alternatives: string[] = [];
  
  const lowerIngredients = ingredients.map(ing => ing.toLowerCase().trim());
  const lowerUserAllergies = userAllergies.map(allergy => allergy.toLowerCase().trim());
  
  // Enhanced detection with pattern matching
  for (const [allergen, data] of Object.entries(ALLERGEN_DATABASE)) {
    for (const ingredient of lowerIngredients) {
      for (const keyword of data.keywords) {
        if (ingredient.includes(keyword) || ingredient.match(new RegExp(`\\b${keyword}\\b`, 'i'))) {
          const isUserAllergy = lowerUserAllergies.some(ua => 
            ua.includes(allergen) || 
            allergen.includes(ua) ||
            data.keywords.some(kw => ua.includes(kw))
          );
          
          detectedAllergens.push({
            allergen,
            confidence: 0.9,
            source: ingredient,
            severity: data.severity,
            user_allergy: isUserAllergy
          });
          
          if (isUserAllergy) {
            alternatives.push(...data.alternatives);
          }
        }
      }
    }
  }
  
  // Remove duplicates
  const uniqueAllergens = detectedAllergens.filter((allergen, index, self) => 
    index === self.findIndex(a => a.allergen === allergen.allergen)
  );
  
  // Enhanced recommendations
  const userAllergyDetected = uniqueAllergens.some(d => d.user_allergy);
  if (userAllergyDetected) {
    recommendations.push("⚠️ CRITICAL WARNING: This product contains allergens that match your allergy profile!");
    recommendations.push("Do NOT consume this product. Consult your healthcare provider immediately.");
    recommendations.push("Always carry your emergency medication (EpiPen) when trying new foods.");
  } else if (uniqueAllergens.length > 0) {
    recommendations.push("This product contains common allergens that may affect some individuals.");
    recommendations.push("Check the full ingredient list and consult with an allergist if unsure.");
    recommendations.push("Consider alternatives if you have sensitivities to any detected allergens.");
  } else {
    recommendations.push("✅ No major allergens detected based on common allergen patterns.");
    recommendations.push("However, always read full labels as manufacturing processes may introduce cross-contamination.");
  }
  
  // Calculate enhanced safety score
  let safetyScore = 100;
  
  uniqueAllergens.forEach(allergen => {
    const basePenalty = allergen.severity === 'high' ? 25 : 15;
    const userPenalty = allergen.user_allergy ? basePenalty * 3 : basePenalty;
    safetyScore -= userPenalty;
  });
  
  safetyScore = Math.max(0, safetyScore);
  
  return {
    detected_allergens: uniqueAllergens,
    safety_score: safetyScore,
    recommendations,
    alternatives: [...new Set(alternatives)],
    user_allergies_detected: userAllergyDetected,
    analysis_method: 'enhanced_pattern_matching'
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { ingredients, user_id, food_name, barcode } = await req.json()

    if (!ingredients || !Array.isArray(ingredients)) {
      return new Response(
        JSON.stringify({ error: 'Ingredients array is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get user allergies from patient record
    let userAllergies: string[] = [];
    if (user_id) {
      const { data: patient } = await supabase
        .from('patients')
        .select('symptoms')
        .eq('id', user_id)
        .single()
      
      if (patient?.symptoms) {
        userAllergies = patient.symptoms.split(',').map(s => s.trim());
      }
    }

    // Try Hugging Face analysis first, fallback to enhanced local analysis
    let aiAnalysis = await analyzeWithHuggingFace(ingredients, userAllergies);
    let analysis = enhancedAllergenAnalysis(ingredients, userAllergies);

    if (aiAnalysis) {
      analysis = {
        ...analysis,
        ai_insights: aiAnalysis.ai_analysis,
        ai_enhanced: true
      };
    } else {
      analysis.ai_enhanced = false;
    }

    console.log('Enhanced food analysis completed:', {
      food_name,
      allergens_detected: analysis.detected_allergens?.length || 0,
      safety_score: analysis.safety_score,
      ai_enhanced: analysis.ai_enhanced,
      user_allergies_detected: analysis.user_allergies_detected
    });

    return new Response(
      JSON.stringify({
        success: true,
        analysis: {
          food_name: food_name || 'Unknown Food',
          barcode: barcode || null,
          allergens_detected: analysis.detected_allergens,
          ingredients_analyzed: ingredients,
          safety_score: analysis.safety_score,
          recommendations: analysis.recommendations,
          alternatives: analysis.alternatives,
          ai_enhanced: analysis.ai_enhanced,
          user_allergies_detected: analysis.user_allergies_detected,
          analyzed_at: new Date().toISOString(),
          ...(analysis.ai_insights && { ai_insights: analysis.ai_insights })
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in ai-food-analysis function:', error)
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
