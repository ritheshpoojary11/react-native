import React, { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  TextInput,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { database, ref, set, serverTimestamp  } from '../firebaseConfig';

interface AddRescuerScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddRescuerScreen'>;
}

const AddRescuerScreen: React.FC<AddRescuerScreenProps> = ({ navigation }) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [gender, setGender] = useState<string>(''); // For tracking the selected gender
  const [loading, setLoading] = useState<boolean>(false);

  const handleBlur = () => {
    Keyboard.dismiss(); // Hide the keyboard when input loses focus
  };

  const handleSubmit = async () => {
    if (!name || !email || !mobileNumber || !gender) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      // Generate a unique ID for the new rescuer
      const newRescuerId = new Date().getTime().toString();
      
      // Reference to the 'rescuers' node in the Firebase Realtime Database
      const rescuerRef = ref(database, `rescuers/${mobileNumber}`);

      // Save the rescuer details to the database
      await set(rescuerRef, {
        name,
        email,
        mobileNumber,
        gender,
        timestamp: serverTimestamp(),  // Store timestamp when the rescuer is added
      });

      Alert.alert('Success', 'Rescuer has been added successfully.');
      navigation.goBack();  // Navigate back after submission
    } catch (error) {
      console.error('Error adding rescuer: ', error);
      Alert.alert('Error', 'Failed to add rescuer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Add Rescuer</Text>
      </View>

      <View style={styles.container1}>
        <Text style={styles.title}>Add Rescuer</Text>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter rescuer's name"
            placeholderTextColor="#888888"
          />
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter rescuer's email"
            placeholderTextColor="#888888"
            keyboardType="email-address"
          />
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={mobileNumber}
            onChangeText={setMobileNumber}
            placeholder="Enter rescuer's phone number"
            placeholderTextColor="#888888"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setGender('Male')}>
              <Icon
                name={gender === 'Male' ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={24}
                color="#004D40"
              />
              <Text style={styles.radioText}>Male</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setGender('Female')}>
              <Icon
                name={gender === 'Female' ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={24}
                color="#004D40"
              />
              <Text style={styles.radioText}>Female</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Add Rescuer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AddRescuerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container1: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40, // Adjust the top value to fit your design
    left: 10, // Adjust the left value to fit your design
    zIndex: 10,
    padding: 10,
  },
  headerContainer: {
    padding: 20,
    backgroundColor: '#004D40',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'CustomFont',
  },
  formContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
    color: '#888888',
    marginBottom: 5,
    fontFamily: 'CustomFont',
  },
  input: {
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontFamily: 'CustomFont',
    color: '#000000',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    marginLeft: 5,
    fontSize: 18,
    color: '#888888',
  },
  submitButton: {
    marginTop: 30,
    backgroundColor: '#004D40',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'CustomFont',
  },
});
