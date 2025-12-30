import { Menu, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';

const ChatHeader = () => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-background/80 backdrop-blur-sm border-b border-border/50">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground">
          <Menu size={20} />
        </SidebarTrigger>
        
        <div className="flex items-center gap-2">
          <span className="font-serif text-lg font-semibold text-foreground">CARE</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">AI</span>
        </div>
      </div>

      <Button 
        asChild
        variant="outline" 
        size="sm"
        className="gap-2"
      >
        <Link to="/auth">
          <LogIn size={16} />
          <span className="hidden sm:inline">Login</span>
        </Link>
      </Button>
    </header>
  );
};

export default ChatHeader;
