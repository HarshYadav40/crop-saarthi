
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  SolarPanel, 
  Sun, 
  Lightbulb, 
  Info, 
  Calculator, 
  BadgePercent, 
  PiggyBank
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import SolarToolCard from '@/components/SolarToolCard';
import SubsidyInfoCard from '@/components/SubsidyInfoCard';

// Solar tools data
const solarTools = [
  {
    id: 'pump',
    name: 'solarPumps',
    icon: SolarPanel,
    whatIsIt: 'Solar-powered water pumps that use energy from sunlight to pump water for irrigation.',
    howItHelps: 'Eliminates fuel/electricity costs, reliable in off-grid areas, environmentally friendly, low maintenance costs.',
    whereToGet: 'MNRE approved vendors, agricultural equipment dealers, PM-KUSUM scheme applications.'
  },
  {
    id: 'dryer',
    name: 'solarDryers',
    icon: Sun,
    whatIsIt: 'Devices that use solar energy to dry agricultural products like grains, fruits, and vegetables.',
    howItHelps: 'Prevents crop spoilage, maintains quality, saves time compared to traditional sun drying, works in various weather conditions.',
    whereToGet: 'Agricultural equipment suppliers, MNRE approved vendors, rural development centers.'
  },
  {
    id: 'light',
    name: 'solarLights',
    icon: Lightbulb,
    whatIsIt: 'Lighting systems powered by solar panels with battery storage for barns, homes, and outdoor areas.',
    howItHelps: 'Provides reliable lighting in off-grid areas, reduces electricity bills, improves safety and productivity at night.',
    whereToGet: 'Local electronics stores, online marketplaces, rural electrification program vendors.'
  }
];

// State subsidy data for PM-KUSUM scheme
const stateSubsidies = [
  { state: 'Uttar Pradesh', subsidy: 30, eligibility: 'Small and marginal farmers with valid land documents' },
  { state: 'Maharashtra', subsidy: 40, eligibility: 'Farmers with less than 5 acres of land' },
  { state: 'Gujarat', subsidy: 35, eligibility: 'All farmers with valid agricultural connection' },
  { state: 'Rajasthan', subsidy: 45, eligibility: 'Farmers in dark zones with valid land documents' },
  { state: 'Punjab', subsidy: 30, eligibility: 'All farmers with valid land records' },
  { state: 'Haryana', subsidy: 35, eligibility: 'Farmers with existing diesel pumps' },
  { state: 'Bihar', subsidy: 50, eligibility: 'Small and marginal farmers in unelectrified areas' },
  { state: 'Karnataka', subsidy: 40, eligibility: 'Farmers with rain-fed land' },
  { state: 'Tamil Nadu', subsidy: 35, eligibility: 'Farmers with valid land ownership' },
  { state: 'Madhya Pradesh', subsidy: 30, eligibility: 'Farmers in identified water-stressed areas' }
];

const SolarSolutions: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for the calculator
  const [dailyUsage, setDailyUsage] = useState<number>(0);
  const [fuelCost, setFuelCost] = useState<number>(0);
  const [selectedState, setSelectedState] = useState<string>('');
  const [monthlySavings, setMonthlySavings] = useState<number | null>(null);
  const [yearlySavings, setYearlySavings] = useState<number | null>(null);
  
  const calculateSavings = () => {
    if (dailyUsage <= 0 || fuelCost <= 0) {
      toast({
        title: "Input Error",
        description: "Please enter valid usage hours and cost.",
        variant: "destructive"
      });
      return;
    }
    
    // Basic calculation: daily usage * fuel cost * 30 for monthly
    const monthly = dailyUsage * fuelCost * 30;
    setMonthlySavings(monthly);
    setYearlySavings(monthly * 12);
    
    // Success toast
    toast({
      title: "Calculation Complete",
      description: "Your potential solar savings have been calculated.",
    });
  };
  
  const handleCallbackRequest = () => {
    toast({
      title: "Request Received",
      description: "A solar expert will call you back soon.",
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/')}
          className="mr-2"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold text-crop-green-dark">{t.solarSolutions}</h1>
      </header>
      
      <Tabs defaultValue="why-solar" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="why-solar">{t.whyGoSolar}</TabsTrigger>
          <TabsTrigger value="tools">{t.toolsYouCanUse}</TabsTrigger>
          <TabsTrigger value="calculator">{t.calculateSavings}</TabsTrigger>
          <TabsTrigger value="subsidy">{t.getSubsidyInfo}</TabsTrigger>
        </TabsList>
        
        {/* Why Go Solar Tab */}
        <TabsContent value="why-solar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sun className="mr-2 text-crop-sun" />
                {t.whyGoSolar}
              </CardTitle>
              <CardDescription>
                Learn about the benefits of solar energy for farming
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-crop-sun-light p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Economic Benefits</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Reduce or eliminate ongoing fuel and electricity costs</li>
                  <li>Significant government subsidies available (up to 90% in some states)</li>
                  <li>Long operational life (25+ years) with minimal maintenance</li>
                  <li>Quick return on investment (typically 2-4 years with subsidies)</li>
                </ul>
              </div>
              
              <div className="bg-crop-green-light p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Agricultural Benefits</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Reliable irrigation even in areas with inconsistent grid power</li>
                  <li>Operate during daylight hours when water evaporation is lower</li>
                  <li>Better crop yields through consistent and timely irrigation</li>
                  <li>Protection against rising fuel and electricity prices</li>
                </ul>
              </div>
              
              <div className="bg-crop-sky-light p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Environmental Benefits</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Zero carbon emissions during operation</li>
                  <li>No noise pollution unlike diesel pumps</li>
                  <li>No risk of soil or water contamination from fuel spills</li>
                  <li>Sustainable and renewable energy source</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate('/solar-solutions/videos')} className="w-full">
                Watch Success Stories
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">{t.solarEquipment}</h2>
          
          <div className="grid gap-4">
            {solarTools.map((tool) => (
              <SolarToolCard 
                key={tool.id}
                name={t[tool.name as keyof typeof t]}
                Icon={tool.icon}
                whatIsIt={tool.whatIsIt}
                howItHelps={tool.howItHelps}
                whereToGet={tool.whereToGet}
                t={t}
              />
            ))}
          </div>
        </TabsContent>
        
        {/* Calculator Tab */}
        <TabsContent value="calculator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="mr-2 text-crop-green" />
                {t.calculateSavings}
              </CardTitle>
              <CardDescription>
                Estimate your potential savings by switching to solar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dailyUsage">{t.dailyUsageHours}</Label>
                <Input 
                  id="dailyUsage" 
                  type="number" 
                  min="0"
                  value={dailyUsage || ''} 
                  onChange={(e) => setDailyUsage(Number(e.target.value))}
                  placeholder="e.g., 5"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fuelCost">{t.fuelCost} (₹/hour)</Label>
                <Input 
                  id="fuelCost" 
                  type="number" 
                  min="0"
                  value={fuelCost || ''} 
                  onChange={(e) => setFuelCost(Number(e.target.value))}
                  placeholder="e.g., 100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">{t.state}</Label>
                <select 
                  id="state"
                  className="w-full border border-gray-300 rounded-md h-10 px-3"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                >
                  <option value="">Select state</option>
                  {stateSubsidies.map((item) => (
                    <option key={item.state} value={item.state}>{item.state}</option>
                  ))}
                </select>
              </div>
              
              <Button 
                onClick={calculateSavings} 
                className="w-full mt-4"
              >
                {t.calculate}
              </Button>
              
              {monthlySavings !== null && yearlySavings !== null && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Your Potential Savings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">{t.monthlySavings}:</p>
                      <p className="text-xl font-bold text-green-700">₹{monthlySavings.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t.yearlySavings}:</p>
                      <p className="text-xl font-bold text-green-700">₹{yearlySavings.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {selectedState && (
                    <div className="mt-4 p-2 bg-blue-50 border border-blue-100 rounded">
                      <p className="text-sm">
                        <span className="font-semibold">Tip:</span> In {selectedState}, you may qualify for up to 
                        {stateSubsidies.find(s => s.state === selectedState)?.subsidy}% subsidy on solar equipment!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Subsidy Tab */}
        <TabsContent value="subsidy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BadgePercent className="mr-2 text-crop-green" />
                {t.subsidyInfo}
              </CardTitle>
              <CardDescription>
                Government schemes available for solar adoption in agriculture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* PM-KUSUM Scheme Information */}
              <div className="bg-crop-sky-light p-4 rounded-lg mb-4">
                <h3 className="font-bold text-lg flex items-center mb-2">
                  <Info className="w-5 h-5 mr-2" /> PM-KUSUM Scheme
                </h3>
                <p className="mb-2">Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan (PM-KUSUM) provides:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Component A: Setting up small solar power plants on barren lands</li>
                  <li>Component B: Installation of standalone solar pumps</li>
                  <li>Component C: Solarization of grid-connected agricultural pumps</li>
                </ul>
                <div className="mt-3">
                  <a 
                    href="https://pmkusum.mnre.gov.in/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    Visit Official Website <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
                  </a>
                </div>
              </div>
              
              {/* State-wise subsidy information */}
              <h3 className="font-bold text-lg mt-4 mb-2">State-wise Subsidies</h3>
              <div className="grid gap-4">
                {stateSubsidies.map((subsidy) => (
                  <SubsidyInfoCard
                    key={subsidy.state}
                    state={subsidy.state}
                    subsidyPercent={subsidy.subsidy}
                    eligibility={subsidy.eligibility}
                    t={t}
                  />
                ))}
              </div>
              
              {/* Application Process */}
              <div className="mt-6 border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-3">{t.applicationProcess}</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Contact your district agricultural officer or visit the nearest Krishi Vigyan Kendra</li>
                  <li>Submit application with land documents, identity proof, and bank account details</li>
                  <li>Select vendor from the approved list provided by your state agricultural department</li>
                  <li>Complete the verification process and site assessment</li>
                  <li>Receive approval and installation of solar equipment</li>
                </ol>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleCallbackRequest}
              >
                {t.requestCallback}
              </Button>
              <Button 
                className="w-full"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Solar Subsidy Information',
                      text: 'Check out this information on solar subsidies for farmers',
                      url: window.location.href,
                    });
                  } else {
                    toast({
                      title: "Share not supported",
                      description: "Your browser does not support the share functionality"
                    });
                  }
                }}
              >
                Share This Information
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SolarSolutions;
