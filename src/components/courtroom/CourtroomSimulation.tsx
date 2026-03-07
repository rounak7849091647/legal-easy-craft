import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Gavel, UserCheck, UserX, SkipForward, Send, Hand, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BASE_PHASES = [
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
  isUser?: boolean;
}

interface CourtroomSimulationProps {
  caseAnalysis: any;
  userRole: 'accused' | 'complainant';
  onComplete: (args: Argument[]) => void;
  language?: string;
}

const speakerConfig: Record<string, { icon: typeof Gavel; color: string; bg: string }> = {
  Judge: { icon: Gavel, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800' },
  'Prosecution Lawyer': { icon: UserX, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' },
  'Defense Lawyer': { icon: UserCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' },
  'You': { icon: MessageSquare, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' },
};

const CourtroomSimulation = ({ caseAnalysis, userRole, onComplete, language }: CourtroomSimulationProps) => {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [arguments_, setArguments] = useState<Argument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [showUserInput, setShowUserInput] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [isSubmittingArg, setIsSubmittingArg] = useState(false);
  const [userArgCount, setUserArgCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const totalPhases = BASE_PHASES.length;
  const progress = Math.min(((currentPhaseIndex) / totalPhases) * 100, 100);

  const runPhase = async (phaseIndex: number) => {
    if (phaseIndex >= BASE_PHASES.length) {
      setIsComplete(true);
      return;
    }
    setIsProcessing(true);

    try {
      const phase = BASE_PHASES[phaseIndex];
      const { data, error } = await supabase.functions.invoke('courtroom-ai', {
        body: {
          action: 'simulate_phase',
          caseAnalysis,
          phase: phase.key,
          previousArguments: arguments_,
          userRole,
          language,
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

  const handleUserArgument = async () => {
    if (!userMessage.trim()) return;
    setIsSubmittingArg(true);
    setAutoPlay(false);

    const userArg: Argument = {
      speaker: 'You',
      phase: `Your Argument #${userArgCount + 1}`,
      content: userMessage.trim(),
      isUser: true,
    };
    setArguments(prev => [...prev, userArg]);

    try {
      const { data, error } = await supabase.functions.invoke('courtroom-ai', {
        body: {
          action: 'user_argument',
          caseAnalysis,
          previousArguments: [...arguments_, userArg],
          userRole,
          userMessage: userMessage.trim(),
          language,
        }
      });

      if (error) throw error;

      const newArgs: Argument[] = data.responses.map((r: any) => ({
        speaker: r.speaker,
        phase: r.phase,
        content: r.content,
      }));

      setArguments(prev => [...prev, ...newArgs]);
      setUserArgCount(prev => prev + 1);
      setUserMessage('');
      setShowUserInput(false);
    } catch (err) {
      console.error('User argument error:', err);
      toast.error('Failed to process your argument');
    } finally {
      setIsSubmittingArg(false);
    }
  };

  useEffect(() => {
    if (autoPlay && !isProcessing && !showUserInput && currentPhaseIndex < BASE_PHASES.length) {
      const timer = setTimeout(() => runPhase(currentPhaseIndex), 800);
      return () => clearTimeout(timer);
    }
  }, [currentPhaseIndex, isProcessing, autoPlay, showUserInput]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [arguments_]);

  const handleComplete = () => onComplete(arguments_);

  const canInterject = !isProcessing && !isSubmittingArg && !isComplete;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Courtroom in Session</h2>
          <p className="text-sm text-muted-foreground">
            {isComplete
              ? `All phases complete • ${userArgCount} user argument${userArgCount !== 1 ? 's' : ''}`
              : `Phase ${Math.min(currentPhaseIndex + 1, totalPhases)} of ${totalPhases}`}
          </p>
        </div>
        <div className="flex gap-2">
          {!isComplete && (
            <>
              <Button variant="outline" size="sm" onClick={() => setAutoPlay(!autoPlay)}>
                {autoPlay ? 'Pause' : 'Resume'}
              </Button>
              {!autoPlay && !isProcessing && !showUserInput && currentPhaseIndex < BASE_PHASES.length && (
                <Button size="sm" onClick={() => runPhase(currentPhaseIndex)}>
                  <SkipForward className="h-4 w-4 mr-1" /> Next
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Courtroom participants */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {(['Defense Lawyer', 'Judge', 'Prosecution Lawyer', 'You'] as const).map(role => {
          const config = speakerConfig[role];
          const Icon = config.icon;
          const isActive = !isComplete && !showUserInput &&
            currentPhaseIndex < BASE_PHASES.length &&
            BASE_PHASES[currentPhaseIndex]?.speaker === role.split(' ')[0];
          const isUserActive = role === 'You' && showUserInput;
          return (
            <div key={role} className={`p-2 rounded-lg border transition-all ${(isActive || isUserActive) ? config.bg + ' ring-2 ring-primary/20' : 'bg-muted/30 border-transparent'}`}>
              <Icon className={`h-4 w-4 mx-auto mb-1 ${config.color}`} />
              <p className={`text-[11px] font-medium ${config.color}`}>{role}</p>
              {role === 'You' && (
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  ({userRole === 'complainant' ? 'Complainant' : 'Accused'})
                </p>
              )}
              {role !== 'Judge' && role !== 'You' && (
                <p className="text-[9px] text-muted-foreground mt-0.5">
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
                <div key={i} className={`rounded-lg border p-3.5 ${config.bg} ${arg.isUser ? 'ring-1 ring-blue-300 dark:ring-blue-700' : ''}`}>
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
                  {currentPhaseIndex < BASE_PHASES.length ? `${BASE_PHASES[currentPhaseIndex]?.speaker} is speaking...` : 'Processing...'}
                </span>
              </div>
            )}
            {isSubmittingArg && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50 border">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Judge and opposing counsel are responding...</span>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* User argument input */}
      {showUserInput && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-medium text-foreground">Present your argument to the court:</p>
            <Textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Type your argument here... The Judge will acknowledge it and the opposing counsel will respond."
              className="min-h-[100px]"
              disabled={isSubmittingArg}
            />
            <div className="flex gap-2">
              <Button onClick={handleUserArgument} disabled={!userMessage.trim() || isSubmittingArg} className="flex-1">
                {isSubmittingArg ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
                Submit Argument
              </Button>
              <Button variant="outline" onClick={() => { setShowUserInput(false); setAutoPlay(true); }} disabled={isSubmittingArg}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {canInterject && !showUserInput && (
          <Button variant="outline" onClick={() => { setAutoPlay(false); setShowUserInput(true); }} className="flex-1">
            <Hand className="mr-2 h-4 w-4" /> Present Your Argument
          </Button>
        )}
        {isComplete && (
          <Button onClick={handleComplete} className="flex-1" size="lg">
            <Gavel className="mr-2 h-4 w-4" /> Proceed to Judgment
          </Button>
        )}
      </div>
    </div>
  );
};

export default CourtroomSimulation;
