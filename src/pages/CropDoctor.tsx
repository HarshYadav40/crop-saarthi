
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';
import VoiceInput from '@/components/VoiceInput';
import offlineStorage from '@/services/OfflineStorage';

// Mock disease detection results
const mockDiseaseResults = {
  'tomato': {
    disease: 'Tomato Early Blight',
    confidence: 94.8,
    treatment: 'Remove infected leaves. Apply neem oil or copper-based fungicide. Ensure proper spacing between plants for air circulation.',
    organicSolution: 'Mix 2 tablespoons of baking soda, 1 tablespoon of vegetable oil, and a few drops of mild soap in 1 gallon of water. Spray on infected plants weekly.'
  },
  'wheat': {
    disease: 'Wheat Leaf Rust',
    confidence: 88.7,
    treatment: 'Apply fungicide with active ingredients like tebuconazole or propiconazole. Remove volunteer wheat plants that may harbor the disease.',
    organicSolution: 'Spray a mixture of 1 part milk to 10 parts water twice a week. Plant rust-resistant wheat varieties in the future.'
  },
  'rice': {
    disease: 'Rice Blast',
    confidence: 91.2,
    treatment: 'Apply fungicides containing tricyclazole or azoxystrobin. Avoid excess nitrogen fertilization.',
    organicSolution: 'Apply compost tea as a foliar spray. Maintain balanced field water levels and avoid water stress.'
  }
};

const CropDoctor: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleCapture = () => {
    // In a real implementation, we would access the camera
    toast({
      title: "Camera Access",
      description: "This functionality will use the device camera in the full implementation.",
    });
    
    // For demo purposes, we'll use a fake image and detection
    simulateImageCapture();
  };
  
  const handleImageSelect = () => {
    // In a real implementation, we would access the gallery
    toast({
      title: "Image Gallery",
      description: "This functionality will access your photo gallery in the full implementation.",
    });
    
    // For demo purposes, we'll use a fake image and detection
    simulateImageCapture();
  };
  
  const simulateImageCapture = () => {
    // Choose a random crop for the demo
    const crops = ['tomato', 'wheat', 'rice'];
    const selectedCrop = crops[Math.floor(Math.random() * crops.length)];
    
    // Set a placeholder image
    setSelectedImage(`/placeholder.svg`);
    
    // Simulate processing time
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const result = mockDiseaseResults[selectedCrop as keyof typeof mockDiseaseResults];
      setDiagnosisResult(result);
      setIsAnalyzing(false);
      
      // Save the diagnosis to IndexedDB for offline access
      offlineStorage.saveDiagnosis({
        imageUrl: `/placeholder.svg`,
        disease: result.disease,
        confidence: result.confidence,
        treatment: result.treatment,
        timestamp: Date.now(),
        synced: false
      });
    }, 3000);
  };
  
  const handleVoiceInput = (transcript: string) => {
    toast({
      title: "Voice Input Received",
      description: transcript,
    });
    
    // Simple commands for demo
    const lowerTranscript = transcript.toLowerCase();
    if (lowerTranscript.includes('scan') || lowerTranscript.includes('take picture')) {
      handleCapture();
    } else if (lowerTranscript.includes('gallery') || lowerTranscript.includes('select image')) {
      handleImageSelect();
    } else if (lowerTranscript.includes('back') || lowerTranscript.includes('home')) {
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
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-crop-green-dark">{t.cropDoctor}</h1>
        <p className="text-lg text-gray-600 mt-2">{t.uploadPlant}</p>
      </header>
      
      {!selectedImage ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card 
            className="hover:shadow-md transition-shadow cursor-pointer bg-crop-green-light/20" 
            onClick={handleCapture}
          >
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Camera className="h-16 w-16 text-crop-green-dark mb-4" />
              <h3 className="text-xl font-semibold">{t.takePicture}</h3>
            </CardContent>
          </Card>
          
          <Card 
            className="hover:shadow-md transition-shadow cursor-pointer bg-crop-earth-light/20" 
            onClick={handleImageSelect}
          >
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Image className="h-16 w-16 text-crop-earth-dark mb-4" />
              <h3 className="text-xl font-semibold">{t.selectFromGallery}</h3>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="aspect-square max-w-md mx-auto relative rounded-lg overflow-hidden border-2 border-crop-green">
            <img 
              src={selectedImage} 
              alt="Selected plant" 
              className="w-full h-full object-cover"
            />
            
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="inline-block animate-spin h-8 w-8 border-4 border-white rounded-full border-t-transparent mb-2"></div>
                  <p>{t.detecting}</p>
                </div>
              </div>
            )}
          </div>
          
          {diagnosisResult && (
            <Card className="max-w-md mx-auto bg-white">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-red-600">{diagnosisResult.disease}</h3>
                    <p className="text-sm text-gray-500">
                      Confidence: {diagnosisResult.confidence}%
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-crop-green-dark">Treatment:</h4>
                    <p>{diagnosisResult.treatment}</p>
                  </div>
                  
                  <div className="bg-crop-earth-light/30 p-3 rounded-md">
                    <h4 className="font-semibold text-crop-earth-dark">Organic Solution:</h4>
                    <p>{diagnosisResult.organicSolution}</p>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setSelectedImage(null);
                      setDiagnosisResult(null);
                    }}
                  >
                    Scan Another Plant
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      <VoiceInput onTranscript={handleVoiceInput} />
    </div>
  );
};

export default CropDoctor;
