import React, { useContext } from 'react';
import { Appbar } from 'react-native-paper';
import { AuthContext } from '../utils/AuthContext';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function Header({ pageTitle }) {
  const { logout } = useContext(AuthContext);

  return (
    <>
      <Appbar.Header style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo.png')} // ✅ Confirm path
            style={styles.logo}
            resizeMode="contain"
          />
          {/* <Text style={styles.titleText}>Mid Day Meals</Text> */}
        </View>
        <Appbar.Action icon="logout" color="#fff" size={26} onPress={logout} />
      </Appbar.Header>

      <View style={styles.pageTitleSection}>
        <Text style={styles.pageTitleText}>{pageTitle ?? ''}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#4F8EF7',
    elevation: 4, // shadow on Android
    shadowColor: '#000', // shadow on iOS
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    // width: 36,
    // height: 36,
    marginLeft: 10,
    marginRight: 8,
  },
  titleText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  pageTitleSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f0f2f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  pageTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});
