// HomeScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation }) => {
  const [mobileNumber, setMobileNumber] = useState('');

  const handleSubmit = () => {
    if (mobileNumber) {
      navigation.navigate('LocationAccess', { mobileNumber });
    } else {
      Alert.alert('Error', 'Please enter a mobile number');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter Mobile Number:</Text>
      <TextInput
        style={styles.input}
        keyboardType="phone-pad"
        value={mobileNumber}
        onChangeText={setMobileNumber}
      />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  label: {
    marginBottom: 10,
    fontSize: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
});

export default HomeScreen;
