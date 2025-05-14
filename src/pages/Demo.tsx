
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';

const demoSlides = [
  {
    title: 'Welcome to CropSaarthi Demo',
    content: (
      <div className="space-y-4">
        <p>This demo will guide you through the main features of CropSaarthi app.</p>
        <p>CropSaarthi is designed to help Indian farmers with:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Crop disease detection and treatment</li>
          <li>Smart irrigation planning based on weather</li>
          <li>Solar energy solutions for farming</li>
          <li>Soil testing and recommendations</li>
          <li>Government scheme updates</li>
        </ul>
      </div>
    )
  },
  {
    title: 'Crop Doctor',
    content: (
      <div className="space-y-4">
        <p>The Crop Doctor feature helps you identify plant diseases from photos and provides treatment advice.</p>
        <div className="bg-crop-green-light/30 p-4 rounded-lg">
          <h3 className="font-bold mb-2">How it works:</h3>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Take a picture of the affected plant</li>
            <li>Our AI analyses the image to detect diseases</li>
            <li>Get eco-friendly treatment recommendations</li>
            <li>Save the results for future reference</li>
          </ol>
        </div>
        <p className="text-sm italic">The app works offline and saves your diagnoses until you're back online.</p>
      </div>
    )
  },
  {
    title: 'Smart Irrigation Planner',
    content: (
      <div className="space-y-4">
        <p>The Smart Irrigation Planner helps you optimize your water usage based on weather forecasts.</p>
        <div className="bg-crop-water-light/30 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Key features:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Weather forecasts for your location</li>
            <li>Irrigation recommendations based on rainfall predictions</li>
            <li>Water-saving alerts during monsoon season</li>
            <li>Support for IoT soil moisture sensors (coming soon)</li>
          </ul>
        </div>
        <p className="text-sm italic">Save water and improve crop yield with smart irrigation scheduling.</p>
      </div>
    )
  },
  {
    title: 'Multilingual Voice Support',
    content: (
      <div className="space-y-4">
        <p>CropSaarthi understands and speaks your language.</p>
        <div className="bg-crop-sky-light/30 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Languages supported:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>English</li>
            <li>Hindi</li>
            <li>Marathi (coming soon)</li>
            <li>Tamil (coming soon)</li>
            <li>Telugu (coming soon)</li>
            <li>Punjabi (coming soon)</li>
          </ul>
        </div>
        <p>Just tap the microphone button and speak naturally in your preferred language.</p>
      </div>
    )
  }
];

const Demo: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const goToNextSlide = () => {
    if (currentSlide < demoSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      toast({
        title: "Demo Complete",
        description: "You've seen all demo slides. Returning to home.",
      });
      navigate('/');
    }
  };
  
  const goToPreviousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    } else {
      navigate('/');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
      </Button>
      
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-crop-green-dark">{t.appName} Demo</h1>
        <p className="text-gray-600 mt-2">Learn how to use the app with sample data</p>
      </header>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{demoSlides[currentSlide].title}</CardTitle>
        </CardHeader>
        <CardContent>
          {demoSlides[currentSlide].content}
          
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline"
              onClick={goToPreviousSlide}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            
            <div className="flex space-x-1">
              {demoSlides.map((_, index) => (
                <div 
                  key={index} 
                  className={`h-2 w-2 rounded-full ${index === currentSlide ? 'bg-crop-green' : 'bg-gray-300'}`}
                />
              ))}
            </div>
            
            <Button 
              onClick={goToNextSlide}
            >
              {currentSlide < demoSlides.length - 1 ? (
                <>Next <ArrowRight className="ml-2 h-4 w-4" /></>
              ) : (
                'Finish'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Demo;
