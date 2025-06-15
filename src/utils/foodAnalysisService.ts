
import { supabase } from '@/integrations/supabase/client';

export interface FoodAnalysisResult {
  success: boolean;
  analysis?: {
    food_name: string;
    allergens_detected: any[];
    ingredients_analyzed: string[];
    safety_score: number;
    recommendations: string[];
    alternatives?: string[];
    ai_enhanced?: boolean;
    user_allergies_detected?: boolean;
    analyzed_at: string;
    barcode?: string;
  };
  error?: string;
}

export interface BarcodeResult {
  success: boolean;
  product?: {
    name: string;
    brand: string;
    ingredients: string;
    ingredients_list: string[];
    allergens: string;
    image_url: string;
    categories: string;
    source: string;
  };
  error?: string;
  suggestions?: string[];
}

/**
 * Analyze food ingredients using AI-powered backend
 */
export const analyzeFoodIngredients = async (
  ingredients: string[],
  foodName?: string,
  userId?: string,
  barcode?: string
): Promise<FoodAnalysisResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('ai-food-analysis', {
      body: {
        ingredients,
        food_name: foodName,
        user_id: userId,
        barcode
      }
    });

    if (error) {
      console.error('Error calling ai-food-analysis function:', error);
      return {
        success: false,
        error: error.message || 'Failed to analyze food'
      };
    }

    return data;
  } catch (error) {
    console.error('Exception in analyzeFoodIngredients:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Look up product information by barcode
 */
export const lookupProductByBarcode = async (barcode: string): Promise<BarcodeResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('barcode-lookup', {
      body: { barcode }
    });

    if (error) {
      console.error('Error calling barcode-lookup function:', error);
      return {
        success: false,
        error: error.message || 'Failed to lookup product'
      };
    }

    return data;
  } catch (error) {
    console.error('Exception in lookupProductByBarcode:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Parse ingredients from a text string
 */
export const parseIngredientsText = (text: string): string[] => {
  if (!text) return [];
  
  return text
    .split(/[,;.\n]/)
    .map(ingredient => ingredient.trim())
    .filter(ingredient => ingredient.length > 0)
    .filter(ingredient => !ingredient.match(/^\d+$/));
};

/**
 * Format allergen names for display
 */
export const formatAllergenName = (allergen: string): string => {
  return allergen
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
