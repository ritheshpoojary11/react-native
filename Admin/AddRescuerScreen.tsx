import React, { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Location from 'expo-location';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { database, ref, set, serverTimestamp } from '../firebaseConfig';

interface AddRescuerScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddRescuerScreen'>;
  route: { params: { adminMobileNumber: string } }; // Receive admin mobile number
}


const AddRescuerScreen: React.FC<AddRescuerScreenProps> = ({ navigation, route }) => {
  const { adminMobileNumber } = route.params; // Extract admin mobile number
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [gender, setGender] = useState<string>(''); // For tracking the selected gender
  const [pincode, setPincode] = useState<string>(''); // New field for pincode
  const [address, setAddress] = useState<string>(''); // For the auto-filled address
  const [latitude, setLatitude] = useState<number | null>(null); // Latitude
  const [longitude, setLongitude] = useState<number | null>(null); // Longitude
  const [loading, setLoading] = useState<boolean>(false);
if (!adminMobileNumber) {
    Alert.alert('Error', 'Admin mobile number is undefined.');
    return;
}

  // Function to generate a random password
  const generatePassword = (): string => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  };

  // Function to fetch location based on pincode
  const fetchLocationByPincode = async (pincode: string) => {
    try {
      const geocode = await Location.geocodeAsync(pincode);
      if (geocode.length > 0) {
        const { latitude, longitude } = geocode[0];
        setLatitude(latitude);
        setLongitude(longitude);

        // Reverse geocode to get the address
        const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (reverseGeocode.length > 0) {
          const { street, city, region, postalCode, country } = reverseGeocode[0];
          const fullAddress = `${street}, ${city}, ${region}, ${postalCode}, ${country}`;
          setAddress(fullAddress);
        } else {
          Alert.alert('Error', 'Unable to retrieve the address.');
        }
      } else {
        Alert.alert('Error', 'Invalid pincode.');
      }
    } catch (error) {
      console.error('Error fetching location: ', error);
      Alert.alert('Error', 'Unable to retrieve location. Check your pincode and try again.');
    }
  };

  const handleSubmit = async () => {
    const password = generatePassword();

    if (!name || !email || !mobileNumber || !gender || !pincode || !address) {
      Alert.alert('Error', 'Please fill in all fields and ensure the address is auto-filled.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    if (!/^\d{10}$/.test(mobileNumber)) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      Alert.alert('Error', 'Please enter a valid 6-digit pincode.');
      return;
    }

    try {
      setLoading(true);
      // Generate a unique ID for the new rescuer
      const newRescuerId = new Date().getTime().toString();
      
      // Reference to the 'rescuers' node in the Firebase Realtime Database
      const rescuerRef = ref(database, `rescuers/${mobileNumber}`);

      // Save the rescuer details to the database, including the admin's mobile number
      await set(rescuerRef, {
        name,
        email,
        mobileNumber,
        gender,
        pincode,
        address,
        latitude,
        longitude,
        password, // Save generated password
        adminMobileNumber, // Include admin's mobile number
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

  // When user inputs the pincode, auto-fetch the address
  const handlePincodeChange = async (enteredPincode: string) => {
    setPincode(enteredPincode);
    if (enteredPincode.length === 6) {
      await fetchLocationByPincode(enteredPincode); // Fetch location when pincode is 6 digits
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

          <Text style={styles.label}>Pincode</Text>
          <TextInput
            style={styles.input}
            value={pincode}
            onChangeText={handlePincodeChange}
            placeholder="Enter rescuer's pincode"
            placeholderTextColor="#888888"
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={address}
            editable={false} // Make this field read-only as it gets auto-filled
            placeholder="Auto-filled address"
            placeholderTextColor="#888888"
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
    zIndex: 1,
  },
  headerContainer: {
    backgroundColor: '#004D40',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    marginLeft: 5,
  },
  submitButton: {
    backgroundColor: '#004D40',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});
