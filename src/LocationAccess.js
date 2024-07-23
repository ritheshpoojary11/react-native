// LocationAccess.js
import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { insertLocation } from './database'; // Import the insertLocation function

const LocationAccess = ({ route }) => {
  const { mobileNumber } = route.params;
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [url, setUrl] = useState(null);

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Request location with high accuracy (GPS)
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(location);
    };

    getLocation();
  }, []);

  useEffect(() => {
    if (location) {
      const url = `https://www.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}`;
      setUrl(url);
      // Store location and mobile number in the database
      insertLocation(mobileNumber, url);
    } else if (errorMsg) {
      Alert.alert("Error", errorMsg);
    }
  }, [location, errorMsg]);

  return (
    <View style={styles.container}>
      
      {location && (
        <Text style={styles.text}>
          Mobile Number: {mobileNumber}{'\n'}
          URL:
          <TouchableOpacity onPress={() => Linking.openURL(url)}>
            <Text style={styles.link}>{url}</Text>
          </TouchableOpacity>
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 20,
    fontSize: 16,
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
});

export default LocationAccess;
