import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Scan, AlertTriangle, CheckCircle, Clock, Camera, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/layouts/DashboardLayout';
import { 
  analyzeFoodIngredients, 
  lookupProductByBarcode, 
  parseIngredientsText, 
  formatAllergenName, 
  FoodAnalysisResult,
  BarcodeResult 
} from '@/utils/foodAnalysisService';

const FoodType = () => {
  const { toast } = useToast();
  const [foodName, setFoodName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [barcode, setBarcode] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const [productData, setProductData] = useState<BarcodeResult | null>(null);
  const [activeTab, setActiveTab] = useState<'packaged' | 'fresh'>('packaged');

  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.userId || null;
  };

  const handleBarcodeSearch = async () => {
    if (!barcode.trim()) {
      toast({
        title: 'Missing barcode',
        description: 'Please enter a barcode to search for product information.',
        variant: 'destructive',
      });
      return;
    }

    setIsLookingUp(true);
    
    try {
      const result = await lookupProductByBarcode(barcode);
      setProductData(result);

      if (result.success && result.product) {
        // Auto-fill form with product data
        setFoodName(result.product.name);
        
        // Auto-populate ingredients from the product data
        let ingredientsText = '';
        if (result.product.ingredients && result.product.ingredients.trim()) {
          ingredientsText = result.product.ingredients;
        } else if (result.product.ingredients_list && result.product.ingredients_list.length > 0) {
          ingredientsText = result.product.ingredients_list.join(', ');
        }
        
        if (ingredientsText) {
          setIngredients(ingredientsText);
          toast({
            title: 'Product found!',
            description: `Found ${result.product.name} and auto-filled ingredients from ${result.product.source}`,
          });
        } else {
          toast({
            title: 'Product found!',
            description: `Found ${result.product.name} from ${result.product.source}, but no ingredients data available. Please enter ingredients manually.`,
            variant: 'default',
          });
        }
      } else {
        toast({
          title: 'Product not found',
          description: result.error || 'Could not find product information for this barcode.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error looking up barcode:', error);
      toast({
        title: 'Lookup failed',
        description: 'An error occurred while searching for the product.',
        variant: 'destructive',
      });
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleAnalyzeFood = async () => {
    if (!ingredients.trim()) {
      toast({
        title: 'Missing ingredients',
        description: 'Please enter the food ingredients to analyze.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const ingredientList = parseIngredientsText(ingredients);
      const userId = getUserId();
      
      const result = await analyzeFoodIngredients(
        ingredientList,
        foodName || undefined,
        userId || undefined,
        barcode || undefined
      );

      setAnalysisResult(result);

      if (result.success) {
        const allergenCount = result.analysis?.allergens_detected?.length || 0;
        const userAllergiesDetected = result.analysis?.user_allergies_detected;
        
        toast({
          title: 'Analysis complete',
          description: userAllergiesDetected 
            ? `⚠️ WARNING: Contains allergens that match your profile!`
            : `Found ${allergenCount} potential allergens.`,
          variant: userAllergiesDetected ? 'destructive' : 'default',
        });
      } else {
        toast({
          title: 'Analysis failed',
          description: result.error || 'Failed to analyze food.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error analyzing food:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred during analysis.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSafetyColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSafetyIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <Clock className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  return (
    <DashboardLayout title="Food Type Analysis">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Food Type Selection */}
        <div className="flex space-x-4 mb-6">
          <Button
            variant={activeTab === 'packaged' ? 'default' : 'outline'}
            onClick={() => setActiveTab('packaged')}
            className="flex items-center space-x-2"
          >
            <Package className="h-4 w-4" />
            <span>Packaged Food</span>
          </Button>
          <Button
            variant={activeTab === 'fresh' ? 'default' : 'outline'}
            onClick={() => setActiveTab('fresh')}
            className="flex items-center space-x-2"
          >
            <Scan className="h-4 w-4" />
            <span>Fresh Food</span>
          </Button>
        </div>

        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>
                {activeTab === 'packaged' ? 'Analyze Packaged Food' : 'Analyze Fresh Food'}
              </span>
            </CardTitle>
            <CardDescription>
              {activeTab === 'packaged' 
                ? 'Enter the barcode or ingredients from the food label for AI-powered analysis'
                : 'Enter the ingredients or components of fresh food items'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeTab === 'packaged' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Barcode Lookup</label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter or scan barcode number"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleBarcodeSearch}
                      disabled={isLookingUp || !barcode.trim()}
                      variant="outline"
                    >
                      {isLookingUp ? (
                        'Searching...'
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Search
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {productData?.success && productData.product && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Found: <strong>{productData.product.name}</strong>
                      {productData.product.brand && ` by ${productData.product.brand}`}
                      <br />
                      <small>Source: {productData.product.source}</small>
                      {ingredients && (
                        <>
                          <br />
                          <small className="text-green-600">✓ Ingredients automatically populated</small>
                        </>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Food Name (Optional)</label>
              <Input
                placeholder="e.g., Chocolate Chip Cookies"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Ingredients *</label>
              <Textarea
                placeholder={
                  activeTab === 'packaged'
                    ? "e.g., Wheat flour, sugar, chocolate chips, butter, eggs, vanilla extract, baking soda, salt"
                    : "e.g., Almonds, walnuts, cashews, or describe the fresh ingredients"
                }
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className="min-h-[100px]"
              />
              {activeTab === 'packaged' && (
                <p className="text-sm text-muted-foreground mt-1">
                  Use barcode lookup above to automatically populate ingredients
                </p>
              )}
            </div>

            <Button 
              onClick={handleAnalyzeFood}
              disabled={isAnalyzing || !ingredients.trim()}
              className="w-full"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze for Allergens with AI'}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisResult && analysisResult.success && analysisResult.analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* AI Enhancement Badge */}
            {analysisResult.analysis.ai_enhanced && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  ✨ Enhanced with AI analysis for more accurate allergen detection
                </AlertDescription>
              </Alert>
            )}

            {/* Safety Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Safety Analysis</span>
                  <div className="flex items-center space-x-2">
                    {getSafetyIcon(analysisResult.analysis.safety_score)}
                    <span className={`text-2xl font-bold ${getSafetyColor(analysisResult.analysis.safety_score)}`}>
                      {analysisResult.analysis.safety_score}/100
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      analysisResult.analysis.safety_score >= 80
                        ? 'bg-green-500'
                        : analysisResult.analysis.safety_score >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${analysisResult.analysis.safety_score}%` }}
                  />
                </div>
                {analysisResult.analysis.user_allergies_detected && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-800 font-medium">
                      ⚠️ This product contains allergens that match your allergy profile!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detected Allergens */}
            <Card>
              <CardHeader>
                <CardTitle>Detected Allergens</CardTitle>
              </CardHeader>
              <CardContent>
                {analysisResult.analysis.allergens_detected.length > 0 ? (
                  <div className="space-y-3">
                    {analysisResult.analysis.allergens_detected.map((allergen, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Badge 
                            variant={allergen.user_allergy ? "destructive" : "secondary"}
                            className="mb-1"
                          >
                            {formatAllergenName(typeof allergen === 'string' ? allergen : allergen.allergen)}
                          </Badge>
                          {allergen.source && (
                            <p className="text-sm text-muted-foreground">
                              Found in: {allergen.source}
                            </p>
                          )}
                        </div>
                        {allergen.confidence && (
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                              Confidence: {Math.round(allergen.confidence * 100)}%
                            </div>
                            {allergen.severity && (
                              <Badge variant="outline" className="text-xs">
                                {allergen.severity} risk
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-green-600 font-medium">No common allergens detected!</p>
                )}
              </CardContent>
            </Card>

            {/* Alternatives */}
            {analysisResult.analysis.alternatives && analysisResult.analysis.alternatives.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Suggested Alternatives</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.analysis.alternatives.map((alternative, index) => (
                      <Badge key={index} variant="outline" className="bg-green-50">
                        {alternative}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysisResult.analysis.recommendations.map((recommendation, index) => (
                    <Alert key={index}>
                      <AlertDescription>{recommendation}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ingredients Analyzed */}
            <Card>
              <CardHeader>
                <CardTitle>Ingredients Analyzed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.analysis.ingredients_analyzed.map((ingredient, index) => (
                    <Badge key={index} variant="outline">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FoodType;
