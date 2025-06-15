// components/DashboardLabel.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

// const { width, height } = Dimensions.get('window');

// export const wp = percentage => (width * percentage) / 100;  // width percent
// export const hp = percentage => (height * percentage) / 100; // height percent
import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');
const getPadding = () => {
  return width > 400 ? 12 : 10;
};
const DashboardLabel = ({ icon, label, value, color }) => {
  return (
    <View style={[styles.card, { backgroundColor: color, margin: '5%' }]}>
      <View style={styles.textContainer}>
        <View style={styles.iconContainer}>
          <Icon name={icon} size={30} color="#fff" />
        </View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: getPadding(),
    alignItems: 'center',
    // marginVertical: 5,
    borderRadius: 10,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 15,
    justifyContent: 'center',
  },
  textContainer: {
    justifyContent: 'center',
  },
  value: {
    fontSize: 22,
    color: '#fff',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    color: '#fff',
  },
});

export default DashboardLabel;
