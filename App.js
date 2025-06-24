import React, { useState } from 'react';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import AuthContextProvider from './utils/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import * as SystemUI from 'expo-system-ui';
SystemUI.setBackgroundColorAsync('#ffffff');

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    background: '#ffffff',
    text: '#000000',
  },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthContextProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthContextProvider>
    </PaperProvider>
  );
}
