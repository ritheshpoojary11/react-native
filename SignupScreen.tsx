import React, { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { database, ref, set } from './firebaseConfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types'; // Import your types

// Define the type for navigation prop
type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignupScreen'>;

interface SignupScreenProps {
  navigation: SignupScreenNavigationProp;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [mobileNumber, setMobileNumber] = useState('');

  const handleSignup = () => {
    if (!mobileNumber) {
      Alert.alert("Error", "Please enter your mobile number.");
      return;
    }

    // Store user data in Firebase
    const userRef = ref(database, `public_users/${mobileNumber}`);
    set(userRef, {
      mobileNumber,
    })
      .then(() => {
        Alert.alert("Success", "Signup successful!");
        navigation.navigate('PublicHomeScreen', { mobileNumber }); // Navigate to the public home screen
      })
      .catch((error) => {
        Alert.alert("Error", error.message);
      });
  };

  return (
    <View style={styles.container}>
      {/* Title at the top */}
      <Text style={styles.topTitle}>Sign Up</Text>

      <View style={styles.backgroundContainer} />
      <Text style={styles.title}>Create an Account</Text>

      <View style={styles.inputContainer}>
        <Icon name="phone" size={20} color="#004D40" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Enter mobile number"
          placeholderTextColor="#CCCCCC"
          keyboardType="phone-pad"
          value={mobileNumber}
          onChangeText={setMobileNumber}
        />
      </View>

      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Add a login link */}
      <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
        <Text style={styles.loginText}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#004D40',
  },
  topTitle: {
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: -100,
    fontFamily: 'CustomFont',
    paddingBottom: 0,
    marginBottom: 50,
  },
  backgroundContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '111%',
    height: '70%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 24,
    color: '#004D40',
    marginBottom: 50,
    textAlign: 'center',
    fontFamily: 'CustomFont',
    paddingTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 45,
    color: '#000',
    fontFamily: 'CustomFont',
  },
  signupButton: {
    backgroundColor: '#004D40',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 3,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'CustomFont',
  },
  loginText: {
    marginTop: 20,
    color: '#0066cc',
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontFamily: 'CustomFont',
  },
});

export default SignupScreen;
