
import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SolarToolCardProps {
  name: string;
  Icon: LucideIcon;
  whatIsIt: string;
  howItHelps: string;
  whereToGet: string;
  t: any; // Translation object
}

const SolarToolCard: React.FC<SolarToolCardProps> = ({
  name,
  Icon,
  whatIsIt,
  howItHelps,
  whereToGet,
  t
}) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card className="overflow-hidden transition-all duration-300">
      <CardHeader className="bg-crop-green bg-opacity-10">
        <CardTitle className="flex items-center text-crop-green-dark">
          <Icon className="mr-2" />
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent className={`pt-4 transition-all duration-300 ${expanded ? 'max-h-[500px]' : 'max-h-32 overflow-hidden'}`}>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">{t.whatIsIt}</h4>
            <p className="text-gray-700">{whatIsIt}</p>
          </div>
          
          <div>
            <h4 className="font-semibold">{t.howItHelps}</h4>
            <p className="text-gray-700">{howItHelps}</p>
          </div>
          
          <div>
            <h4 className="font-semibold">{t.whereToGet}</h4>
            <p className="text-gray-700">{whereToGet}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          onClick={() => setExpanded(!expanded)} 
          className="w-full"
        >
          {expanded ? 'Show Less' : t.viewDetails}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SolarToolCard;
