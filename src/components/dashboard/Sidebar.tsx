
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

type SidebarProps = {
  onLogout: () => void;
  onGenerateReport: () => void;
  userName: string;
};

const Sidebar = ({ onLogout, onGenerateReport, userName }: SidebarProps) => {
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-primary/5 border-r border-border/50 p-4">
      <div className="mb-8 px-4">
        <h1 className="text-xl font-bold text-primary">Allergen Detection</h1>
      </div>
      
      <nav className="space-y-2 flex-1">
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          onClick={() => navigate('/dashboard')}
        >
          <LayoutDashboard size={18} className="mr-2" />
          Dashboard
        </Button>
        
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider px-4 pt-4 pb-2">
          Sections
        </p>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          onClick={() => navigate('/dashboard/food-type')}
        >
          <Package size={18} className="mr-2" />
          Food Type
        </Button>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          onClick={() => navigate('/dashboard/dietary-management')}
        >
          <ListChecks size={18} className="mr-2" />
          Dietary Management
        </Button>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          onClick={() => navigate('/dashboard/chatbot')}
        >
          <MessageCircle size={18} className="mr-2" />
          Chatbot
        </Button>
      </nav>
      
      <div className="pt-4 mt-auto border-t border-border/50">
        <Button 
          variant="outline" 
          className="w-full justify-start mb-2" 
          onClick={onGenerateReport}
        >
          <FileText size={18} className="mr-2" />
          Generate Report
        </Button>
        
        <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/80">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <User size={16} />
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium">{userName}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout}>
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
