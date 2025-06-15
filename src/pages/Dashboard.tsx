
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ListChecks, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/layouts/DashboardLayout';
import { fetchPatientData } from '@/utils/patientService';

interface UserSession {
  name?: string;
  birthdate?: string;
  isLoggedIn: boolean;
  userId?: string;
  symptoms?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState<null | {
    symptoms: string;
  }>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadPatientData = async () => {
      try {
        // Get user info from localStorage
        const userSession = JSON.parse(localStorage.getItem('user') || '{}') as UserSession;
        
        if (!userSession.isLoggedIn || !userSession.name || !userSession.birthdate) {
          navigate('/login');
          return;
        }
        
        // Fetch fresh data from the database
        const patientData = await fetchPatientData(userSession.name, userSession.birthdate);
        
        if (patientData) {
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify({
            ...userSession,
            symptoms: patientData.symptoms
          }));
          
          setPatientData({
            symptoms: patientData.symptoms
          });
        }
      } catch (error) {
        console.error('Error loading patient data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPatientData();
  }, [navigate]);
  
  // Animation variants for staggered animation
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  // Get the user's data from localStorage
  const userSession = JSON.parse(localStorage.getItem('user') || '{}') as UserSession;

  return (
    <DashboardLayout title="Dashboard">
      <motion.div 
        className="grid gap-6 grid-cols-1 md:grid-cols-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Food Type Card */}
        <motion.div variants={item}>
          <Card className="hover-lift h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-xl">
                <Package className="mr-2 h-5 w-5 text-allergen" /> Food Type
              </CardTitle>
              <CardDescription>
                Analyze packaged and non-packaged foods for allergens
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-sm text-muted-foreground">
                Scan barcodes or manually input food ingredients to detect potential allergens
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full group"
                onClick={() => navigate('/dashboard/food-type')}
              >
                <span className="group-hover:mr-2 transition-all">Explore</span>
                <span className="opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-xs transition-all">→</span>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Dietary Management Card */}
        <motion.div variants={item}>
          <Card className="hover-lift h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-xl">
                <ListChecks className="mr-2 h-5 w-5 text-allergen" /> Dietary Management
              </CardTitle>
              <CardDescription>
                Personalized diet plans to manage your allergies
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-sm text-muted-foreground">
                Get tailored meal plans and dietary recommendations based on your specific allergies
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full group"
                onClick={() => navigate('/dashboard/dietary-management')}
              >
                <span className="group-hover:mr-2 transition-all">Explore</span>
                <span className="opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-xs transition-all">→</span>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Chatbot Card */}
        <motion.div variants={item}>
          <Card className="hover-lift h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-xl">
                <MessageCircle className="mr-2 h-5 w-5 text-allergen" /> Chatbot
              </CardTitle>
              <CardDescription>
                Find doctors and get personalized advice
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-sm text-muted-foreground">
                Connect with specialists in your area and receive guidance for managing allergies
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full group"
                onClick={() => navigate('/dashboard/chatbot')}
              >
                <span className="group-hover:mr-2 transition-all">Explore</span>
                <span className="opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-xs transition-all">→</span>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div 
        className="mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-primary/5 border border-primary/10">
          <CardHeader>
            <CardTitle>Your Allergy Overview</CardTitle>
            <CardDescription>
              Here's a summary of your allergies and symptoms
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-pulse h-6 w-32 bg-muted rounded"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Symptoms:</h3>
                  <p className="text-sm bg-background/80 p-3 rounded-md">
                    {userSession.symptoms || 'No symptoms data available.'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => navigate('/dashboard/report')}
              className="w-full"
            >
              Generate Comprehensive Report
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
