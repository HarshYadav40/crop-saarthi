
import React from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface FilterOptions {
  search: string;
  provider: string[];
  status: string[];
  states: string[];
  farmerCategories: string[];
  cropTypes: string[];
}

interface SchemeFilterProps {
  filters: FilterOptions;
  onUpdateFilters: (filters: FilterOptions) => void;
  onResetFilters: () => void;
  states: string[];
  farmerCategories: string[];
  cropTypes: string[];
}

const SchemeFilter: React.FC<SchemeFilterProps> = ({
  filters,
  onUpdateFilters,
  onResetFilters,
  states,
  farmerCategories,
  cropTypes
}) => {
  const { t } = useLanguage();

  const handleCheckboxChange = (category: keyof FilterOptions, value: string) => {
    const currentValues = filters[category] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    
    onUpdateFilters({
      ...filters,
      [category]: newValues
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateFilters({
      ...filters,
      search: e.target.value
    });
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">{t.filterSchemes || "Filter Schemes"}</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onResetFilters}
          className="text-xs"
        >
          <X className="h-3 w-3 mr-1" />
          {t.reset || "Reset"}
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="search">{t.search || "Search"}</Label>
          <Input
            id="search"
            placeholder={t.searchPlaceholder || "Search schemes..."}
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>

        <Accordion type="multiple" className="w-full">
          <AccordionItem value="provider">
            <AccordionTrigger className="text-sm py-2">
              {t.schemeProvider || "Provider"}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="provider-government" 
                    checked={filters.provider.includes('government')}
                    onCheckedChange={() => handleCheckboxChange('provider', 'government')}
                  />
                  <Label htmlFor="provider-government">{t.government || "Government"}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="provider-csr" 
                    checked={filters.provider.includes('csr')}
                    onCheckedChange={() => handleCheckboxChange('provider', 'csr')}
                  />
                  <Label htmlFor="provider-csr">CSR</Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="status">
            <AccordionTrigger className="text-sm py-2">
              {t.status || "Status"}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="status-active" 
                    checked={filters.status.includes('active')}
                    onCheckedChange={() => handleCheckboxChange('status', 'active')}
                  />
                  <Label htmlFor="status-active">{t.active || "Active"}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="status-expiring" 
                    checked={filters.status.includes('expiring')}
                    onCheckedChange={() => handleCheckboxChange('status', 'expiring')}
                  />
                  <Label htmlFor="status-expiring">{t.expiringSoon || "Expiring Soon"}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="status-closed" 
                    checked={filters.status.includes('closed')}
                    onCheckedChange={() => handleCheckboxChange('status', 'closed')}
                  />
                  <Label htmlFor="status-closed">{t.closed || "Closed"}</Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="states">
            <AccordionTrigger className="text-sm py-2">
              {t.states || "States"}
            </AccordionTrigger>
            <AccordionContent>
              <Select 
                onValueChange={(value) => {
                  if (!filters.states.includes(value)) {
                    onUpdateFilters({
                      ...filters,
                      states: [...filters.states, value]
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.selectState || "Select state"} />
                </SelectTrigger>
                <SelectContent>
                  {states.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {filters.states.map(state => (
                  <div key={state} className="bg-gray-100 text-xs rounded-full px-2 py-1 flex items-center">
                    {state}
                    <button 
                      onClick={() => onUpdateFilters({
                        ...filters,
                        states: filters.states.filter(s => s !== state)
                      })}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="farmerCategories">
            <AccordionTrigger className="text-sm py-2">
              {t.farmerCategory || "Farmer Category"}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {farmerCategories.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`category-${category}`} 
                      checked={filters.farmerCategories.includes(category)}
                      onCheckedChange={() => handleCheckboxChange('farmerCategories', category)}
                    />
                    <Label htmlFor={`category-${category}`}>{category}</Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cropTypes">
            <AccordionTrigger className="text-sm py-2">
              {t.cropType || "Crop Type"}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {cropTypes.map(cropType => (
                  <div key={cropType} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`crop-${cropType}`} 
                      checked={filters.cropTypes.includes(cropType)}
                      onCheckedChange={() => handleCheckboxChange('cropTypes', cropType)}
                    />
                    <Label htmlFor={`crop-${cropType}`}>{cropType}</Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default SchemeFilter;
