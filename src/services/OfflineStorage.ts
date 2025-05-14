
// Create a wrapper around IndexedDB for offline storage of data
import { openDB, DBSchema } from 'idb';

// Define interfaces for our data types
interface Diagnosis {
  id?: number;
  imageUrl: string;
  disease: string;
  confidence: number;
  treatment: string;
  timestamp: number;
  synced: boolean;
  location?: string;
}

// Define the database schema
interface CropSaarthiDB extends DBSchema {
  diagnoses: {
    key: number;
    value: Diagnosis;
    indexes: { 'by-timestamp': number };
  };
}

// Create a single instance of the database
const dbPromise = openDB<CropSaarthiDB>('crop-saarthi-db', 1, {
  upgrade(db) {
    // Create a store for crop diagnoses
    const diagnosisStore = db.createObjectStore('diagnoses', {
      keyPath: 'id',
      autoIncrement: true,
    });
    
    // Create an index for timestamp-based queries
    diagnosisStore.createIndex('by-timestamp', 'timestamp');
  },
});

// Export a singleton object with methods to interact with IndexedDB
const offlineStorage = {
  // Save a new diagnosis to IndexedDB
  async saveDiagnosis(diagnosis: Omit<Diagnosis, 'id'>): Promise<number> {
    const db = await dbPromise;
    const tx = db.transaction('diagnoses', 'readwrite');
    const store = tx.objectStore('diagnoses');
    
    const id = await store.add(diagnosis);
    await tx.done;
    
    return id as number;
  },
  
  // Get all stored diagnoses
  async getAllDiagnoses(): Promise<Diagnosis[]> {
    const db = await dbPromise;
    return db.getAllFromIndex('diagnoses', 'by-timestamp');
  },
  
  // Get a diagnosis by its ID
  async getDiagnosis(id: number): Promise<Diagnosis | undefined> {
    const db = await dbPromise;
    return db.get('diagnoses', id);
  },
  
  // Delete a diagnosis by its ID
  async deleteDiagnosis(id: number): Promise<void> {
    const db = await dbPromise;
    await db.delete('diagnoses', id);
  },
  
  // Update a diagnosis's sync status
  async updateSyncStatus(id: number, synced: boolean): Promise<void> {
    const db = await dbPromise;
    const tx = db.transaction('diagnoses', 'readwrite');
    const store = tx.objectStore('diagnoses');
    
    const diagnosis = await store.get(id);
    if (diagnosis) {
      diagnosis.synced = synced;
      await store.put(diagnosis);
    }
    
    await tx.done;
  },
  
  // Get all unsynced diagnoses
  async getUnsyncedDiagnoses(): Promise<Diagnosis[]> {
    const db = await dbPromise;
    const diagnoses = await db.getAllFromIndex('diagnoses', 'by-timestamp');
    return diagnoses.filter(diagnosis => !diagnosis.synced);
  },
};

export default offlineStorage;
