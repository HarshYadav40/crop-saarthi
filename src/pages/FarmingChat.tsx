
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import FarmingChat from '@/components/FarmingChat';
import { useLanguage } from '@/contexts/LanguageContext';

const FarmingChatPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-2rem)]">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> {t.back}
        </Button>
      </div>
      
      <div className="h-[calc(100%-4rem)]">
        <FarmingChat />
      </div>
    </div>
  );
};

export default FarmingChatPage;
