
class NetworkUtils {
  public isOnline(): boolean {
    return navigator.onLine;
  }

  public async checkInternetConnection(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return true;
    } catch (error) {
      console.log('No internet connection available');
      return false;
    }
  }

  public setupNetworkListeners(
    onlineCallback: () => void,
    offlineCallback: () => void
  ): () => void {
    const handleOnline = () => {
      console.log('App is online');
      onlineCallback();
    };

    const handleOffline = () => {
      console.log('App is offline');
      offlineCallback();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
}

// Create a singleton instance
const networkUtils = new NetworkUtils();
export default networkUtils;
