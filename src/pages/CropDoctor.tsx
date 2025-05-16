
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image, ArrowLeft, MapPin, Leaf, TestTube, Bug, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';
import VoiceInput from '@/components/VoiceInput';
import offlineStorage from '@/services/OfflineStorage';
import { identifyPlantDisease, saveGeminiApiKey, getGeminiApiKey, hasGeminiApiKey } from '@/services/PlantApi';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";

const CropDoctor: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationStatus, setLocationStatus] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get location on component mount
  useEffect(() => {
    getLocation();
    
    // Check if we have a stored Gemini API key
    const storedKey = getGeminiApiKey();
    if (storedKey) {
      setGeminiApiKey(storedKey);
    }
    
    // Cleanup function to stop any active streams when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const getLocation = () => {
    setLocationStatus("Detecting location...");
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          setLocationStatus(`Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          
          toast({
            title: "Location detected",
            description: `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationStatus("Could not detect location");
          
          toast({
            title: "Location Error",
            description: "Could not access your location. Please enable location services.",
            variant: "destructive"
          });
        }
      );
    } else {
      setLocationStatus("Geolocation not supported");
      toast({
        title: "Location Error",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive"
      });
    }
  };

  const startCameraStream = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
        
        setIsCameraDialogOpen(true);
      } else {
        toast({
          title: "Camera Error",
          description: "Camera access is not available on this device.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please grant permission.",
        variant: "destructive"
      });
    }
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraDialogOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setSelectedImage(imageDataUrl);
        stopCameraStream();
        processSelectedImage(imageDataUrl);
      }
    }
  };

  const handleCapture = () => {
    startCameraStream();
  };
  
  const handleImageSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          const imageDataUrl = event.target.result as string;
          setSelectedImage(imageDataUrl);
          processSelectedImage(imageDataUrl);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  const processSelectedImage = async (imageDataUrl: string) => {
    // Start analyzing
    setIsAnalyzing(true);
    
    try {
      // Show analyzing toast
      toast({
        title: "AI Analysis Started",
        description: "Analyzing your plant image for diseases...",
      });
      
      // Call the plant disease identification API
      const result = await identifyPlantDisease(imageDataUrl);
      
      // Set the diagnosis result
      setDiagnosisResult(result);
      
      // Save the diagnosis to IndexedDB for offline access
      offlineStorage.saveDiagnosis({
        imageUrl: imageDataUrl,
        disease: result.disease,
        confidence: result.confidence,
        treatment: result.treatment,
        timestamp: Date.now(),
        synced: false,
        location: location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Unknown'
      });
      
      toast({
        title: "Analysis Complete",
        description: `Identified ${result.disease} with ${result.confidence}% confidence`,
      });
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the plant image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
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
    } else if (lowerTranscript.includes('location')) {
      getLocation();
    }
  };

  const openApiKeyDialog = () => {
    setIsApiKeyDialogOpen(true);
  };

  const handleSaveApiKey = () => {
    if (geminiApiKey.trim()) {
      saveGeminiApiKey(geminiApiKey);
      toast({
        title: "API Key Saved",
        description: "Your Gemini API key has been saved.",
      });
      setIsApiKeyDialogOpen(false);
    } else {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid API key.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={openApiKeyDialog}
          className="flex items-center"
        >
          <Settings className="h-4 w-4 mr-2" />
          {hasGeminiApiKey() ? t.geminiAnalysis : t.useGeminiAI}
        </Button>
      </div>
      
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-crop-green-dark">{t.cropDoctor}</h1>
        <p className="text-lg text-gray-600 mt-2">{t.uploadPlant}</p>
        
        {locationStatus && (
          <div className="mt-2 flex items-center justify-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{locationStatus}</span>
          </div>
        )}
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
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-red-600">{diagnosisResult.disease}</h3>
                      <p className="text-sm text-gray-500">
                        {hasGeminiApiKey() ? t.geminiAnalysis : 'AI'} Confidence: {diagnosisResult.confidence}%
                      </p>
                    </div>
                    <Bug className="h-8 w-8 text-red-500" />
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center mb-2">
                      <TestTube className="h-5 w-5 mr-2 text-crop-green-dark" />
                      <h4 className="font-semibold text-crop-green-dark">Treatment:</h4>
                    </div>
                    <p className="text-gray-700">{diagnosisResult.treatment}</p>
                  </div>
                  
                  <div className="bg-crop-earth-light/30 p-4 rounded-md">
                    <div className="flex items-center mb-2">
                      <Leaf className="h-5 w-5 mr-2 text-crop-earth-dark" />
                      <h4 className="font-semibold text-crop-earth-dark">Organic Solution:</h4>
                    </div>
                    <p className="text-gray-700">{diagnosisResult.organicSolution}</p>
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
      
      {/* Camera Dialog */}
      <Dialog open={isCameraDialogOpen} onOpenChange={setIsCameraDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogTitle>Take a Photo</DialogTitle>
          <DialogDescription>
            Position the plant in the center of the frame
          </DialogDescription>
          
          <div className="relative aspect-video w-full bg-black rounded-md overflow-hidden">
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={stopCameraStream}>Cancel</Button>
            <Button onClick={capturePhoto}>Capture</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Gemini API Key Dialog */}
      <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>{t.enterGeminiKey}</DialogTitle>
          <DialogDescription>
            Enter your Gemini API key to enable AI-powered plant disease detection.
          </DialogDescription>
          
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Enter Gemini API key..."
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Get your API key from the Google AI Studio: 
              <a href="https://aistudio.google.com/app/apikey" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-blue-500 hover:underline ml-1">
                aistudio.google.com
              </a>
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsApiKeyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveApiKey}>
              {t.saveKey}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <VoiceInput onTranscript={handleVoiceInput} />
    </div>
  );
};

export default CropDoctor;
