
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Calendar } from 'lucide-react';
import { registerPatient, storePatientSession } from '@/utils/patientService';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  birthdate: z.string().min(1, { message: 'Birthdate is required.' }),
  age: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: 'Age must be a positive number.',
  }),
  weight: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: 'Weight must be a positive number.',
  }),
  symptoms: z.string().min(1, { message: 'Please describe your symptoms.' }),
});

const Registration = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      birthdate: '',
      age: '',
      weight: '',
      symptoms: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    try {
      // Register the patient
      const result = await registerPatient(
        values.name,
        values.birthdate,
        parseInt(values.age),
        parseInt(values.weight),
        values.symptoms
      );
      
      if (!result.success) {
        toast({
          title: 'Registration failed',
          description: result.error || 'Please try again later.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      
      if (result.data) {
        // Store patient session
        storePatientSession(result.data);
        
        toast({
          title: 'Registration successful!',
          description: 'Welcome to Allergen Detection System.',
        });
        
        // Navigate to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="glass border-none shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center text-balance">
              Allergen Detection System
            </CardTitle>
            <CardDescription className="text-center pt-2">
              Register to track and manage your allergies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="flex items-center gap-2">
                          <User size={14} /> Name
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
                            {...field} 
                            className="bg-background/50 backdrop-blur-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthdate"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="flex items-center gap-2">
                          <Calendar size={14} /> Date of Birth
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            className="bg-background/50 backdrop-blur-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter your age" 
                            {...field} 
                            className="bg-background/50 backdrop-blur-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter your weight" 
                            {...field} 
                            className="bg-background/50 backdrop-blur-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="symptoms"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Symptoms of Allergies</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your allergy symptoms" 
                          {...field} 
                          className="bg-background/50 backdrop-blur-sm resize-none min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full transition-all duration-300 hover:shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registering...' : 'Create Account'}
                </Button>

                <p className="text-center text-sm">
                  Already have an account?{' '}
                  <Button variant="link" onClick={() => navigate('/login')} className="p-0">
                    Login
                  </Button>
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Registration;
