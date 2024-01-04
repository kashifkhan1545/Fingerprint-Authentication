import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      
      await AsyncStorage.removeItem('authToken');

      
      navigation.reset({
        index: 0,
        routes: [{ name: 'Authenticate' }],
      });

      Alert.alert('Logout Successful');
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Logout Failed', 'An error occurred during logout. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Home</Text>
      
      
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: 'purple',
    padding: 10,
    borderRadius: 10,
    width: 200,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign:'center'
  },
});

export default HomeScreen;
