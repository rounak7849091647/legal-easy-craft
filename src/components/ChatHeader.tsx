import { Menu } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

const ChatHeader = () => {
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
    </header>
  );
};

export default ChatHeader;
