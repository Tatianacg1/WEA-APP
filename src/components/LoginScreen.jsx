import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { fetchSignIn } from '../api/loginService';
import styles from '../styles/loginStyles';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      const response = await fetchSignIn(email, password);
      const token = response.data;
      navigation.navigate('EventsScreen', { token });
    } catch (error) {
        Alert.alert('Error', 'Incorrect email or password')
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: 'https://worldeventaccess.com/media/logos/logo.png' }} style={styles.logo} />
      <Text style={styles.title}>Sign In To Events Management System</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;