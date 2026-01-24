'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Loader2, Send, Sparkles, User, MessageSquareHeart } from 'lucide-react';
import { recommendCake } from '@/ai/flows/personalized-cake-recommendations';
import { AnimatePresence, motion } from 'framer-motion';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export function AIRecommender() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setMessages(prev => [...prev, userMessage]);

    try {
      const history = messages.slice(-4); // Keep last 4 messages for context
      const res = await recommendCake({ query: currentInput, history });
      const modelMessage: Message = { role: 'model', content: res.recommendation };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('AI recommendation error:', error);
      const errorMessage: Message = { role: 'model', content: "I'm having a little trouble thinking right now. Please try again in a moment." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="fixed bottom-24 right-4 z-50 bg-card/80 backdrop-blur-sm rounded-full shadow-lg h-16 w-16 hover:scale-110 transition-transform"
      >
        <MessageSquareHeart className="h-8 w-8 text-primary" />
        <span className="sr-only">Open AI Recommender</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md p-0 flex flex-col h-[70vh]">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" />
              WhiskeDelights AI Helper
            </DialogTitle>
            <DialogDescription>
              Tell me what you're looking for, and I'll find the perfect cake for you!
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 px-6">
            <AnimatePresence>
              <motion.div className="space-y-4 py-4">
                {messages.length === 0 && (
                   <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground"
                  >
                    <p>Try asking something like:</p>
                    <p className="font-semibold mt-1">"I need a cake for a kid's birthday."</p>
                    <p className="font-semibold">"What's a good chocolate cake?"</p>
                  </motion.div>
                )}
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {message.role === 'model' && (
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                        <Bot size={20} />
                      </div>
                    )}
                    <div
                      className={`max-w-xs p-3 rounded-lg text-sm ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.content}
                    </div>
                     {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0">
                        <User size={20} />
                      </div>
                    )}
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                      <Bot size={20} />
                    </div>
                     <div className="max-w-xs p-3 rounded-lg bg-muted flex items-center gap-2">
                        <Loader2 className="animate-spin" size={16} />
                        <span>Thinking...</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </ScrollArea>
          <div className="p-4 border-t">
            <div className="relative">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask for a recommendation..."
                disabled={isLoading}
              />
              <Button
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
