
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from '@/contexts/LanguageContext';

const FarmingChatCard: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer bg-crop-earth-light/20"
      onClick={() => navigate('/farming-chat')}
    >
      <CardContent className="flex items-center p-6">
        <div className="bg-crop-earth-light rounded-full p-3 mr-4">
          <Leaf className="h-6 w-6 text-crop-earth-dark" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{t.farmingChat}</h3>
          <p className="text-sm text-gray-600">{t.farmingChatDesc}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FarmingChatCard;
