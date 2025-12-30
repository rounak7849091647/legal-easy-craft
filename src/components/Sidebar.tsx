import { 
  Sparkles, 
  BookOpen, 
  Landmark, 
  Users, 
  FileText, 
  Calculator, 
  LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  isActive?: boolean;
  onClick?: () => void;
  colorDot?: string;
}

const SidebarItem = ({ 
  icon, 
  label, 
  sublabel, 
  isActive, 
  onClick,
  colorDot 
}: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={`sidebar-item w-full ${isActive ? 'sidebar-item-active' : ''}`}
  >
    {colorDot ? (
      <span className={`w-2.5 h-2.5 rounded-sm ${colorDot}`} />
    ) : (
      <span className="text-muted-foreground">{icon}</span>
    )}
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
}

const Sidebar = ({ onLoginClick }: SidebarProps) => {
  const legalCategories = [
    { label: 'General', icon: <Sparkles size={18} /> },
    { label: 'BNS', colorDot: 'bg-red-500' },
    { label: 'IPC', colorDot: 'bg-red-500' },
    { label: 'Civil Laws', icon: <Landmark size={18} /> },
    { label: 'Labour Law', icon: <Users size={18} /> },
  ];

  return (
    <aside className="w-60 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
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
              colorDot={item.colorDot}
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
            onClick={onLoginClick}
          />
        </div>
      </nav>

      {/* Bottom CTA */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground mb-3">
          Sign in to access Dashboard, Case Management, Calendar and more.
        </p>
        <Button 
          onClick={onLoginClick}
          className="w-full bg-white text-black hover:bg-white/90"
        >
          Get Started Free
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
