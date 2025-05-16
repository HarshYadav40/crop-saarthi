
import { SchemeData } from '@/components/SchemeCard';

class SchemeService {
  // In a real app, this would connect to an API endpoint
  async getAllSchemes(): Promise<SchemeData[]> {
    // This simulates an API call with a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return the schemes from local storage or the mock data
        const cachedSchemes = localStorage.getItem('cached_schemes');
        if (cachedSchemes) {
          try {
            resolve(JSON.parse(cachedSchemes));
          } catch (error) {
            console.error('Error parsing cached schemes:', error);
            resolve([]);
          }
        } else {
          // In a real app, this would fetch from an API
          resolve([]);
        }
      }, 800); // Simulate network delay
    });
  }
  
  // Save schemes to local storage for offline access
  cacheSchemes(schemes: SchemeData[]): void {
    try {
      localStorage.setItem('cached_schemes', JSON.stringify(schemes));
    } catch (error) {
      console.error('Error caching schemes:', error);
    }
  }
  
  // In a real app, this would call an API to get schemes by state
  async getSchemesByState(state: string): Promise<SchemeData[]> {
    const allSchemes = await this.getAllSchemes();
    return allSchemes.filter(scheme => 
      scheme.states.includes(state) || scheme.states.includes('All India')
    );
  }
  
  // In a real app, this would call an API to get schemes by farmer category
  async getSchemesByFarmerCategory(category: string): Promise<SchemeData[]> {
    const allSchemes = await this.getAllSchemes();
    return allSchemes.filter(scheme => 
      scheme.farmerCategories.includes(category) || scheme.farmerCategories.includes('All')
    );
  }
  
  // Subscribe to notifications for new schemes
  subscribeToNotifications(topics: string[]): Promise<boolean> {
    // In a real app, this would register the device for push notifications
    return new Promise(resolve => {
      setTimeout(() => {
        // Store subscription preferences
        localStorage.setItem('scheme_notifications', JSON.stringify(topics));
        resolve(true);
      }, 500);
    });
  }
  
  // Check if notifications are enabled
  isNotificationsEnabled(): boolean {
    const subscription = localStorage.getItem('scheme_notifications');
    return subscription !== null;
  }
  
  // Get bookmarked schemes
  getBookmarkedSchemes(): string[] {
    const bookmarks = localStorage.getItem('bookmarkedSchemes');
    if (bookmarks) {
      try {
        return JSON.parse(bookmarks);
      } catch (error) {
        console.error('Error parsing bookmarked schemes:', error);
        return [];
      }
    }
    return [];
  }
  
  // Set bookmarked schemes
  setBookmarkedScheme(schemeId: string, isBookmarked: boolean): string[] {
    let bookmarks = this.getBookmarkedSchemes();
    
    if (isBookmarked && !bookmarks.includes(schemeId)) {
      bookmarks.push(schemeId);
    } else if (!isBookmarked) {
      bookmarks = bookmarks.filter(id => id !== schemeId);
    }
    
    localStorage.setItem('bookmarkedSchemes', JSON.stringify(bookmarks));
    return bookmarks;
  }
}

export default new SchemeService();
