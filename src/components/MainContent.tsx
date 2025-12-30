import AiOrb from './AiOrb';
import ChatInput from './ChatInput';
import { Button } from '@/components/ui/button';
import supremeCourtBg from '@/assets/supreme-court-bg.jpg';

const MainContent = () => {
  return (
    <main className="flex-1 relative overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${supremeCourtBg})` }}
      >
        <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px]" />
      </div>

      {/* Login button */}
      <div className="absolute top-4 right-4 z-20">
        <Button 
          variant="outline" 
          className="bg-muted/50 border-border/50 text-foreground hover:bg-muted"
        >
          Login
        </Button>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center gap-8 animate-fade-in">
          <AiOrb />
          <ChatInput />
        </div>
      </div>
    </main>
  );
};

export default MainContent;
