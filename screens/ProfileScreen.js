import React, { useContext } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Avatar,
  Text,
  Button,
  Divider,
  Card
} from 'react-native-paper';

import { AuthContext } from '../utils/AuthContext';
import Header from '../components/Header';

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);
  return (
    <View style={styles.container} >
      <Header pageTitle="Profile" />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.header}>
          <Avatar.Text label={user.displayname?.charAt(0).toUpperCase() || 'U'} size={100} />
          <Text variant="headlineMedium" style={styles.title}>{user.displayname}</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>{user.email}</Text>
        </View>
        <Card style={styles.card}>
          <Card.Title title="User Info" />
          <Card.Content>
            <Text><Text style={styles.label}>Name:</Text> {user.displayname}</Text>
            <Text><Text style={styles.label}>Email:</Text> {user.email}</Text>  
          </Card.Content>
        </Card>
        <Divider style={{ marginVertical: 20 }} />
        <Button
          mode="contained"
          onPress={logout}
          style={styles.logoutButton}
          icon="logout"
        >
          Logout
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  body: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
    justifyContent: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    marginTop: 10,
    fontSize: 24,
  },
  subtitle: {
    color: '#666',
    fontSize: 16,
  },
  label: {
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 20,
  },
  logoutButton: {
    alignSelf: 'center',
    marginTop: 10,
  },
});

