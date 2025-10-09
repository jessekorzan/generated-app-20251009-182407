import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, FilePlus2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api-client';
import { useGlobalFiltersStore } from '@/stores/useGlobalFiltersStore';
interface Message {
  id: string;
  text?: string;
  sender: 'user' | 'bot';
  component?: React.ReactNode;
}
export function ChatInterface() {
  const { openReportModal, chatInitialMessage, setChatInitialMessage } = useGlobalFiltersStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);
  useEffect(() => {
    if (chatInitialMessage) {
      setInputValue(chatInitialMessage);
      setChatInitialMessage(undefined); // Clear the initial message after using it
    }
  }, [chatInitialMessage, setChatInitialMessage]);
  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;
    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: messageText,
      sender: 'user',
    };
    setMessages((prevMessages) => {
      const isInitial = prevMessages.length > 0 && prevMessages[0].id === 'initial';
      return isInitial ? [userMessage] : [...prevMessages, userMessage];
    });
    setIsLoading(true);
    try {
      const response = await api<{ reply: string }>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: messageText }),
      });
      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: response.reply,
        sender: 'bot',
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat API error:', error);
      let errorMessageText = 'Sorry, I encountered an error. Please try again.';
      if (error instanceof Error) {
        errorMessageText = error.message;
      } else if (typeof error === 'string') {
        errorMessageText = error;
      } else if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string') {
        errorMessageText = (error as any).message;
      }
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        text: errorMessageText,
        sender: 'bot',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
    setInputValue('');
  };
  const InitialMessageWithAction = useCallback(() => {
    const suggestedPrompts = [
      "What are the top 3 loss reasons?",
      "Summarize wins against Competitor X",
      "Find me some juicy quotes for a slide deck",
    ];
    return (
      <div className="bg-muted p-4 rounded-lg space-y-4">
        <p className="text-sm text-foreground">
          Hello! I'm BuyersLens AI. I can help you analyze your win/loss data.
        </p>
        <Button className="w-full" onClick={() => openReportModal()}>
          <FilePlus2 className="mr-2 h-4 w-4" />
          Generate a New Report
        </Button>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground flex items-center">
            <Sparkles className="w-3 h-3 mr-1.5" />
            Or, try a suggestion:
          </p>
          <div className="flex flex-col items-start space-y-2">
            {suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => sendMessage(prompt)}
                className="text-sm text-primary hover:underline text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }, [openReportModal, sendMessage]);
  useEffect(() => {
    setMessages([{
      id: 'initial',
      sender: 'bot',
      component: <InitialMessageWithAction />,
    }]);
  }, [InitialMessageWithAction]);
  return (
    <Card className="h-full flex flex-col border-l rounded-none bg-background">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>BuyersLens AI</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex items-end gap-2',
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.sender === 'bot' && !message.component && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg text-sm',
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground px-3 py-2'
                      : message.component ? 'w-full' : 'bg-muted px-3 py-2'
                  )}
                >
                  {message.component || message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-2 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="max-w-[80%] rounded-lg px-3 py-2 text-sm bg-muted">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" style={{ animationDelay: '0s' }} />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" style={{ animationDelay: '0.2s' }} />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleFormSubmit} className="flex w-full items-center space-x-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="min-h-0 resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleFormSubmit(e);
              }
            }}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}