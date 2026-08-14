import React from 'react';
import { ActivityIndicator, Platform, StatusBar as RNStatusBar, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';

import { FONT_ASSETS, ThemeProvider, useTheme } from './src/theme';
import { AppProvider, useApp } from './src/state/AppContext';
import { Root } from './src/navigation/Root';

/** กันคอนเทนต์ทับ status bar ของ Android + ตั้งสี status bar ตามหน้าจอ */
const Chrome: React.FC = () => {
  const t = useTheme();
  const { state } = useApp();
  const onBrand = state.view === 'login' || (state.view === 'setup' && state.sso !== 'in');
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: onBrand ? '#2D6A4F' : t.colors.background,
        paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) : 0,
      }}
    >
      <StatusBar style={onBrand || t.isDark ? 'light' : 'dark'} />
      <Root />
    </View>
  );
};

export default function App(): React.ReactElement {
  const [fontsLoaded] = useFonts(FONT_ASSETS);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#2D6A4F', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AppProvider>
        <Chrome />
      </AppProvider>
    </ThemeProvider>
  );
}
