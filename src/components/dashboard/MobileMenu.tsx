
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ListChecks, 
  MessageCircle, 
  FileText, 
  User,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type MobileMenuProps = {
  onLogout: () => void;
  onGenerateReport: () => void;
  userName: string;
};

const MobileMenu = ({ onLogout, onGenerateReport, userName }: MobileMenuProps) => {
  const navigate = useNavigate();
  const mobileMenuRef = useRef<HTMLDialogElement>(null);

  const handleNavigate = (path: string) => {
    mobileMenuRef.current?.close();
    navigate(path);
  };

  const handleLogout = () => {
    mobileMenuRef.current?.close();
    onLogout();
  };

  const handleGenerateReport = () => {
    mobileMenuRef.current?.close();
    onGenerateReport();
  };

  return (
    <>
      <header className="md:hidden w-full bg-primary/5 border-b border-border/50 p-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-primary">Allergen Detection</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => mobileMenuRef.current?.showModal()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu">
            <line x1="4" x2="20" y1="12" y2="12"></line>
            <line x1="4" x2="20" y1="6" y2="6"></line>
            <line x1="4" x2="20" y1="18" y2="18"></line>
          </svg>
        </Button>
      </header>
      
      <dialog id="mobile-menu" ref={mobileMenuRef} className="modal modal-bottom sm:modal-middle rounded-lg backdrop:bg-foreground/50">
        <div className="w-full bg-background rounded-t-lg p-4 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Menu</h3>
            <form method="dialog">
              <Button variant="ghost" size="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </Button>
            </form>
          </div>
          
          <nav className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => handleNavigate('/dashboard')}
            >
              <LayoutDashboard size={18} className="mr-2" />
              Dashboard
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => handleNavigate('/dashboard/food-type')}
            >
              <Package size={18} className="mr-2" />
              Food Type
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => handleNavigate('/dashboard/dietary-management')}
            >
              <ListChecks size={18} className="mr-2" />
              Dietary Management
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => handleNavigate('/dashboard/chatbot')}
            >
              <MessageCircle size={18} className="mr-2" />
              Chatbot
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start my-4" 
              onClick={handleGenerateReport}
            >
              <FileText size={18} className="mr-2" />
              Generate Report
            </Button>
            
            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/80">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <User size={16} />
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium">{userName}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                </Button>
              </div>
            </div>
          </nav>
        </div>
      </dialog>
    </>
  );
};

export default MobileMenu;
