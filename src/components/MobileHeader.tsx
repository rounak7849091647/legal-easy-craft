import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  onMenuClick: () => void;
  onLoginClick: () => void;
  isMenuOpen: boolean;
}

const MobileHeader = ({ onMenuClick, onLoginClick, isMenuOpen }: MobileHeaderProps) => {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-white/10">
      <div className="flex items-center justify-between px-4 h-14">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-white hover:bg-white/10"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
        
        <h1 className="font-serif text-lg font-bold text-white">LegalCareAI</h1>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onLoginClick}
          className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-xs px-3"
        >
          Login
        </Button>
      </div>
    </header>
  );
};

export default MobileHeader;
