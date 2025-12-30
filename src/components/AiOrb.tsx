import { useState } from 'react';

const AiOrb = () => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={() => setIsActive(!isActive)}
        className="relative group cursor-pointer"
      >
        {/* Outer glow ring */}
        <div className={`absolute inset-0 rounded-full bg-primary/20 blur-xl transition-all duration-500 ${
          isActive ? 'scale-150 opacity-100' : 'scale-100 opacity-60'
        }`} />
        
        {/* Main orb */}
        <div className={`relative w-36 h-36 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 backdrop-blur-sm border border-primary/30 flex items-center justify-center orb-glow orb-pulse transition-all duration-300 ${
          isActive ? 'scale-110' : 'scale-100'
        }`}>
          {/* Inner glow */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/20 to-transparent" />
          
          {/* Waveform animation */}
          <div className="flex items-center justify-center gap-1 z-10">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-1 bg-primary/80 rounded-full transition-all ${
                  isActive ? 'waveform-bar' : 'h-1'
                }`}
                style={{ 
                  height: isActive ? undefined : '4px',
                  animationDelay: `${i * 0.1}s` 
                }}
              />
            ))}
          </div>
        </div>

        {/* Hover ring */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/0 group-hover:border-primary/30 transition-all duration-300 scale-110" />
      </button>

      {/* Text labels */}
      <div className="text-center">
        <h2 className="font-serif text-3xl font-semibold text-foreground tracking-wider">
          CARE
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {isActive ? 'Listening...' : 'Tap to speak'}
        </p>
      </div>

      <p className="text-muted-foreground/70 text-sm">
        Tap the orb or enable wake word
      </p>
    </div>
  );
};

export default AiOrb;
