import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Gavel, UserCheck, UserX, SkipForward } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PHASES = [
  { key: 'case_introduction', label: 'Case Introduction', speaker: 'Judge' },
  { key: 'opening_prosecution', label: 'Opening - Prosecution', speaker: 'Prosecution' },
  { key: 'opening_defense', label: 'Opening - Defense', speaker: 'Defense' },
  { key: 'evidence_presentation', label: 'Evidence Review', speaker: 'Judge' },
  { key: 'prosecution_argument', label: 'Prosecution Arguments', speaker: 'Prosecution' },
  { key: 'defense_argument', label: 'Defense Arguments', speaker: 'Defense' },
  { key: 'judge_questions', label: 'Judge Questions', speaker: 'Judge' },
  { key: 'closing_prosecution', label: 'Closing - Prosecution', speaker: 'Prosecution' },
  { key: 'closing_defense', label: 'Closing - Defense', speaker: 'Defense' },
];

interface Argument {
  speaker: string;
  phase: string;
  content: string;
}

interface CourtroomSimulationProps {
  caseAnalysis: any;
  userRole: 'accused' | 'complainant';
  onComplete: (args: Argument[]) => void;
}

const speakerConfig: Record<string, { icon: typeof Gavel; color: string; bg: string }> = {
  Judge: { icon: Gavel, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800' },
  'Prosecution Lawyer': { icon: UserX, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' },
  'Defense Lawyer': { icon: UserCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' },
};

const CourtroomSimulation = ({ caseAnalysis, userRole, onComplete }: CourtroomSimulationProps) => {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [arguments_, setArguments] = useState<Argument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const progress = ((currentPhaseIndex) / PHASES.length) * 100;
  const isComplete = currentPhaseIndex >= PHASES.length;

  const runPhase = async (phaseIndex: number) => {
    if (phaseIndex >= PHASES.length) return;
    setIsProcessing(true);

    try {
      const phase = PHASES[phaseIndex];
      const { data, error } = await supabase.functions.invoke('courtroom-ai', {
        body: {
          action: 'simulate_phase',
          caseAnalysis,
          phase: phase.key,
          previousArguments: arguments_,
          userRole,
        }
      });

      if (error) throw error;

      const newArg: Argument = {
        speaker: data.speaker,
        phase: phase.label,
        content: data.content,
      };

      setArguments(prev => [...prev, newArg]);
      setCurrentPhaseIndex(phaseIndex + 1);
    } catch (err) {
      console.error('Phase error:', err);
      toast.error('Failed to process courtroom phase');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (autoPlay && !isProcessing && currentPhaseIndex < PHASES.length) {
      const timer = setTimeout(() => runPhase(currentPhaseIndex), 800);
      return () => clearTimeout(timer);
    }
  }, [currentPhaseIndex, isProcessing, autoPlay]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [arguments_]);

  const handleComplete = () => {
    onComplete(arguments_);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Courtroom in Session</h2>
          <p className="text-sm text-muted-foreground">
            {isComplete ? 'All phases complete' : `Phase ${currentPhaseIndex + 1} of ${PHASES.length}`}
          </p>
        </div>
        <div className="flex gap-2">
          {!isComplete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoPlay(!autoPlay)}
            >
              {autoPlay ? 'Pause' : 'Resume'}
            </Button>
          )}
          {!isComplete && !autoPlay && !isProcessing && (
            <Button size="sm" onClick={() => runPhase(currentPhaseIndex)}>
              <SkipForward className="h-4 w-4 mr-1" /> Next Phase
            </Button>
          )}
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Courtroom participants header */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {(['Defense Lawyer', 'Judge', 'Prosecution Lawyer'] as const).map(role => {
          const config = speakerConfig[role];
          const Icon = config.icon;
          const isActive = !isComplete && PHASES[currentPhaseIndex]?.speaker === role.split(' ')[0];
          return (
            <div key={role} className={`p-2.5 rounded-lg border transition-all ${isActive ? config.bg + ' ring-2 ring-primary/20' : 'bg-muted/30 border-transparent'}`}>
              <Icon className={`h-5 w-5 mx-auto mb-1 ${config.color}`} />
              <p className={`text-xs font-medium ${config.color}`}>{role}</p>
              {role !== 'Judge' && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {role === 'Defense Lawyer'
                    ? (userRole === 'accused' ? '(Your side)' : '(AI)')
                    : (userRole === 'complainant' ? '(Your side)' : '(AI)')}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Proceedings */}
      <Card className="h-[400px] flex flex-col">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {arguments_.map((arg, i) => {
              const config = speakerConfig[arg.speaker] || speakerConfig.Judge;
              const Icon = config.icon;
              return (
                <div key={i} className={`rounded-lg border p-3.5 ${config.bg}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-4 w-4 ${config.color}`} />
                    <span className={`text-sm font-semibold ${config.color}`}>{arg.speaker}</span>
                    <Badge variant="outline" className="text-[10px] ml-auto">{arg.phase}</Badge>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{arg.content}</p>
                </div>
              );
            })}
            {isProcessing && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50 border">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  {PHASES[currentPhaseIndex]?.speaker} is speaking...
                </span>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      {isComplete && (
        <Button onClick={handleComplete} className="w-full" size="lg">
          <Gavel className="mr-2 h-4 w-4" />
          Proceed to Judgment
        </Button>
      )}
    </div>
  );
};

export default CourtroomSimulation;
