
import { openDB, IDBPDatabase } from 'idb';

interface PlantDiagnosis {
  id?: number;
  imageUrl: string;
  disease: string;
  confidence: number;
  treatment: string;
  timestamp: number;
  synced: boolean;
}

interface WeatherData {
  timestamp: number;
  data: any;
  location: string;
}

class OfflineStorage {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = openDB('cropSaarthiDB', 1, {
      upgrade(db) {
        // Create object stores
        if (!db.objectStoreNames.contains('plantDiagnoses')) {
          const diagnosisStore = db.createObjectStore('plantDiagnoses', { keyPath: 'id', autoIncrement: true });
          diagnosisStore.createIndex('timestamp', 'timestamp');
        }
        
        if (!db.objectStoreNames.contains('weatherData')) {
          const weatherStore = db.createObjectStore('weatherData', { keyPath: 'timestamp' });
          weatherStore.createIndex('location', 'location');
        }
      }
    });
  }

  // Plant diagnosis methods
  async saveDiagnosis(diagnosis: PlantDiagnosis): Promise<number> {
    const db = await this.dbPromise;
    diagnosis.timestamp = Date.now();
    diagnosis.synced = navigator.onLine;
    return db.add('plantDiagnoses', diagnosis);
  }

  async getDiagnoses(): Promise<PlantDiagnosis[]> {
    const db = await this.dbPromise;
    return db.getAllFromIndex('plantDiagnoses', 'timestamp');
  }

  async getUnsyncedDiagnoses(): Promise<PlantDiagnosis[]> {
    const db = await this.dbPromise;
    const all = await db.getAll('plantDiagnoses');
    return all.filter(diagnosis => !diagnosis.synced);
  }

  async markAsSynced(id: number): Promise<void> {
    const db = await this.dbPromise;
    const diagnosis = await db.get('plantDiagnoses', id);
    if (diagnosis) {
      diagnosis.synced = true;
      await db.put('plantDiagnoses', diagnosis);
    }
  }

  // Weather data methods
  async saveWeatherData(weatherData: WeatherData): Promise<number> {
    const db = await this.dbPromise;
    return db.put('weatherData', weatherData);
  }

  async getLatestWeatherData(location: string): Promise<WeatherData | undefined> {
    const db = await this.dbPromise;
    const data = await db.getAllFromIndex('weatherData', 'location', location);
    return data.sort((a, b) => b.timestamp - a.timestamp)[0];
  }

  async clearOldData(): Promise<void> {
    // Remove data older than 7 days
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const db = await this.dbPromise;
    
    const diagnosisTxn = db.transaction('plantDiagnoses', 'readwrite');
    const diagnosisStore = diagnosisTxn.objectStore('plantDiagnoses');
    const diagnosisKeys = await diagnosisStore.getAllKeys();
    
    for (const key of diagnosisKeys) {
      const diagnosis = await diagnosisStore.get(key);
      if (diagnosis && diagnosis.timestamp < oneWeekAgo) {
        await diagnosisStore.delete(key);
      }
    }
    
    const weatherTxn = db.transaction('weatherData', 'readwrite');
    const weatherStore = weatherTxn.objectStore('weatherData');
    const weatherKeys = await weatherStore.getAllKeys();
    
    for (const key of weatherKeys) {
      const data = await weatherStore.get(key);
      if (data && data.timestamp < oneWeekAgo) {
        await weatherStore.delete(key);
      }
    }
  }
}

// Create a singleton instance
const offlineStorage = new OfflineStorage();
export default offlineStorage;
