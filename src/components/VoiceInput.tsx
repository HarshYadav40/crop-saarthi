
import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface VoiceInputProps {
  onTranscript?: (text: string) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      // Stop listening logic would go here
      // In a real implementation, we would use the Web Speech API
      toast({
        title: "Voice input stopped",
        description: "Your message has been processed.",
      });
    } else {
      setIsListening(true);
      // Start listening logic would go here
      toast({
        title: "Listening...",
        description: "Speak now to interact with CropSaarthi.",
      });
      
      // For demo purposes, we'll simulate receiving a transcript after 3 seconds
      setTimeout(() => {
        const mockTranscript = "Show me treatments for tomato leaf spots";
        if (onTranscript) {
          onTranscript(mockTranscript);
        }
        setIsListening(false);
      }, 3000);
    }
  };

  return (
    <Button
      className="voice-button"
      size="icon"
      onClick={toggleListening}
      aria-label={isListening ? "Stop listening" : "Start voice input"}
    >
      {isListening ? (
        <MicOff className="h-6 w-6 text-white animate-pulse-gentle" />
      ) : (
        <Mic className="h-6 w-6 text-white" />
      )}
    </Button>
  );
};

export default VoiceInput;
