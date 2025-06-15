import React, { useContext } from 'react';
import { Appbar } from 'react-native-paper';
import { AuthContext } from '../utils/AuthContext';

export default function Header({ title }) {
  const { logout } = useContext(AuthContext);

  return (
    <Appbar.Header style={{ backgroundColor: '#4F8EF7' }}>
      <Appbar.Content title="Mid Day Meals" titleStyle={{ color: '#fff', fontSize: 28, fontStyle: 'italic',
 fontWeight: 'bold', fontFamily: 'sans-serif-medium' }} />
      <Appbar.Action icon="logout" color="#fff" fontSize="28" onPress={logout} />
    </Appbar.Header>
  );
}
