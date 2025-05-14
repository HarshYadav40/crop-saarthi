
import React from 'react';
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  onClick?: () => void;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  bgColor,
  onClick,
  className
}) => {
  return (
    <div 
      className={cn('feature-card', className)}
      onClick={onClick}
    >
      <div className={cn('feature-icon', bgColor, 'animate-float')}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-center">{title}</h3>
      <p className="text-center text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
};

export default FeatureCard;
