
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark, ExternalLink, Volume2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';

export interface SchemeData {
  id: string;
  title: string;
  summary: string;
  provider: 'government' | 'csr';
  organization: string;
  eligibility: string;
  benefits: string;
  applicationProcess: string;
  applicationUrl?: string;
  expiryDate?: string;
  tags: string[];
  states: string[];
  farmerCategories: string[];
  cropTypes: string[];
  status: 'active' | 'expiring' | 'closed';
}

interface SchemeCardProps {
  scheme: SchemeData;
  onBookmark: (id: string) => void;
  isBookmarked: boolean;
}

const SchemeCard: React.FC<SchemeCardProps> = ({ 
  scheme, 
  onBookmark,
  isBookmarked 
}) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const handleVoicePlayback = () => {
    // In a real implementation, you'd use the Web Speech API or a TTS service
    // For now, we'll just show a toast
    toast({
      title: "Voice Playback",
      description: "Playing audio for this scheme (feature coming soon)",
    });
  };

  const handleApply = () => {
    if (scheme.applicationUrl) {
      window.open(scheme.applicationUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: "Application Info",
        description: "Please contact your local agricultural office for application details",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expiring': return 'bg-amber-100 text-amber-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getProviderColor = (provider: 'government' | 'csr') => {
    return provider === 'government' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-purple-100 text-purple-800';
  };

  return (
    <Card className="overflow-hidden border-t-4 border-t-crop-sky">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{scheme.title}</CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onBookmark(scheme.id)} 
            className={isBookmarked ? "text-amber-500" : ""}
          >
            <Bookmark className="h-5 w-5" />
          </Button>
        </div>
        <CardDescription>
          <span className="block text-sm">{scheme.organization}</span>
          <div className="flex flex-wrap gap-1 mt-2">
            <Badge variant="outline" className={getProviderColor(scheme.provider)}>
              {scheme.provider === 'government' ? t.government || 'Government' : 'CSR'}
            </Badge>
            <Badge variant="outline" className={getStatusColor(scheme.status)}>
              {scheme.status === 'active' 
                ? t.active || 'Active' 
                : scheme.status === 'expiring' 
                  ? t.expiringSoon || 'Expiring Soon' 
                  : t.closed || 'Closed'}
            </Badge>
            {scheme.expiryDate && (
              <Badge variant="outline">
                {t.expires || 'Expires'}: {scheme.expiryDate}
              </Badge>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className={`space-y-2 ${expanded ? '' : 'max-h-32 overflow-hidden'}`}>
        <p className="text-sm text-gray-600">{scheme.summary}</p>
        
        {expanded && (
          <>
            <div className="pt-2">
              <h4 className="text-sm font-semibold">{t.eligibility || 'Eligibility'}:</h4>
              <p className="text-sm">{scheme.eligibility}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold">{t.benefits || 'Benefits'}:</h4>
              <p className="text-sm">{scheme.benefits}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold">{t.howToApply || 'How to Apply'}:</h4>
              <p className="text-sm">{scheme.applicationProcess}</p>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {scheme.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="flex space-x-2 w-full">
          <Button 
            onClick={() => setExpanded(!expanded)} 
            variant="outline" 
            className="flex-1"
          >
            {expanded ? t.showLess || 'Show Less' : t.viewDetails || 'View Details'}
          </Button>
          <Button 
            onClick={handleVoicePlayback}
            variant="ghost" 
            size="icon"
          >
            <Volume2 className="h-5 w-5" />
          </Button>
        </div>
        {scheme.status !== 'closed' && (
          <Button 
            onClick={handleApply}
            className="w-full"
          >
            {t.apply || 'Apply'} <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SchemeCard;
