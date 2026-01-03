import { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DisclaimerPopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show popup after a short delay on load
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs bg-card border border-border rounded-lg shadow-lg p-3 animate-in slide-in-from-bottom-2 fade-in duration-300">
      <div className="flex items-start gap-2">
        <Info size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs text-muted-foreground leading-relaxed">
            CARE AI provides general legal info only. Consult a qualified lawyer for specific matters.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 flex-shrink-0"
          onClick={() => setIsVisible(false)}
        >
          <X size={12} />
        </Button>
      </div>
    </div>
  );
};

export default DisclaimerPopup;
