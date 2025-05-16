
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bell, 
  BookmarkCheck,
  Undo2, 
  ExternalLink,
  Filter
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import SchemeCard, { SchemeData } from '@/components/SchemeCard';
import SchemeFilter, { FilterOptions } from '@/components/SchemeFilter';
import networkUtils from '@/services/NetworkUtils';

// Mock schemes data for demonstration
const mockSchemes: SchemeData[] = [
  {
    id: '1',
    title: 'PM-KISAN Scheme',
    summary: 'Income support of ₹6000 per year to all farmer families across the country in three equal installments of ₹2000 each every four months.',
    provider: 'government',
    organization: 'Ministry of Agriculture & Farmers Welfare',
    eligibility: 'All landholding farmers\' families with cultivable land holdings.',
    benefits: 'Direct income support of ₹6,000 per year in three equal installments.',
    applicationProcess: 'Apply through local Common Service Centers or online at pm-kisan.gov.in',
    applicationUrl: 'https://pmkisan.gov.in/',
    expiryDate: 'Ongoing',
    tags: ['Financial Aid', 'Direct Benefit Transfer'],
    states: ['All India'],
    farmerCategories: ['Small', 'Marginal', 'Medium'],
    cropTypes: ['All'],
    status: 'active'
  },
  {
    id: '2',
    title: 'Kisan Credit Card Scheme',
    summary: 'Provides farmers with timely credit for their agricultural operations.',
    provider: 'government',
    organization: 'NABARD & Commercial Banks',
    eligibility: 'All farmers, tenant farmers, oral lessees, SHGs, and JLGs.',
    benefits: 'Crop loans at competitive interest rates with interest subvention of 2% and additional 3% for timely repayment.',
    applicationProcess: 'Apply at local bank branches or during special KCC camps.',
    tags: ['Credit', 'Financial Support'],
    states: ['All India'],
    farmerCategories: ['All'],
    cropTypes: ['All'],
    status: 'active'
  },
  {
    id: '3',
    title: 'Crop Insurance - PMFBY',
    summary: 'Pradhan Mantri Fasal Bima Yojana provides insurance coverage and financial support to farmers in case of crop failure due to natural calamities.',
    provider: 'government',
    organization: 'Ministry of Agriculture & Farmers Welfare',
    eligibility: 'All farmers including sharecroppers and tenant farmers growing the notified crops.',
    benefits: 'Comprehensive risk coverage for pre-sowing to post-harvest losses due to natural calamities.',
    applicationProcess: 'Apply through banks while availing crop loans or through insurance companies.',
    applicationUrl: 'https://pmfby.gov.in/',
    tags: ['Insurance', 'Risk Protection'],
    states: ['All India'],
    farmerCategories: ['All'],
    cropTypes: ['Notified Crops'],
    status: 'active'
  },
  {
    id: '4',
    title: 'ITC e-Choupal 4.0',
    summary: 'Digital platform to empower farmers through access to information, best practices, and markets.',
    provider: 'csr',
    organization: 'ITC Limited',
    eligibility: 'Farmers in villages where e-Choupal is operational.',
    benefits: 'Access to real-time information, weather forecasts, market prices, and sustainable farming practices.',
    applicationProcess: 'Visit the nearest e-Choupal center or contact ITC\'s local representative.',
    applicationUrl: 'https://www.itcportal.com/sustainability/echoupal.aspx',
    tags: ['Digital Services', 'Market Linkage'],
    states: ['Madhya Pradesh', 'Uttar Pradesh', 'Maharashtra', 'Karnataka'],
    farmerCategories: ['All'],
    cropTypes: ['Soybean', 'Wheat', 'Coffee', 'Rice'],
    status: 'active'
  },
  {
    id: '5',
    title: 'Sustainable Agriculture Program',
    summary: 'Training and support for climate-smart farming techniques.',
    provider: 'csr',
    organization: 'Tata Trusts',
    eligibility: 'Small and marginal farmers in selected districts.',
    benefits: 'Training, demonstration of practices, and input support for sustainable agriculture.',
    applicationProcess: 'Contact local Tata Trusts representatives or partner NGOs.',
    applicationUrl: 'https://www.tatatrusts.org/our-work/livelihoods/agriculture',
    tags: ['Training', 'Sustainability'],
    states: ['Gujarat', 'Maharashtra', 'Jharkhand', 'Odisha'],
    farmerCategories: ['Small', 'Marginal'],
    cropTypes: ['Multiple'],
    status: 'active'
  },
  {
    id: '6',
    title: 'Solar Pump Subsidy',
    summary: 'Subsidy for installation of solar-powered irrigation pumps under PM-KUSUM component B.',
    provider: 'government',
    organization: 'Ministry of New and Renewable Energy',
    eligibility: 'Farmers with grid-connected or diesel pumps for irrigation.',
    benefits: 'Up to 90% subsidy on solar pump costs depending on capacity and state contribution.',
    applicationProcess: 'Apply through state nodal agencies or agriculture department.',
    applicationUrl: 'https://pmkusum.mnre.gov.in/',
    expiryDate: '31-12-2023',
    tags: ['Renewable Energy', 'Irrigation'],
    states: ['All India'],
    farmerCategories: ['All'],
    cropTypes: ['All'],
    status: 'expiring'
  },
  {
    id: '7',
    title: 'Farm Mechanization Training',
    summary: 'Free training programs on modern farm equipment and machinery.',
    provider: 'csr',
    organization: 'Mahindra & Mahindra',
    eligibility: 'Farmers interested in farm mechanization.',
    benefits: 'Hands-on training on tractors and implements, maintenance guidance, and operation safety.',
    applicationProcess: 'Register through local Mahindra dealerships.',
    tags: ['Training', 'Mechanization'],
    states: ['Punjab', 'Haryana', 'Rajasthan', 'Gujarat'],
    farmerCategories: ['All'],
    cropTypes: ['All'],
    status: 'active'
  },
  {
    id: '8',
    title: 'Agri-Entrepreneur Program',
    summary: 'Training and support for youth to become agri-entrepreneurs serving farmers.',
    provider: 'csr',
    organization: 'Syngenta Foundation',
    eligibility: 'Rural youth with basic education and interest in agriculture.',
    benefits: 'Training, handholding support, and linkages to establish agri-service business.',
    applicationProcess: 'Apply online or through partner organizations.',
    applicationUrl: 'https://www.syngentafoundation.org/agri-entrepreneur',
    tags: ['Entrepreneurship', 'Youth'],
    states: ['Bihar', 'Maharashtra', 'Odisha', 'Jharkhand'],
    farmerCategories: ['Service Providers'],
    cropTypes: ['All'],
    status: 'active'
  },
  {
    id: '9',
    title: 'Weather-Based Crop Insurance',
    summary: 'Insurance coverage against adverse weather conditions affecting crop yield.',
    provider: 'government',
    organization: 'Agricultural Insurance Company of India',
    eligibility: 'All farmers growing notified crops in notified areas.',
    benefits: 'Financial protection against deviation in weather parameters.',
    applicationProcess: 'Apply through banks, insurance companies, or common service centers.',
    expiryDate: 'Seasonal',
    tags: ['Insurance', 'Weather Risk'],
    states: ['Selected States'],
    farmerCategories: ['All'],
    cropTypes: ['Notified Crops'],
    status: 'closed'
  },
  {
    id: '10',
    title: 'Soil Health Management',
    summary: 'Training and demonstration on soil health management practices.',
    provider: 'csr',
    organization: 'Reliance Foundation',
    eligibility: 'Farmers in selected villages under Reliance Foundation\'s program areas.',
    benefits: 'Training on soil testing, balanced fertilization, and conservation practices.',
    applicationProcess: 'Register through Reliance Foundation\'s field staff.',
    tags: ['Training', 'Soil Health'],
    states: ['Gujarat', 'Maharashtra', 'Andhra Pradesh', 'Telangana'],
    farmerCategories: ['All'],
    cropTypes: ['All'],
    status: 'active'
  }
];

// Static filter options
const availableStates = [
  'All India', 'Andhra Pradesh', 'Bihar', 'Gujarat', 'Haryana', 'Jharkhand', 
  'Karnataka', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 
  'Rajasthan', 'Telangana', 'Uttar Pradesh'
];

const availableFarmerCategories = ['Small', 'Marginal', 'Medium', 'Large', 'All', 'Service Providers'];

const availableCropTypes = ['All', 'Notified Crops', 'Rice', 'Wheat', 'Soybean', 'Cotton', 'Multiple'];

const WelfareSchemes: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(networkUtils.isOnline());
  const [schemes, setSchemes] = useState<SchemeData[]>(mockSchemes);
  const [bookmarkedSchemes, setBookmarkedSchemes] = useState<string[]>([]);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    provider: [],
    status: ['active', 'expiring'],
    states: [],
    farmerCategories: [],
    cropTypes: []
  });
  
  useEffect(() => {
    // Load bookmarked schemes from localStorage
    const savedBookmarks = localStorage.getItem('bookmarkedSchemes');
    if (savedBookmarks) {
      try {
        setBookmarkedSchemes(JSON.parse(savedBookmarks));
      } catch (error) {
        console.error('Error parsing bookmarked schemes:', error);
      }
    }
    
    // Set up network listeners
    const cleanup = networkUtils.setupNetworkListeners(
      // Online callback
      () => {
        setIsOnline(true);
      },
      // Offline callback
      () => {
        setIsOnline(false);
        toast({
          title: t.offlineMode,
          description: t.offlineDesc || "You're currently offline. Some features may be limited.",
          variant: "destructive",
        });
      }
    );
    
    return cleanup;
  }, [toast, t]);
  
  // In a real app, this would fetch schemes from an API
  useEffect(() => {
    // Simulating API call with setTimeout
    const timer = setTimeout(() => {
      // We're already using mockSchemes as initial state, so no need to set again
      // This would be where you'd fetch from an actual API
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleBookmarkScheme = (id: string) => {
    setBookmarkedSchemes(prev => {
      const newBookmarks = prev.includes(id) 
        ? prev.filter(bm => bm !== id)
        : [...prev, id];
      
      // Save to localStorage
      localStorage.setItem('bookmarkedSchemes', JSON.stringify(newBookmarks));
      
      return newBookmarks;
    });
    
    toast({
      title: bookmarkedSchemes.includes(id) 
        ? t.bookmarkRemoved || "Bookmark Removed"
        : t.bookmarkAdded || "Bookmark Added",
      description: bookmarkedSchemes.includes(id)
        ? t.schemeRemovedFromBookmarks || "Scheme removed from your bookmarks"
        : t.schemeAddedToBookmarks || "Scheme added to your bookmarks",
    });
  };
  
  const handleToggleNotifications = () => {
    if (!notificationEnabled) {
      // In a real app, you would request notification permissions
      toast({
        title: t.notificationsEnabled || "Notifications Enabled",
        description: t.notificationsDesc || "You will be notified about new schemes and updates.",
      });
    } else {
      toast({
        title: t.notificationsDisabled || "Notifications Disabled",
        description: t.notificationsDisabledDesc || "You will no longer receive scheme notifications.",
      });
    }
    
    setNotificationEnabled(!notificationEnabled);
  };
  
  const handleResetFilters = () => {
    setFilters({
      search: '',
      provider: [],
      status: ['active', 'expiring'],
      states: [],
      farmerCategories: [],
      cropTypes: []
    });
    
    toast({
      title: t.filtersReset || "Filters Reset",
      description: t.filtersResetDesc || "All filters have been cleared.",
    });
  };
  
  const handleUpdateFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  // Filter the schemes based on current filters
  const filteredSchemes = schemes.filter(scheme => {
    // Search filter
    if (filters.search && !scheme.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !scheme.summary.toLowerCase().includes(filters.search.toLowerCase()) &&
        !scheme.organization.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Provider filter
    if (filters.provider.length > 0 && !filters.provider.includes(scheme.provider)) {
      return false;
    }
    
    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(scheme.status)) {
      return false;
    }
    
    // States filter
    if (filters.states.length > 0 && 
        !filters.states.some(state => scheme.states.includes(state) || scheme.states.includes('All India'))) {
      return false;
    }
    
    // Farmer categories filter
    if (filters.farmerCategories.length > 0 && 
        !filters.farmerCategories.some(cat => 
          scheme.farmerCategories.includes(cat) || scheme.farmerCategories.includes('All'))) {
      return false;
    }
    
    // Crop types filter
    if (filters.cropTypes.length > 0 && 
        !filters.cropTypes.some(crop => 
          scheme.cropTypes.includes(crop) || scheme.cropTypes.includes('All'))) {
      return false;
    }
    
    return true;
  });
  
  // Filter for bookmarked schemes
  const bookmarkedSchemesList = filteredSchemes.filter(scheme => 
    bookmarkedSchemes.includes(scheme.id)
  );
  
  // Get schemes to display based on active tab
  const displayedSchemes = activeTab === 'bookmarked' 
    ? bookmarkedSchemesList 
    : filteredSchemes;
  
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
        <h1 className="text-2xl font-bold text-crop-sky-dark">{t.welfareSchemes || "Welfare Schemes"}</h1>
        
        <div className="flex ml-auto space-x-2">
          <Button
            variant={notificationEnabled ? "default" : "outline"}
            size="icon"
            onClick={handleToggleNotifications}
            className={notificationEnabled ? "bg-crop-sky text-white" : ""}
          >
            <Bell className="h-5 w-5" />
          </Button>
          
          <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
              >
                <Filter className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>{t.filterSchemes || "Filter Schemes"}</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <SchemeFilter 
                  filters={filters}
                  onUpdateFilters={handleUpdateFilters}
                  onResetFilters={handleResetFilters}
                  states={availableStates}
                  farmerCategories={availableFarmerCategories}
                  cropTypes={availableCropTypes}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      
      {!isOnline && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
          <p className="text-sm text-yellow-800">
            {t.offlineMode} - {t.offlineSchemes || "Showing cached schemes. Some features may be limited."}
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar with filters - hidden on mobile */}
        <div className="hidden md:block">
          <SchemeFilter 
            filters={filters}
            onUpdateFilters={handleUpdateFilters}
            onResetFilters={handleResetFilters}
            states={availableStates}
            farmerCategories={availableFarmerCategories}
            cropTypes={availableCropTypes}
          />
        </div>
        
        {/* Main content area */}
        <div className="md:col-span-3">
          <Tabs 
            defaultValue="all" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="all">
                {t.allSchemes || "All Schemes"}
                <Badge variant="outline" className="ml-2 bg-gray-100">
                  {filteredSchemes.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="bookmarked">
                <span className="flex items-center">
                  <BookmarkCheck className="h-4 w-4 mr-1" />
                  {t.bookmarked || "Bookmarked"}
                </span>
                <Badge variant="outline" className="ml-2 bg-gray-100">
                  {bookmarkedSchemesList.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {filteredSchemes.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 flex flex-col items-center">
                    <p className="text-gray-500 mb-2">{t.noSchemesFound || "No schemes match your filters"}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleResetFilters}
                      className="flex items-center"
                    >
                      <Undo2 className="h-4 w-4 mr-2" />
                      {t.resetFilters || "Reset Filters"}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredSchemes.map(scheme => (
                    <SchemeCard 
                      key={scheme.id}
                      scheme={scheme}
                      onBookmark={handleBookmarkScheme}
                      isBookmarked={bookmarkedSchemes.includes(scheme.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="bookmarked" className="space-y-4">
              {bookmarkedSchemesList.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 flex flex-col items-center">
                    <p className="text-gray-500 mb-2">{t.noBookmarkedSchemes || "You haven't bookmarked any schemes yet"}</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('all')}
                    >
                      {t.browseSchemes || "Browse All Schemes"}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {bookmarkedSchemesList.map(scheme => (
                    <SchemeCard 
                      key={scheme.id}
                      scheme={scheme}
                      onBookmark={handleBookmarkScheme}
                      isBookmarked={true}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{t.usefulResources || "Useful Resources"}</CardTitle>
          <CardDescription>{t.additionalLinks || "Additional links to government portals and resources"}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.portal || "Portal"}</TableHead>
                <TableHead>{t.description || "Description"}</TableHead>
                <TableHead className="w-[100px]">{t.link || "Link"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">agricoop.nic.in</TableCell>
                <TableCell>{t.agricoopDesc || "Ministry of Agriculture & Farmers Welfare portal with scheme information"}</TableCell>
                <TableCell>
                  <Button variant="link" size="sm" asChild>
                    <a href="https://agricoop.nic.in" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">pmkisan.gov.in</TableCell>
                <TableCell>{t.pmkisanDesc || "PM-KISAN scheme portal for income support to farmers"}</TableCell>
                <TableCell>
                  <Button variant="link" size="sm" asChild>
                    <a href="https://pmkisan.gov.in" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">mnre.gov.in</TableCell>
                <TableCell>{t.mnreDesc || "Ministry of New and Renewable Energy portal for solar schemes"}</TableCell>
                <TableCell>
                  <Button variant="link" size="sm" asChild>
                    <a href="https://mnre.gov.in" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">startupindia.gov.in</TableCell>
                <TableCell>{t.startupDesc || "Information for agri-startups and entrepreneurs"}</TableCell>
                <TableCell>
                  <Button variant="link" size="sm" asChild>
                    <a href="https://startupindia.gov.in" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelfareSchemes;
