import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';

interface ChatHeaderProps {
  onLoginClick?: () => void;
}

const ChatHeader = ({ onLoginClick }: ChatHeaderProps) => {
  const { isMobile, state } = useSidebar();
  
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-background/80 backdrop-blur-sm border-b border-border/50">
      <div className="flex items-center gap-3">
        {/* Show toggle on mobile or when sidebar is collapsed */}
        <SidebarTrigger className="text-muted-foreground hover:text-foreground">
          <Menu size={20} />
        </SidebarTrigger>
        
        <div className="flex items-center gap-2">
          <span className="font-serif text-lg font-semibold text-foreground">CARE</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">AI</span>
        </div>
      </div>

      <Button 
        variant="outline" 
        size="sm"
        onClick={onLoginClick}
        className="bg-primary text-primary-foreground hover:bg-primary/90 border-0"
      >
        Login
      </Button>
    </header>
  );
};

export default ChatHeader;
