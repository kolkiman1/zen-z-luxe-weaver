import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.68b2589e22af459fa3d4530759fa24fe',
  appName: 'Gen-Zee Admin',
  webDir: 'dist',
  server: {
    url: 'https://68b2589e-22af-459f-a3d4-530759fa24fe.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: true,
      spinnerColor: '#d4af37'
    },
    StatusBar: {
      style: 'dark'
    }
  }
};

export default config;