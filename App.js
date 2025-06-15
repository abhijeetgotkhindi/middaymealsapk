import React, { useState } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import AuthContextProvider from './utils/AuthContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <PaperProvider>
      <AuthContextProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthContextProvider>
    </PaperProvider>
  );
}
