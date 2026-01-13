import { useState, useRef } from 'react';
import PageLayout from '@/components/PageLayout';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Send, FileText, MessageSquare, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Discussion = () => {
  const [document, setDocument] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 2MB.');
      return;
    }

    const validTypes = ['text/plain', 'text/markdown', 'application/pdf', 
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.md')) {
      toast.error('Invalid file type. Please upload TXT, MD, PDF, or DOC files.');
      return;
    }

    try {
      const text = await file.text();
      setDocument(text);
      toast.success(`Document "${file.name}" loaded successfully`);
    } catch (error) {
      toast.error('Failed to read file');
    }
  };

  const startDiscussion = async () => {
    if (!document.trim()) {
      toast.error('Please provide a document or text to discuss');
      return;
    }

    setIsLoading(true);
    setHasStarted(true);

    try {
      const systemPrompt = `You are an analytical, thoughtful, and respectful AI discussion partner.
      
The user has provided a document for discussion. Your task is to:
1. Briefly summarize the document in your own words
2. Share initial analysis or opinion
3. Ask the user what they intended, what problem they face, or where they feel confused

Maintain a friendly, thought-provoking, supportive, and non-judgmental tone.
Always end with an open-ended question to continue the discussion.

Document content:
${document}`;

      const { data, error } = await supabase.functions.invoke('legal-chat', {
        body: {
          message: 'Please analyze this document and start our discussion.',
          language: 'en',
          documentContent: document,
          conversationHistory: [],
          systemPromptOverride: systemPrompt
        }
      });

      if (error) throw error;

      setMessages([
        { role: 'user', content: '[Document uploaded for discussion]' },
        { role: 'assistant', content: data.response }
      ]);
    } catch (error) {
      console.error('Discussion error:', error);
      toast.error('Failed to start discussion');
      setHasStarted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const systemPrompt = `You are an analytical, thoughtful, and respectful AI discussion partner.
      
Continue the discussion about the document. Guidelines:
- Share your perspective without dominating
- Encourage the user to express thoughts and feelings
- Maintain respectful, debate-style conversation
- Ask clarifying and reflective questions
- If the user disagrees, respond calmly with reasoning
- Suggest improvements, alternatives, or new perspectives
- End with an open-ended question

Original document:
${document}`;

      const { data, error } = await supabase.functions.invoke('legal-chat', {
        body: {
          message: userMessage,
          language: 'en',
          documentContent: document,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
          systemPromptOverride: systemPrompt
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Message error:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const resetDiscussion = () => {
    setDocument('');
    setMessages([]);
    setInput('');
    setHasStarted(false);
  };

  return (
    <PageLayout>
      <SEOHead
        title="Document Discussion Room - AI-Powered Analysis"
        description="Upload documents and have thoughtful, private AI-powered discussions. Get deeper insights on legal documents, contracts, and agreements."
        keywords="document analysis, AI discussion, legal document review, contract analysis, document insights"
        canonicalUrl="/discussion"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Discussion', url: '/discussion' },
        ]}
      />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            <MessageSquare className="inline-block mr-2 h-8 w-8 text-primary" />
            Discussion Room
          </h1>
          <p className="text-muted-foreground">
            Upload a document and have a thoughtful, private discussion with AI
          </p>
        </div>

        {!hasStarted ? (
          <Card className="border-2 border-dashed border-muted-foreground/25">
            <CardHeader>
              <CardTitle className="text-lg">Start a Discussion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.md,.pdf,.doc,.docx"
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-20 border-dashed"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Document (TXT, MD, PDF, DOC)
                </Button>

                <div className="text-center text-muted-foreground text-sm">OR</div>

                <Textarea
                  placeholder="Paste or write your document, idea, or notes here..."
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
              </div>

              {document && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Document loaded ({document.length} characters)
                  </span>
                </div>
              )}

              <Button 
                onClick={startDiscussion} 
                disabled={!document.trim() || isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Start Discussion
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                Document loaded ({document.length} chars)
              </div>
              <Button variant="ghost" size="sm" onClick={resetDiscussion}>
                <Trash2 className="mr-2 h-4 w-4" />
                New Discussion
              </Button>
            </div>

            <Card className="h-[500px] flex flex-col">
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-4 py-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Share your thoughts, ask questions, or debate..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="min-h-[60px] resize-none"
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="h-[60px] w-[60px]"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Discussion;
