import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { AuthContext } from '../utils/AuthContext';

export default function FullScreenLoader() {
  const { loading } = useContext(AuthContext);

  if (!loading) return null;

  return (
    <View style={styles.overlay}>
      <ActivityIndicator animating={true} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});
