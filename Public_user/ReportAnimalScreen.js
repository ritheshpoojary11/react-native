import React, { useState, useEffect } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ficon from 'react-native-vector-icons/FontAwesome';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import CustomAlertMessage from './CustomAlertMessage';
import { database, ref, set, serverTimestamp, onValue } from '../firebaseConfig';

const animalOptions = [
  { label: 'Leopard', value: 'leopard', image: require('../assets/leopard.png') },
  { label: 'Gaur', value: 'Gaur', image: require('../assets/gaur.png') },
  { label: 'Wildboar', value: 'Wildboar', image: require('../assets/wildboar.png') },
  { label: 'Snake', value: 'snake', image: require('../assets/snake.png') },
  { label: 'Sea Bird', value: 'Sea Bird', image: require('../assets/Sea_Birds.png') },
  { label: 'Sea Turtle', value: 'Sea Turtle', image: require('../assets/Turtles.png') },
  { label: 'Crocodile', value: 'Crocodile', image: require('../assets/Crocodiles.png') },
  { label: 'Dolphins', value: 'Dolphins', image: require('../assets/dolphins.png') },
  { label: 'Whales', value: 'Whales', image: require('../assets/whales.png') },
];

const ReportAnimalScreen = ({ navigation, route }) => {
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [mobileNumber, setMobileNumber] = useState(route.params.mobileNumber || '');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const requestNotificationPermission = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert('Permission Denied', 'Notification permissions were denied.');
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      Alert.alert('Error', 'Failed to request notification permissions.');
      return false;
    }
  };

  const handleLocationAccess = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setAlertTitle('Permission Denied');
        setAlertMessage('Permission to access location was denied');
        setAlertVisible(true);
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const locationMessage = `https://www.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}`;
      setAlertTitle('Location Accessed');
      setLocation(locationMessage);
      setAlertMessage(locationMessage);
      setAlertVisible(false);

    } catch (error) {
      setAlertTitle('Error');
      setAlertMessage('Failed to fetch location');
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Animal Reported',
        body: `You have reported a ${selectedAnimal}.`,
      },
      trigger: null,
    });
  };

  const handleSubmit = async () => {
    if (!mobileNumber || !selectedAnimal) {
      setAlertTitle('Incomplete Information');
      setAlertMessage('Please provide both the mobile number and select an animal.');
      setAlertVisible(true);
      setLoading(false);
      return;
    }

    await handleLocationAccess();

    const now = new Date();
    const reportedDate = now.toISOString().split('T')[0];
    const reportedTime = now.toTimeString().split(' ')[0];

    try {
      const reportRef = ref(database, `reports/${Date.now()}`);
      await set(reportRef, {
        mobileNumber,
        selectedAnimal,
        reportedDate,
        reportedTime,
        assignedRescuerMobileNumber: "",
        adminMobileNumber: '9606611498',
        rescuedTime: "",
        location,
        timestamp: serverTimestamp(),
      });

      let emailResponse;
      try {
        emailResponse = await fetch('http://192.168.97.89:3000/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            animal: selectedAnimal,
            mobileNumber,
          }),
        });
      } catch (error) {
        console.error('Network error while sending email:', error);
        setAlertTitle('Network Error');
        setAlertMessage('There was a network problem. Please check your internet connection and try again.');
        setAlertVisible(true);
        setLoading(false);
        return;
      }

      if (emailResponse && !emailResponse.ok) {
        console.error(`Error: Failed to send email. HTTP Status Code: ${emailResponse.status}`);
        setAlertTitle('Email Error');
        setAlertMessage('There was a problem sending the email. Please try again later.');
        setAlertVisible(true);
        setLoading(false);
        return;
      }

      const adminRef = ref(database, 'admin');
      let adminMobileNumber = '';

      onValue(adminRef, (snapshot) => {
        const adminData = snapshot.val();
        if (adminData) {
          const adminKey = Object.keys(adminData)[0];
          adminMobileNumber = `+91${adminData[adminKey].mobileNumber}`;
        }
      });

      let smsResponse;
      try {
        smsResponse = await fetch('http://192.168.97.89:3000/send-sms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: adminMobileNumber,
            message: `New report submitted for ${selectedAnimal}. Reporter Mobile: ${mobileNumber}. Location: ${location}`,
          }),
        });
      } catch (error) {
        console.error('Network error while sending SMS:', error);
        setAlertTitle('Network Error');
        setAlertMessage('There was a network problem while sending the SMS. Please check your connection and try again.');
        setAlertVisible(true);
        setLoading(false);
        return;
      }

      if (smsResponse && !smsResponse.ok) {
        console.error(`Error: Failed to send SMS. HTTP Status Code: ${smsResponse.status}`);
        setAlertTitle('SMS Error');
        setAlertMessage('There was a problem sending the SMS. Please try again later.');
        setAlertVisible(true);
        setLoading(false);
        return;
      }

      setAlertTitle('Thank you');
      setAlertMessage('Thank you for reporting the wildlife. Our rescue team will get in touch with you shortly to provide assistance.');
      setAlertVisible(true);
      setLoading(false);
      await sendNotification();

    } catch (error) {
      console.error('Error submitting report:', error);
      setAlertTitle('Network Error');
      setAlertMessage('There was a problem submitting the report. Please check your network connection and try again.');
      setAlertVisible(true);
      setLoading(false);
    }
  };

  const handleAlertConfirm = () => {
    setAlertVisible(false);
    navigation.navigate('DosAndDontsScreen');
  };

  const openLocationInMaps = () => {
    Linking.openURL(alertMessage).catch((err) => {
      setAlertTitle('Error');
      setAlertMessage('Failed to open the link');
      setAlertVisible(true);
      setLoading(false);
    });
  };

  const handleBlur = () => {
    Keyboard.dismiss();
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Report a Wildlife</Text>
      </View>

      <View style={styles.backgroundContainer} />

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Ficon name="phone" size={20} color="#004d40" style={styles.icon} />
          <TextInput
            placeholder="Mobile Number"
            keyboardType="phone-pad"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            onBlur={handleBlur} // Hide keyboard when focus is lost
            style={styles.input}
          />
        </View>

        <Text style={styles.animalSelectionText}>Select an Animal:</Text>
        <View style={styles.animalOptionsContainer}>
  {animalOptions.map((option) => (
    <TouchableOpacity
      key={option.value}
      onPress={() => setSelectedAnimal(option.value)}
      style={[
        styles.animalOption,
        selectedAnimal === option.value && styles.selectedAnimalOption,
      ]}
    >
      <Image source={option.image} style={styles.animalImage} />
      <Text style={styles.animalLabel}>{option.label}</Text>
    </TouchableOpacity>
  ))}
</View>

        {loading ? (
          <ActivityIndicator size="large" color="#004d40" />
        ) : (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        )}
      </View>

      <CustomAlertMessage
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onConfirm={handleAlertConfirm}
        
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#004d40',
  },
  backButton: {
    position: 'absolute',
    top: 55,
    left: 20,
    zIndex: 10,
  },
  headerContainer: {
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  backgroundContainer: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    top: 120,
    bottom: 0,
    left: 0,
    right: 0,
  },
  formContainer: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    color: '#004d40',
  },
  animalSelectionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  animalOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around', // Adjust spacing for the last row
  },
  animalOption: {
    alignItems: 'center',
    padding: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    marginBottom: 10,
    width: '30%', // Change width to fit 3 columns
    minWidth: 100, // Optional: Set a minimum width to ensure buttons aren't too small
  },
  selectedAnimalOption: {
    borderColor: '#004d40',
  },
  animalImage: {
    width: 70,  // Increased size for zoom effect
    height: 70, // Increased size for zoom effect
    marginBottom: 5,
  },
  animalLabel: {
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#004d40',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ReportAnimalScreen;
