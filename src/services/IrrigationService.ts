
export interface CropIrrigationRequirement {
  crop: string;
  minRainfallPerWeek: number;
  idealSoilMoisture: number;
  alertThresholdDays: number;
}

export type SoilCondition = "Dry" | "Moist" | "Wet";

export interface IrrigationRecommendation {
  needsIrrigation: boolean;
  message: string;
  urgencyLevel: "low" | "medium" | "high";
  daysUntilNeeded?: number;
}

class IrrigationService {
  // Crop irrigation requirements data
  private cropRequirements: CropIrrigationRequirement[] = [
    {
      crop: "Wheat",
      minRainfallPerWeek: 15,
      idealSoilMoisture: 60,
      alertThresholdDays: 5
    },
    {
      crop: "Rice",
      minRainfallPerWeek: 25,
      idealSoilMoisture: 80,
      alertThresholdDays: 2
    },
    {
      crop: "Cotton",
      minRainfallPerWeek: 20,
      idealSoilMoisture: 65,
      alertThresholdDays: 4
    },
    {
      crop: "Maize",
      minRainfallPerWeek: 20,
      idealSoilMoisture: 70,
      alertThresholdDays: 3
    },
    {
      crop: "Sugarcane",
      minRainfallPerWeek: 30,
      idealSoilMoisture: 75,
      alertThresholdDays: 2
    },
    {
      crop: "Pulses",
      minRainfallPerWeek: 12,
      idealSoilMoisture: 55,
      alertThresholdDays: 6
    },
    {
      crop: "Vegetables",
      minRainfallPerWeek: 18,
      idealSoilMoisture: 70,
      alertThresholdDays: 2
    },
    {
      crop: "Fruits",
      minRainfallPerWeek: 22,
      idealSoilMoisture: 65,
      alertThresholdDays: 3
    }
  ];

  // Get all available crops
  getAvailableCrops(): string[] {
    return this.cropRequirements.map(crop => crop.crop);
  }

  // Get requirements for a specific crop
  getCropRequirements(cropName: string): CropIrrigationRequirement | undefined {
    return this.cropRequirements.find(crop => crop.crop === cropName);
  }

  // Convert soil condition to approximate moisture percentage
  soilConditionToMoisture(condition: SoilCondition): number {
    switch (condition) {
      case "Dry": return 30;
      case "Moist": return 60;
      case "Wet": return 90;
      default: return 50;
    }
  }

  // Calculate irrigation recommendation based on weather forecasts and crop data
  calculateRecommendation(
    cropName: string,
    soilCondition: SoilCondition,
    forecasts: { date: Date; rainfall: number }[]
  ): IrrigationRecommendation {
    const cropRequirement = this.getCropRequirements(cropName);
    
    if (!cropRequirement) {
      return {
        needsIrrigation: false,
        message: `No data available for ${cropName}. Please select a different crop.`,
        urgencyLevel: "low"
      };
    }

    // Calculate total forecasted rainfall
    const totalRainfall = forecasts.reduce((sum, day) => sum + day.rainfall, 0);
    
    // Current soil moisture based on farmer's input
    const currentSoilMoisture = this.soilConditionToMoisture(soilCondition);
    
    // Check if heavy rain is forecasted in the next 24 hours
    const heavyRainTomorrow = forecasts.length > 0 && forecasts[0].rainfall > 10;
    
    if (heavyRainTomorrow) {
      return {
        needsIrrigation: false,
        message: "Heavy rain expected soon. Skip irrigation to prevent overwatering.",
        urgencyLevel: "low"
      };
    }

    // Find the first day with rainfall
    let dryDaysCount = 0;
    for (let i = 0; i < forecasts.length; i++) {
      if (forecasts[i].rainfall > 5) {
        break;
      }
      dryDaysCount++;
    }

    // Check if no substantial rain is expected
    const noRainPeriod = dryDaysCount >= cropRequirement.alertThresholdDays;
    
    // Determine if soil moisture is too low
    const moistureDeficit = cropRequirement.idealSoilMoisture - currentSoilMoisture;
    const lowMoisture = moistureDeficit > 15;
    
    if (noRainPeriod && lowMoisture) {
      return {
        needsIrrigation: true,
        message: `Your ${cropName} needs irrigation in the next ${Math.min(2, dryDaysCount)} days.`,
        urgencyLevel: "high",
        daysUntilNeeded: Math.min(2, dryDaysCount)
      };
    } else if (noRainPeriod) {
      return {
        needsIrrigation: true,
        message: `Consider irrigating your ${cropName} soon. No rain expected for ${dryDaysCount} days.`,
        urgencyLevel: "medium",
        daysUntilNeeded: 3
      };
    } else if (lowMoisture) {
      return {
        needsIrrigation: true,
        message: `Soil moisture for ${cropName} is low, but rain is expected in ${dryDaysCount} days.`,
        urgencyLevel: "low",
        daysUntilNeeded: Math.max(1, dryDaysCount)
      };
    } else {
      return {
        needsIrrigation: false,
        message: `Your ${cropName} has adequate water. Next check recommended in 3 days.`,
        urgencyLevel: "low"
      };
    }
  }
}

export default new IrrigationService();
