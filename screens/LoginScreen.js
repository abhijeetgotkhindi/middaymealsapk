import React, { useState, useContext } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { AuthContext } from '../utils/AuthContext';
import useApi from '../utils/api';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const { request } = useApi();

    const handleLogin = async () => {
        try {
            const result = await request({
                method: 'POST',
                url: 'auth/login',  // Automatically added to baseURL
                body: { username, password }
            });
            setMessageType('success');
            setMessage('Login successful!');
            login(result.user, result.token); // Assuming API response is { user, token }
        } catch (err) {
            setMessageType('error');
            setMessage('Invalid username or password');
        }
    };

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../assets/logo.png')} // <-- Replace with your logo path
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.title}>MID DAY MEALS</Text>

                        {message ? (
                            <Text style={[styles.message, messageType === 'error' ? styles.error : styles.success]}>
                                {message}
                            </Text>
                        ) : null}
                    </View>

                    <TextInput
                        label="Username"
                        value={username}
                        onChangeText={setUsername}
                        mode="outlined"
                        style={styles.input}
                    />

                    <TextInput
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        mode="outlined"
                        style={styles.input}
                    />

                    <Button mode="contained" onPress={handleLogin} style={styles.button}>
                        Login
                    </Button>
                </Card.Content>
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f4f8',
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        padding: 10,
        borderRadius: 8,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        marginTop: 20,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4a2e00',
    },
    input: {
        marginBottom: 16,
        backgroundColor: '#eaf1ff',
    },
    button: {
        marginTop: 10,
        backgroundColor: '#007bdb',
    },
    message: { marginTop: 15, textAlign: 'center' },
    error: { color: 'red' },
    success: { color: 'green' }
});
