import React from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';


type DosAndDontsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DosAndDontsScreen'
>;

interface DosAndDontsScreenProps {
  navigation: DosAndDontsScreenNavigationProp;
}

const DosAndDontsScreen: React.FC<DosAndDontsScreenProps> = ({ navigation }) => {

  const handleGoBack = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Dos and Don'ts</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dos</Text>
          <Text style={styles.sectionText}>• Do ensure you report any wildlife sightings immediately.</Text>
          <Text style={styles.sectionText}>• Do provide accurate location details when reporting.</Text>
          <Text style={styles.sectionText}>• Do keep calm and stay safe when encountering wildlife.</Text>
          {/* Add more items as needed */}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Don'ts</Text>
          <Text style={styles.sectionText}>• Don’t approach or attempt to capture wildlife.</Text>
          <Text style={styles.sectionText}>• Don’t share your personal information unnecessarily.</Text>
          <Text style={styles.sectionText}>• Don’t ignore safety guidelines when in the vicinity of wildlife.</Text>
          {/* Add more items as needed */}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 10,
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
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default DosAndDontsScreen;
