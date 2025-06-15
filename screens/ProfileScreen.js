import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../components/Header';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Header/>
      <Text>Welcome to the Profile!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
