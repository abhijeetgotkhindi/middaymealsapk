import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

const getPadding = () => (width > 400 ? 14 : 12);

const DashboardLabel = ({ icon, label, value, color }) => {
  return (
    <View style={[styles.card, { backgroundColor: color || '#4F8EF7' }]}>
      <View style={styles.iconWrapper}>
        <Icon name={icon} size={26} color="#fff" />
      </View>
      <View style={styles.textWrapper}>
        <Text style={styles.value}>{value ?? 0}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width * 0.25,
    borderRadius: 16,
    padding: getPadding(),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    margin: width * 0.015,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  iconWrapper: {
    marginBottom: 6,
  },
  textWrapper: {
    alignItems: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  label: {
    fontSize: 13,
    color: '#f0f0f0',
    marginTop: 2,
  },
});

export default DashboardLabel;
