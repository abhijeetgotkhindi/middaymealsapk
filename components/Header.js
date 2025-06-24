import React, { useContext } from 'react';
import { Appbar } from 'react-native-paper';
import { AuthContext } from '../utils/AuthContext';
import { View, Text, StyleSheet } from 'react-native';

export default function Header({ pageTitle }) {
  const { logout } = useContext(AuthContext);
  return (
    <>
      <Appbar.Header style={{ backgroundColor: '#4F8EF7' }}>
        <Appbar.Content title="Mid Day Meals" titleStyle={{
          color: '#fff', fontSize: 21, fontStyle: 'italic',
          fontWeight: 'bold', fontFamily: 'sans-serif-medium'
        }} />
        <Appbar.Action icon="logout" color="#fff" fontSize="28" onPress={logout} />
      </Appbar.Header>
      <View style={styles.searchSection}>
        <View style={styles.innerBody}>
          <View style={styles.headerContainer}>
            <Text style={styles.findNearbyTitle}>{pageTitle ?? ''}</Text>
          </View>
        </View>
      </View>
    </>
  );
}


const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',      // side-by-side
    alignItems: 'center',      // vertically centered
    justifyContent: 'center', // space between text & button
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingBottom: 4
  },
  findNearbyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: '3%',
    marginTop: '2%'
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  innerBody: {
    backgroundColor: 'lightgray',
    borderRadius: 10
  },
});
