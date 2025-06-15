
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface PatientData {
  id: string;
  name: string;
  birthdate: string;
  age: number;
  weight: number;
  symptoms: string;
  created_at: string;
}

/**
 * Fetch patient data based on name and birthdate
 */
export const fetchPatientData = async (name: string, birthdate: string): Promise<PatientData | null> => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('name', name)
      .eq('birthdate', birthdate)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching patient data:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception fetching patient data:', error);
    return null;
  }
};

/**
 * Register a new patient
 */
export const registerPatient = async (
  name: string, 
  birthdate: string, 
  age: number, 
  weight: number, 
  symptoms: string
): Promise<{ success: boolean; data?: PatientData; error?: string }> => {
  try {
    // First check if patient already exists
    const existingPatient = await fetchPatientData(name, birthdate);
    if (existingPatient) {
      return { 
        success: false,
        error: 'A patient with this name and birthdate already exists' 
      };
    }

    // Insert new patient
    const { data, error } = await supabase
      .from('patients')
      .insert([
        { name, birthdate, age, weight, symptoms }
      ])
      .select()
      .single();
    
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Update localStorage with patient data and set login status
 */
export const storePatientSession = (patient: PatientData): void => {
  localStorage.setItem('user', JSON.stringify({
    name: patient.name,
    birthdate: patient.birthdate,
    isLoggedIn: true,
    userId: patient.id,
    symptoms: patient.symptoms
  }));
};

/**
 * Clear patient session
 */
export const clearPatientSession = (): void => {
  localStorage.setItem('user', JSON.stringify({
    isLoggedIn: false
  }));
};
