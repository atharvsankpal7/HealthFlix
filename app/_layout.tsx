import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts(Ionicons.font);

  useEffect(() => {
    if (error) {
      console.error('Error loading fonts:', error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Hide splash screen once fonts are loaded
      const hideSplash = async () => {
        try {
          await SplashScreen.hideAsync();
          window.frameworkReady?.();
        } catch (e) {
          // Ignore error
        }
      };

      hideSplash();
    }
  }, [loaded]);

  // Don't render anything until fonts are loaded
  if (!loaded) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            animation: 'none',
          }}
        />
        <Stack.Screen
          name="+not-found"
          options={{
            title: 'Oops!',
            animation: 'none',
          }}
        />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
