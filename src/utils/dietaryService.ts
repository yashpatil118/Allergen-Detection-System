
import { supabase } from '@/integrations/supabase/client';

export interface DietaryRecommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  foods: string[];
  avoid: string[];
  tips: string[];
  safety_score: number;
  allergen_specific: boolean;
}

export interface DietaryPlan {
  success: boolean;
  recommendations?: DietaryRecommendation[];
  meal_plan?: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
  shopping_list?: string[];
  ai_enhanced?: boolean;
  error?: string;
}

// Enhanced dietary database with comprehensive allergy-safe options
const DIETARY_DATABASE = {
  'milk': {
    safe_foods: ['oat milk', 'almond milk', 'coconut milk', 'rice milk', 'soy milk', 'dairy-free cheese', 'coconut yogurt'],
    avoid_foods: ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'ice cream', 'whey protein'],
    meal_suggestions: {
      breakfast: ['oatmeal with almond milk', 'dairy-free smoothie', 'avocado toast'],
      lunch: ['quinoa salad', 'hummus wrap', 'dairy-free soup'],
      dinner: ['grilled chicken with vegetables', 'dairy-free pasta', 'stir-fry with coconut milk'],
      snacks: ['nuts', 'fruits', 'dairy-free crackers']
    },
    tips: ['Read labels for hidden dairy', 'Try fortified plant milks for calcium', 'Look for "vegan" labels']
  },
  'eggs': {
    safe_foods: ['chia seeds', 'flax seeds', 'aquafaba', 'banana', 'applesauce', 'tofu scramble'],
    avoid_foods: ['eggs', 'mayonnaise', 'custard', 'meringue', 'some baked goods'],
    meal_suggestions: {
      breakfast: ['chia pudding', 'oatmeal', 'smoothie bowl', 'avocado toast'],
      lunch: ['quinoa bowl', 'lentil soup', 'vegetable wrap'],
      dinner: ['grilled fish with rice', 'vegetable curry', 'bean salad'],
      snacks: ['fruit', 'nuts', 'veggie sticks with hummus']
    },
    tips: ['Use flax eggs in baking', 'Check vaccine ingredients', 'Be careful with processed foods']
  },
  'nuts': {
    safe_foods: ['sunflower seeds', 'pumpkin seeds', 'tahini', 'sunflower seed butter', 'hemp seeds'],
    avoid_foods: ['almonds', 'walnuts', 'cashews', 'pistachios', 'hazelnuts', 'pecans'],
    meal_suggestions: {
      breakfast: ['seed butter toast', 'oatmeal with seeds', 'fruit smoothie'],
      lunch: ['seed-based salad', 'hummus wrap', 'quinoa bowl'],
      dinner: ['grilled protein with vegetables', 'seed-crusted fish', 'vegetable stir-fry'],
      snacks: ['sunflower seeds', 'pumpkin seeds', 'safe granola bars']
    },
    tips: ['Carry safe snacks', 'Inform restaurants about tree nut allergies', 'Check for cross-contamination']
  },
  'wheat': {
    safe_foods: ['rice', 'quinoa', 'corn', 'potatoes', 'gluten-free oats', 'almond flour', 'coconut flour'],
    avoid_foods: ['wheat', 'bread', 'pasta', 'cereal', 'crackers', 'beer', 'soy sauce'],
    meal_suggestions: {
      breakfast: ['rice porridge', 'gluten-free oats', 'quinoa breakfast bowl'],
      lunch: ['rice bowl', 'corn tortilla wrap', 'potato salad'],
      dinner: ['rice noodles', 'quinoa pilaf', 'baked potato with toppings'],
      snacks: ['rice cakes', 'corn chips', 'fruits and vegetables']
    },
    tips: ['Look for certified gluten-free products', 'Use alternative flours for baking', 'Check medication ingredients']
  },
  'soy': {
    safe_foods: ['coconut aminos', 'chickpeas', 'lentils', 'hemp protein', 'pea protein'],
    avoid_foods: ['soy sauce', 'tofu', 'tempeh', 'edamame', 'soy milk', 'miso'],
    meal_suggestions: {
      breakfast: ['pea protein smoothie', 'oatmeal', 'fruit bowl'],
      lunch: ['chickpea salad', 'lentil soup', 'quinoa bowl'],
      dinner: ['grilled meat with vegetables', 'coconut curry', 'bean-based dishes'],
      snacks: ['nuts', 'seeds', 'fresh fruit']
    },
    tips: ['Use coconut aminos instead of soy sauce', 'Check processed foods for soy lecithin', 'Read supplement labels']
  }
};

function generateEnhancedDietaryPlan(userAllergies: string[]): DietaryPlan {
  const recommendations: DietaryRecommendation[] = [];
  const mealPlan = {
    breakfast: [] as string[],
    lunch: [] as string[],
    dinner: [] as string[],
    snacks: [] as string[]
  };
  const shoppingList: string[] = [];

  // Process each user allergy
  userAllergies.forEach((allergy, index) => {
    const allergyKey = allergy.toLowerCase().trim();
    const allergyData = DIETARY_DATABASE[allergyKey as keyof typeof DIETARY_DATABASE];

    if (allergyData) {
      recommendations.push({
        id: `rec-${index}`,
        category: `${allergy} Management`,
        title: `Safe Foods for ${allergy} Allergy`,
        description: `Comprehensive dietary guidance for managing ${allergy} allergies with safe alternatives and meal suggestions.`,
        foods: allergyData.safe_foods,
        avoid: allergyData.avoid_foods,
        tips: allergyData.tips,
        safety_score: 90,
        allergen_specific: true
      });

      // Add to meal plan
      mealPlan.breakfast.push(...allergyData.meal_suggestions.breakfast);
      mealPlan.lunch.push(...allergyData.meal_suggestions.lunch);
      mealPlan.dinner.push(...allergyData.meal_suggestions.dinner);
      mealPlan.snacks.push(...allergyData.meal_suggestions.snacks);

      // Add to shopping list
      shoppingList.push(...allergyData.safe_foods);
    }
  });

  // Add general recommendations
  recommendations.push({
    id: 'general-safety',
    category: 'General Food Safety',
    title: 'Universal Allergy Safety Tips',
    description: 'Essential practices for managing food allergies safely in daily life.',
    foods: ['fresh fruits', 'fresh vegetables', 'plain rice', 'plain potatoes', 'lean meats'],
    avoid: ['processed foods with unclear ingredients', 'foods without labels', 'cross-contaminated items'],
    tips: [
      'Always read food labels carefully',
      'Inform restaurants about your allergies',
      'Carry emergency medication',
      'Use dedicated cooking utensils',
      'Store allergen-free foods separately',
      'Keep a food diary to track reactions'
    ],
    safety_score: 95,
    allergen_specific: false
  });

  // Remove duplicates from meal plan and shopping list
  Object.keys(mealPlan).forEach(key => {
    mealPlan[key as keyof typeof mealPlan] = [...new Set(mealPlan[key as keyof typeof mealPlan])];
  });

  return {
    success: true,
    recommendations,
    meal_plan: mealPlan,
    shopping_list: [...new Set(shoppingList)],
    ai_enhanced: false
  };
}

/**
 * Generate personalized dietary recommendations based on user allergies
 */
export const generateDietaryRecommendations = async (userId?: string): Promise<DietaryPlan> => {
  try {
    let userAllergies: string[] = [];

    // Get user allergies from database
    if (userId) {
      const { data: patient, error } = await supabase
        .from('patients')
        .select('symptoms')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user allergies:', error);
      } else if (patient?.symptoms) {
        userAllergies = patient.symptoms.split(',').map(s => s.trim());
      }
    }

    // If no user allergies found, provide general recommendations
    if (userAllergies.length === 0) {
      userAllergies = ['general'];
    }

    // Try to enhance with Hugging Face (free alternative)
    try {
      const prompt = `Create dietary recommendations for someone with allergies to: ${userAllergies.join(', ')}. Include safe foods, foods to avoid, and meal suggestions.`;
      
      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 300,
            temperature: 0.1,
            return_full_text: false
          }
        }),
      });

      const plan = generateEnhancedDietaryPlan(userAllergies);

      if (response.ok) {
        const data = await response.json();
        const aiInsights = data.generated_text || data[0]?.generated_text;
        
        if (aiInsights && aiInsights.trim()) {
          plan.ai_enhanced = true;
          // Add AI insights as a recommendation
          plan.recommendations?.unshift({
            id: 'ai-insights',
            category: 'AI Enhanced Recommendations',
            title: 'Personalized AI Guidance',
            description: aiInsights.trim(),
            foods: [],
            avoid: [],
            tips: [],
            safety_score: 85,
            allergen_specific: true
          });
        }
      }

      return plan;
    } catch (aiError) {
      console.error('AI enhancement failed, using local recommendations:', aiError);
      return generateEnhancedDietaryPlan(userAllergies);
    }

  } catch (error) {
    console.error('Error generating dietary recommendations:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate dietary recommendations'
    };
  }
};

/**
 * Get safe food alternatives for a specific allergen
 */
export const getSafeAlternatives = (allergen: string): string[] => {
  const allergyData = DIETARY_DATABASE[allergen.toLowerCase() as keyof typeof DIETARY_DATABASE];
  return allergyData?.safe_foods || [];
};

/**
 * Check if a food item is safe for user's allergies
 */
export const checkFoodSafety = (foodItem: string, userAllergies: string[]): boolean => {
  const lowerFoodItem = foodItem.toLowerCase();
  
  return !userAllergies.some(allergy => {
    const allergyData = DIETARY_DATABASE[allergy.toLowerCase() as keyof typeof DIETARY_DATABASE];
    return allergyData?.avoid_foods.some(avoidFood => 
      lowerFoodItem.includes(avoidFood.toLowerCase())
    );
  });
};
