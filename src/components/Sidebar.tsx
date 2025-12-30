import { 
  Sparkles, 
  FileText, 
  Users, 
  Calculator, 
  LogIn,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  isActive?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ 
  icon, 
  label, 
  sublabel, 
  isActive, 
  onClick
}: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={`sidebar-item w-full ${isActive ? 'sidebar-item-active' : ''}`}
  >
    <span className="text-muted-foreground">{icon}</span>
    <div className="flex-1 text-left">
      <span className="text-sm font-medium">{label}</span>
      {sublabel && (
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      )}
    </div>
  </button>
);

interface SidebarProps {
  onLoginClick?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ onLoginClick, isOpen, onClose }: SidebarProps) => {
  const legalCategories = [
    { label: 'Legal Intelligence', icon: <Sparkles size={18} /> },
  ];

  const handleLoginClick = () => {
    onLoginClick?.();
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:relative top-0 left-0 z-50
        w-60 h-screen bg-sidebar border-r border-sidebar-border flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile close button */}
        <button 
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 text-white/60 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="font-serif text-xl font-bold text-foreground">LegalCareAI</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Legal Intelligence</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <p className="text-xs font-medium text-muted-foreground px-3 mb-2">CATEGORIES</p>
          
          <div className="space-y-0.5">
            {legalCategories.map((item) => (
              <SidebarItem
                key={item.label}
                icon={item.icon}
                label={item.label}
              />
            ))}
          </div>

          <div className="mt-4 space-y-0.5">
            <SidebarItem
              icon={<FileText size={18} />}
              label="Documents"
              sublabel="100+ templates"
            />
            <SidebarItem
              icon={<Users size={18} />}
              label="Lawyers"
              sublabel="Verified directory"
            />
            <SidebarItem
              icon={<Calculator size={18} />}
              label="Tax Services"
              sublabel="Comprehensive solutions"
            />
          </div>

          <div className="mt-6">
            <p className="text-xs font-medium text-muted-foreground px-3 mb-2">ACCOUNT</p>
            <SidebarItem
              icon={<LogIn size={18} />}
              label="Login / Sign Up"
              sublabel="Access more features"
              onClick={handleLoginClick}
            />
          </div>
        </nav>

        {/* Bottom CTA */}
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground mb-3">
            Sign in to access Dashboard, Case Management, Calendar and more.
          </p>
          <Button 
            onClick={handleLoginClick}
            className="w-full bg-white text-black hover:bg-white/90"
          >
            Get Started Free
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
