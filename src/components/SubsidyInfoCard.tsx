
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgePercent } from 'lucide-react';

interface SubsidyInfoCardProps {
  state: string;
  subsidyPercent: number;
  eligibility: string;
  t: any; // Translation object
}

const SubsidyInfoCard: React.FC<SubsidyInfoCardProps> = ({
  state,
  subsidyPercent,
  eligibility,
  t
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-crop-sky to-crop-sky-light py-3">
        <CardTitle className="flex items-center justify-between">
          <span>{state}</span>
          <span className="flex items-center text-green-700 bg-white px-2 py-1 rounded-full text-sm">
            <BadgePercent className="w-4 h-4 mr-1" />
            {subsidyPercent}% {t.subsidyPercent}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <div>
          <h4 className="font-semibold">{t.eligibility}:</h4>
          <p className="text-gray-700">{eligibility}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubsidyInfoCard;
