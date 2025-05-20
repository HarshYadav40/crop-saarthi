
import React, { useState, useRef, useEffect } from 'react';
import { Send, Leaf, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from "@/components/ui/use-toast";
import { askFarmingQuestion, saveGeminiApiKey, getGeminiApiKey, hasGeminiApiKey } from '@/services/GeminiService';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChatMessage {
  type: 'user' | 'ai';
  content: string;
}

const FarmingChat: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Check if we have a stored Gemini API key
    const storedKey = getGeminiApiKey();
    if (storedKey) {
      setGeminiApiKey(storedKey);
    } else {
      // If no API key, show a welcome message explaining the feature
      setMessages([
        {
          type: 'ai',
          content: t.chatWelcomeMessage
        }
      ]);
    }
  }, [t]);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Don't allow sending if there's no API key
    if (!hasGeminiApiKey()) {
      setIsApiKeyDialogOpen(true);
      return;
    }
    
    const userMessage = input.trim();
    setInput('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsLoading(true);
    
    try {
      // Get response from Gemini API
      const aiResponse = await askFarmingQuestion(userMessage);
      
      // Add AI response to chat
      setMessages(prev => [...prev, { type: 'ai', content: aiResponse }]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Add error message to chat
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: t.chatErrorMessage
      }]);
      
      toast({
        title: t.chatErrorTitle,
        description: t.chatErrorDescription,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const openApiKeyDialog = () => {
    setIsApiKeyDialogOpen(true);
  };
  
  const handleSaveApiKey = () => {
    if (geminiApiKey.trim()) {
      saveGeminiApiKey(geminiApiKey);
      toast({
        title: t.apiKeySaved,
        description: t.apiKeySavedDescription,
      });
      setIsApiKeyDialogOpen(false);
      
      // Add a welcome message if this is the first time setting up
      if (messages.length === 0) {
        setMessages([
          {
            type: 'ai',
            content: t.chatWelcomeMessage
          }
        ]);
      }
    } else {
      toast({
        title: t.invalidApiKey,
        description: t.invalidApiKeyDescription,
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Leaf className="h-5 w-5 mr-2 text-crop-green-dark" />
          <h2 className="text-xl font-bold text-crop-green-dark">{t.farmingChat}</h2>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={openApiKeyDialog}
          className="flex items-center"
        >
          <Settings className="h-4 w-4 mr-2" />
          {hasGeminiApiKey() ? t.changeApiKey : t.setApiKey}
        </Button>
      </div>
      
      <Card className="flex-grow mb-4 overflow-hidden">
        <CardContent className="p-4 h-full overflow-y-auto">
          <div className="flex flex-col space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`p-3 rounded-lg max-w-[80%] ${
                    message.type === 'user' 
                      ? 'bg-crop-green-dark text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-lg bg-gray-100 text-gray-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex space-x-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.chatInputPlaceholder}
          disabled={isLoading}
          className="flex-grow"
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={!input.trim() || isLoading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Gemini API Key Dialog */}
      <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>{t.enterGeminiKey}</DialogTitle>
          <DialogDescription>
            {t.enterGeminiKeyDescription}
          </DialogDescription>
          
          <div className="grid gap-4 py-4">
            <Input
              placeholder={t.enterGeminiKeyPlaceholder}
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              {t.getGeminiKeyText}{' '}
              <a href="https://aistudio.google.com/app/apikey" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-blue-500 hover:underline">
                aistudio.google.com
              </a>
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsApiKeyDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleSaveApiKey}>
              {t.saveKey}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FarmingChat;
