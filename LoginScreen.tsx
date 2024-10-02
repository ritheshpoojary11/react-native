import React, { useState } from 'react';
import { View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { database, ref, onValue } from './firebaseConfig';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

// Define the type for the navigation prop
type RootStackParamList = {
  SignupScreen: undefined;
  PublicHomeScreen: { mobileNumber: string };
  RescuerHomeScreen: { mobileNumber: string };
  AdminHomeScreen: { mobileNumber: string };
  // Add other screens as needed
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignupScreen'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [mobileNumber, setMobileNumber] = useState('');

  const checkUserTable = (table: string, callback: (exists: boolean, role?: string) => void) => {
    const userRef = ref(database, `${table}/${mobileNumber}`);
    onValue(userRef, (snapshot) => {
      const userData = snapshot.val();
      if (userData) {
        callback(true, table); // User exists, pass table name as role
      } else {
        callback(false);
      }
    });
  };

  const handleLogin = () => {
    if (!mobileNumber) {
      Alert.alert('Error', 'Please enter your mobile number.');
      return;
    }

    // Check the public_user table first
    checkUserTable('public_users', (exists, role) => {
      if (exists) {
        navigation.navigate('PublicHomeScreen', { mobileNumber });
      } else {
        checkUserTable('rescuers', (exists, role) => {
          if (exists) {
            navigation.navigate('RescuerHomeScreen', { mobileNumber });
          } else {
            checkUserTable('admin', (exists, role) => {
              if (exists) {
                navigation.navigate('AdminHomeScreen', { mobileNumber });
              } else {
                Alert.alert('Error', 'Mobile number not found. Please sign up.');
              }
            });
          }
        });
      }
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={styles.backgroundContainer} />
          <Text style={styles.title}>Login</Text>

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

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('SignupScreen')}>
            <Text style={styles.signupText}>Don't have an account? Sign up</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#004D40',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
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
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'CustomFont',
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
  loginButton: {
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
  signupText: {
    marginTop: 20,
    color: '#0066cc',
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontFamily: 'CustomFont',
  },
});

export default LoginScreen;
