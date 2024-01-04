import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Image, Switch } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import TouchID from 'react-native-touch-id';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthScreen = ({ navigation }) => {
  const [authenticationError, setAuthenticationError] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [usernameErrorText, setUsernameErrorText] = useState('Please enter an email');
  const [passwordErrorText, setPasswordErrorText] = useState('Please enter a password');
  const [rememberMe, setRememberMe] = useState(false);

  const [storedToken, setStoredToken] = useState(null);

  useEffect(() => {
    retrieveStoredToken();
  }, []);

  const retrieveStoredToken = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      setStoredToken(token);
      
      if (token) {
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
  };

  const saveToken = async (token) => {
    try {
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  };

  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    if (username.trim() === '') {
      setUsernameErrorText('Please enter an email');
      return;
    }
  
    if (!isEmailValid(username)) {
      setUsernameErrorText('Invalid email');
      return;
    }
  
    if (password.trim() === '') {
      setPasswordErrorText('Please enter a password');
      return;
    }
  
    setUsernameErrorText('');
    setPasswordErrorText('');
  
    try {
      const response = await axios.post('https://ehr.mediremote.com/rpmapi/api/account/login', {
        username: username,
        password: password,
      });
  
      if (response.data.message === 'successfull') {
        
        const authToken = response.data.result.token;

  
        if (authToken) {
          saveToken(authToken);
          Alert.alert('Login Successful');
          navigation.navigate('Home');
        } else {
          console.error('Invalid token received from the server:', response.data);
          Alert.alert('Login Failed', 'Invalid token received from the server');
        }
      } else {
        console.error('Login failed:', response.data);
        Alert.alert('Login Failed', 'Authentication failed');
      }
    } catch (error) {
      
      Alert.alert('Login Failed', 'An error occurred during login. Please try again.');
    }
  };
  

  const authenticateWithTouchID = async () => {
    try {
      const optionalConfigObject = {
        title: 'Authentication Required',
        unifiedErrors: false,
        passcodeFallback: false,
      };
  
      const touchIdConfig = {
        unifiedErrors: false,
        passcodeFallback: false,
      };
  
      const isFingerprintSupported = await TouchID.isSupported(touchIdConfig);
  
      if (isFingerprintSupported) {
        const success = await TouchID.authenticate('Authenticate using Touch ID', optionalConfigObject);
  
        if (success) {
          
          if (storedToken) {
            
            Alert.alert('Authentication Successful');
            
            
            navigation.navigate('Home');
          } else {
            
            Alert.alert('Authentication Failed', 'No stored token found');
          }
        } else {
          Alert.alert('Authentication Failed');
        }
      } else {
        Alert.alert('Fingerprint authentication is not supported on this device');
      }
    } catch (error) {
      setAuthenticationError(error.message || 'Authentication Failed');
    }
  };

  const handleFingerprintLogin = async () => {
    
    if (rememberMe) {
      
      authenticateWithTouchID();
    } else {
      Alert.alert('Fingerprint login is not enabled. Please enable it.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Login</Text>
      <View>
        <Icon name="user" size={20} color="black" style={styles.icon} />
        <TextInput
          style={[styles.input, usernameErrorText && styles.inputError]}
          placeholder="Email"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            setUsernameErrorText(
              text.trim() === '' ? 'Please enter an email' : !isEmailValid(text) ? 'Invalid email' : ''
            );
          }}
        />
      </View>
      <Text style={styles.errorMessage}>{usernameErrorText}</Text>

      <View>
        <Icon name="lock" size={20} color="black" style={styles.icon} />
        <TextInput
          style={[styles.input, passwordErrorText && styles.inputError]}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setPasswordErrorText(text.trim() === '' ? 'Please enter a password' : '');
          }}
        />
        <View style={styles.eyeIcon}>
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon name={showPassword ? 'eye-slash' : 'eye'} size={20} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.errorMessage}>{passwordErrorText}</Text>

      <TouchableOpacity onPress={handleLogin}>
        <View style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.switchContainer}>
        <Switch
          value={rememberMe}
          onValueChange={(value) => setRememberMe(value)}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={rememberMe ? '#f5dd4b' : '#f4f3f4'}
        />
        <Text style={styles.switchLabel}>Enable FingerPrint Login</Text>
      </View>

      {authenticationError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{authenticationError}</Text>
        </View>
      )}

      
        <TouchableOpacity onPress={handleFingerprintLogin}>
          <Image source={require('./images/finger.jpg')} style={styles.touchIDImage} />
        </TouchableOpacity>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 50,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    width: 280,
    marginBottom: 10,
    paddingLeft: 30,
  },
  inputError: {
    borderColor: 'red',
  },
  errorMessage: {
    color: 'red',
    fontSize: 12,
    marginBottom: 5,
    alignSelf: 'flex-start',
    marginLeft: 52,
  },
  button: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'purple',
    borderRadius: 25,
    width: 280,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  icon: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  eyeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  headerText: {
    fontSize: 26,
    fontWeight: 'bold',
    bottom: 50,
    color: 'purple',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  switchLabel: {
    marginRight: 10,
    color: 'black',
  },
  touchIDImage: {
    marginTop: 10,
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
});

export default AuthScreen;
