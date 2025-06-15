import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Check, ExternalLink, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { generateDietaryRecommendations, getSafeAlternatives } from '@/utils/dietaryService';

const DietaryManagement = () => {
  const [dietPlan, setDietPlan] = useState<any>(null);
  const [safeRecipes, setSafeRecipes] = useState<any[]>([]);
  const [userAllergies, setUserAllergies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadDietaryData = async () => {
      setLoading(true);
      try {
        // Get user allergies from localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const allergiesString = user.symptoms || localStorage.getItem('allergies') || '';
        const allergiesList = allergiesString ? allergiesString.split(',').map((a: string) => a.trim()) : [];
        
        setUserAllergies(allergiesList);
        
        if (allergiesList.length === 0) {
          // If no allergies, provide general healthy diet recommendations
          setDietPlan({
            alternatives: [
              'Fresh fruits and vegetables',
              'Whole grains (brown rice, quinoa, oats)',
              'Lean proteins (chicken, fish, legumes)',
              'Nuts and seeds',
              'Low-fat dairy or plant-based alternatives',
              'Healthy fats (olive oil, avocado)',
              'Plenty of water'
            ],
            restrictions: [
              'Highly processed foods',
              'Excessive sugar and refined carbs',
              'Trans fats and fried foods',
              'Excessive sodium',
              'Artificial additives and preservatives'
            ],
            supplementation: [
              'Consult with a nutritionist for personalized advice',
              'Consider a daily multivitamin',
              'Omega-3 fatty acids for heart health',
              'Vitamin D if you have limited sun exposure'
            ],
            mealPlan: [
              {
                day: 'Monday',
                meals: [
                  { 
                    name: 'Breakfast', 
                    items: ['Oatmeal with fresh berries and honey', 'Greek yogurt', 'Green tea'] 
                  },
                  { 
                    name: 'Lunch', 
                    items: ['Grilled chicken salad with mixed greens', 'Quinoa bowl with vegetables', 'Herbal tea'] 
                  },
                  { 
                    name: 'Dinner', 
                    items: ['Baked salmon with herbs', 'Steamed broccoli and carrots', 'Brown rice pilaf'] 
                  },
                  { 
                    name: 'Snack', 
                    items: ['Mixed nuts and dried fruit', 'Apple slices', 'Water with lemon'] 
                  },
                ]
              },
              {
                day: 'Tuesday',
                meals: [
                  { 
                    name: 'Breakfast', 
                    items: ['Whole grain toast with avocado', 'Scrambled eggs', 'Orange juice'] 
                  },
                  { 
                    name: 'Lunch', 
                    items: ['Lentil soup', 'Mixed vegetable salad', 'Whole grain roll'] 
                  },
                  { 
                    name: 'Dinner', 
                    items: ['Grilled chicken breast', 'Roasted sweet potato', 'Green beans'] 
                  },
                  { 
                    name: 'Snack', 
                    items: ['Greek yogurt with berries', 'Herbal tea'] 
                  },
                ]
              }
            ]
          });
          setSafeRecipes([
            {
              id: 'recipe-1',
              name: 'Mediterranean Quinoa Bowl',
              category: 'Lunch',
              description: 'A nutritious bowl packed with quinoa, fresh vegetables, and olive oil dressing.',
              ingredients: ['quinoa', 'cucumbers', 'tomatoes', 'olive oil', 'lemon', 'feta cheese'],
              cookTime: '20 minutes',
              difficulty: 'Easy',
              servings: 2
            },
            {
              id: 'recipe-2',
              name: 'Baked Salmon with Herbs',
              category: 'Dinner',
              description: 'Perfectly baked salmon with fresh herbs and lemon.',
              ingredients: ['salmon fillet', 'dill', 'lemon', 'olive oil', 'garlic'],
              cookTime: '25 minutes',
              difficulty: 'Easy',
              servings: 2
            }
          ]);
          setLoading(false);
          return;
        }

        // Generate recommendations for users with allergies
        const recommendations = await generateDietaryRecommendations(user.id);
        
        if (recommendations.success && recommendations.recommendations) {
          const transformedPlan = {
            alternatives: [],
            restrictions: [],
            supplementation: [
              'Consult with an allergist for proper testing',
              'Work with a registered dietitian familiar with food allergies',
              'Consider vitamin supplements if avoiding major food groups',
              'Keep emergency medications (epinephrine) readily available',
              'Regular monitoring for nutritional deficiencies'
            ],
            mealPlan: []
          };

          // Build restrictions and alternatives based on user's specific allergies
          allergiesList.forEach(allergy => {
            const safeAlts = getSafeAlternatives(allergy);
            transformedPlan.alternatives.push(...safeAlts);
            
            // Add specific foods to avoid for each allergy
            const allergySpecificAvoid = {
              'milk': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'ice cream', 'whey protein', 'casein'],
              'eggs': ['eggs', 'mayonnaise', 'custard', 'meringue', 'some baked goods', 'egg noodles'],
              'nuts': ['almonds', 'walnuts', 'cashews', 'pistachios', 'hazelnuts', 'pecans', 'nut oils'],
              'wheat': ['wheat bread', 'pasta', 'cereals', 'crackers', 'beer', 'soy sauce with wheat'],
              'soy': ['soy sauce', 'tofu', 'tempeh', 'edamame', 'soy milk', 'miso', 'soy lecithin'],
              'fish': ['salmon', 'tuna', 'cod', 'anchovies', 'fish sauce', 'worcestershire sauce'],
              'shellfish': ['shrimp', 'crab', 'lobster', 'oysters', 'mussels', 'scallops']
            };
            
            const avoidFoods = allergySpecificAvoid[allergy.toLowerCase() as keyof typeof allergySpecificAvoid] || [`all ${allergy} products`];
            transformedPlan.restrictions.push(...avoidFoods);
          });

          // Create allergy-safe meal plans
          const allergyFreeMeals = {
            breakfast: [
              'Rice porridge with safe fruits',
              'Oatmeal with coconut milk (if oats are safe)',
              'Quinoa breakfast bowl with berries',
              'Safe fruit smoothie',
              'Rice cakes with sunflower seed butter'
            ],
            lunch: [
              'Rice bowl with safe vegetables',
              'Quinoa salad with safe ingredients',
              'Potato soup (dairy-free)',
              'Safe protein with steamed vegetables',
              'Lentil salad (if legumes are safe)'
            ],
            dinner: [
              'Grilled safe protein with rice',
              'Vegetable stir-fry with safe oil',
              'Baked potato with safe toppings',
              'Quinoa pilaf with vegetables',
              'Safe meat with roasted vegetables'
            ],
            snacks: [
              'Fresh safe fruits',
              'Safe seeds (sunflower, pumpkin)',
              'Rice crackers',
              'Safe vegetable sticks',
              'Coconut chips (if coconut is safe)'
            ]
          };

          transformedPlan.mealPlan = [
            {
              day: 'Allergy-Safe Monday',
              meals: [
                { 
                  name: 'Breakfast', 
                  items: allergyFreeMeals.breakfast.slice(0, 3) 
                },
                { 
                  name: 'Lunch', 
                  items: allergyFreeMeals.lunch.slice(0, 3) 
                },
                { 
                  name: 'Dinner', 
                  items: allergyFreeMeals.dinner.slice(0, 3) 
                },
                { 
                  name: 'Snack', 
                  items: allergyFreeMeals.snacks.slice(0, 2) 
                },
              ]
            },
            {
              day: 'Allergy-Safe Tuesday',
              meals: [
                { 
                  name: 'Breakfast', 
                  items: allergyFreeMeals.breakfast.slice(2, 5) 
                },
                { 
                  name: 'Lunch', 
                  items: allergyFreeMeals.lunch.slice(2, 5) 
                },
                { 
                  name: 'Dinner', 
                  items: allergyFreeMeals.dinner.slice(2, 5) 
                },
                { 
                  name: 'Snack', 
                  items: allergyFreeMeals.snacks.slice(2, 4) 
                },
              ]
            }
          ];

          setDietPlan(transformedPlan);

          // Generate safe recipes based on user allergies
          let mockRecipes: any[] = [];
          
          allergiesList.forEach((allergy, index) => {
            const safeAlts = getSafeAlternatives(allergy);
            if (safeAlts.length > 0) {
              mockRecipes.push({
                id: `recipe-${index}`,
                name: `${allergy}-Free ${safeAlts[0]} Bowl`,
                category: index % 2 === 0 ? 'Lunch' : 'Dinner',
                description: `A nutritious and safe meal featuring ${safeAlts[0]} as the main ingredient, completely free from ${allergy}.`,
                ingredients: safeAlts.slice(0, 4),
                cookTime: '15-20 minutes',
                difficulty: 'Easy',
                servings: 2
              });
            }
          });

          // Add some general safe recipes
          mockRecipes.push(
            {
              id: 'safe-rice-bowl',
              name: 'Safe Rice & Vegetable Bowl',
              category: 'Lunch',
              description: 'A simple, allergy-friendly rice bowl with safe vegetables.',
              ingredients: ['white rice', 'carrots', 'broccoli', 'olive oil'],
              cookTime: '25 minutes',
              difficulty: 'Easy',
              servings: 2
            },
            {
              id: 'quinoa-salad',
              name: 'Quinoa Power Salad',
              category: 'Dinner',
              description: 'Protein-rich quinoa salad with fresh vegetables.',
              ingredients: ['quinoa', 'cucumber', 'tomatoes', 'lemon juice'],
              cookTime: '20 minutes',
              difficulty: 'Easy',
              servings: 3
            }
          );
          
          setSafeRecipes(mockRecipes);
        }
      } catch (error) {
        console.error('Error loading dietary data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dietary recommendations. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadDietaryData();
  }, [toast]);

  const handleUpdateProfile = () => {
    navigate('/registration');
  };

  const handleViewRecipe = (recipeId: string) => {
    toast({
      title: 'Recipe Details',
      description: 'Recipe viewer functionality would open here.',
    });
  };

  const handleExploreRecipes = () => {
    toast({
      title: 'Recipe Database',
      description: 'External recipe database integration would open here.',
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="Dietary Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading your dietary plan...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!dietPlan) {
    return (
      <DashboardLayout title="Dietary Management">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Failed to load dietary plan. Please try again.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dietary Management">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <Card className="overflow-hidden border-none shadow-lg">
          <div className="bg-gradient-to-r from-primary to-blue-600 p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold">Your Personalized Diet Plan</h2>
            </div>
            <p className="opacity-90">
              {userAllergies.length > 0
                ? `Based on your allergy profile (${userAllergies.join(', ')}), we've created a customized diet plan to help you avoid allergens and maintain a balanced diet.`
                : 'A comprehensive healthy diet plan. Update your allergy profile for personalized recommendations.'
              }
            </p>
            {userAllergies.length === 0 && (
              <Button 
                variant="secondary" 
                className="mt-4 bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={handleUpdateProfile}
              >
                Update Allergy Profile
              </Button>
            )}
          </div>
        </Card>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Foods to Avoid
              </CardTitle>
              <CardDescription>
                {userAllergies.length > 0 ? `Specific to your allergies: ${userAllergies.join(', ')}` : 'General dietary recommendations'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {dietPlan.restrictions.slice(0, 8).map((restriction: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <span className="text-red-600 text-xs">✕</span>
                    </span>
                    <span className="text-sm capitalize">{restriction}</span>
                  </li>
                ))}
                {userAllergies.length > 0 && (
                  <li className="flex items-start gap-3 mt-4 pt-4 border-t">
                    <span className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <span className="text-red-600 text-xs">⚠</span>
                    </span>
                    <span className="font-medium text-sm text-red-700">
                      Always read labels for hidden allergens
                    </span>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                Recommended Foods
              </CardTitle>
              <CardDescription>
                {userAllergies.length > 0 ? 'Safe alternatives for your allergies' : 'Nutritious options for optimal health'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {dietPlan.alternatives.slice(0, 8).map((alternative: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="h-3 w-3 text-green-600" />
                    </span>
                    <span className="text-sm capitalize">{alternative}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                Health Guidance
              </CardTitle>
              <CardDescription>
                Important nutritional considerations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {dietPlan.supplementation.map((supplement: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Info className="h-3 w-3 text-blue-600" />
                    </span>
                    <span className="text-sm">{supplement}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Always consult with a healthcare professional before making significant dietary changes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="mealPlan" className="w-full">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-2">
            <TabsTrigger value="mealPlan">Weekly Meal Plan</TabsTrigger>
            <TabsTrigger value="recipes">Safe Recipes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mealPlan" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Meal Plan</CardTitle>
                <CardDescription>
                  {userAllergies.length > 0
                    ? 'Allergy-safe meals tailored to your dietary restrictions'
                    : 'A balanced and healthy meal plan for optimal nutrition'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {dietPlan.mealPlan.map((day: any, dayIndex: number) => (
                    <div key={dayIndex} className="pb-6 last:pb-0 border-b last:border-0">
                      <h3 className="text-lg font-medium mb-4 bg-primary/10 py-2 px-3 rounded-md inline-block">
                        {day.day}
                      </h3>
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        {day.meals.map((meal: any, mealIndex: number) => (
                          <Card key={mealIndex} className="overflow-hidden border-primary/10 hover:shadow-md transition-shadow">
                            <div className="bg-primary/5 py-3 px-4 border-b border-primary/10">
                              <h4 className="font-medium text-primary">{meal.name}</h4>
                            </div>
                            <CardContent className="p-4">
                              <ul className="space-y-2">
                                {meal.items.map((item: string, itemIndex: number) => (
                                  <li key={itemIndex} className="text-sm flex items-baseline gap-2">
                                    <span className="text-primary text-xs">•</span>
                                    <span className="capitalize">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recipes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Safe Recipes for You</CardTitle>
                <CardDescription>
                  {safeRecipes.length > 0 
                    ? userAllergies.length > 0 
                      ? `Recipes carefully filtered to avoid your allergens: ${userAllergies.join(', ')}`
                      : 'Healthy and nutritious recipe recommendations'
                    : 'Update your allergy profile to see personalized recipe recommendations'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {safeRecipes.length > 0 ? (
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    {safeRecipes.map((recipe) => (
                      <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <span className="text-4xl">
                            {recipe.category === 'Breakfast' ? '🥞' : 
                             recipe.category === 'Lunch' ? '🥗' : 
                             recipe.category === 'Snack' ? '🍪' : '🍽️'}
                          </span>
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium text-lg">{recipe.name}</h3>
                            <Badge variant="outline">{recipe.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {recipe.description}
                          </p>
                          <div className="mb-4">
                            <p className="text-xs font-medium mb-2">Key ingredients:</p>
                            <div className="flex flex-wrap gap-1">
                              {recipe.ingredients.slice(0, 3).map((ingredient: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs capitalize">
                                  {ingredient}
                                </Badge>
                              ))}
                              {recipe.ingredients.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{recipe.ingredients.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                            <span>⏱️ {recipe.cookTime}</span>
                            <span>👥 {recipe.servings} servings</span>
                            <span>📊 {recipe.difficulty}</span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full group"
                            onClick={() => handleViewRecipe(recipe.id)}
                          >
                            <span className="group-hover:mr-2 transition-all">View Recipe</span>
                            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 absolute right-4 transition-all" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🍽️</span>
                      </div>
                      <h3 className="font-medium mb-2">No Personalized Recipes Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Add your allergy information to see customized, safe recipes just for you.
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleUpdateProfile}>
                      Update Allergy Profile
                    </Button>
                  </div>
                )}
                
                <div className="mt-8 text-center">
                  <Button className="group" onClick={handleExploreRecipes}>
                    <span className="group-hover:mr-2 transition-all">Explore More Recipes</span>
                    <ExternalLink className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-all" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
};

export default DietaryManagement;
