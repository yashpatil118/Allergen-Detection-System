
import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/dashboard/Sidebar';
import MobileMenu from '@/components/dashboard/MobileMenu';
import MainContent from '@/components/dashboard/MainContent';
import { clearPatientSession } from '@/utils/patientService';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is logged in
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.isLoggedIn) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    // Clear user data from localStorage using the service
    clearPatientSession();
    
    toast({
      title: 'Logged out successfully',
      description: 'You have been logged out of your account.',
    });
    
    navigate('/login');
  };

  const handleGenerateReport = () => {
    navigate('/dashboard/report');
  };

  // Get the user's name from localStorage
  const userName = JSON.parse(localStorage.getItem('user') || '{}').name || 'User';

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar for desktop */}
      <Sidebar 
        onLogout={handleLogout} 
        onGenerateReport={handleGenerateReport}
        userName={userName}
      />
      
      {/* Mobile header and menu */}
      <MobileMenu 
        onLogout={handleLogout} 
        onGenerateReport={handleGenerateReport}
        userName={userName}
      />
      
      {/* Main content */}
      <MainContent title={title}>
        {children}
      </MainContent>
    </div>
  );
};

export default DashboardLayout;
