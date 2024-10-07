import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import ReportAnimalScreen from './Public_user/ReportAnimalScreen';
import ReportsScreen from './Admin/ReportsScreen';
import { View, Text, StyleSheet, Animated, TouchableWithoutFeedback, Modal, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import PublicHomeScreen from './Public_user/PublicHomeScreen';
import RescuerHomeScreen from './Rescuer/RescuerHomeScreen';
import DosAndDontsScreen from './Public_user/DosAndDontsScreen';
import AdminHomeScreen from './Admin/AdminHomeScreen';
import RescuesScreen from './Admin/RescuesScreen';
import AddRescuerScreen from './Admin/AddRescuerScreen';
import TaskToCompleteScreen from './Rescuer/TaskToCompleteScreen';
import SupAdminScreen from './Sup_admin/SupAdminScreen';
import AddAdminScreen from './Sup_admin/AddAdminScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import SplashScreen from './SplashScreen';

const Stack = createStackNavigator();

const CustomHeader = ({ navigation, options }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-200))[0];
  const slideRightAnim = useState(new Animated.Value(200))[0];

  const toggleMenu = () => {
    if (menuVisible) {
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false));
    } else {
      setMenuVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const toggleModal = () => {
    if (modalVisible) {
      Animated.timing(slideRightAnim, {
        toValue: 200,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    } else {
      setModalVisible(true);
      Animated.timing(slideRightAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleMenuItemPress = (screen) => {
    toggleMenu();
    switch (screen) {
      case 'ReportAnimalScreen':
        navigation.navigate('ReportAnimalScreen', { mobileNumber: '1234567890' });
        break;
      case 'PublicHomeScreen':
        navigation.navigate('PublicHomeScreen', { mobileNumber: '1234567890' });
        break;
      case 'RescuerHomeScreen':
        navigation.navigate('RescuerHomeScreen', { mobileNumber: '1234567890' });
        break;
      default:
        navigation.navigate(screen);
    }
  };

  return (
    <View style={styles.headerContainer}>
      <MaterialIcons
        name={menuVisible ? "close" : "menu"}
        color="#FFFFFF"
        size={27}
        onPress={toggleMenu}
      />
      <Text style={styles.headerTitle}>{options.title}</Text>
      <MaterialIcons
        name="more-vert"
        color="#FFFFFF"
        size={27}
        onPress={toggleModal}
      />

      {menuVisible && (
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}>
        <Text style={styles.menuItem} onPress={() => handleMenuItemPress('PublicHomeScreen')}>Home</Text>
        <Text style={styles.menuItem} onPress={() => handleMenuItemPress('ReportAnimalScreen')}>Report a Wildlife</Text>
      </Animated.View>

      {modalVisible && (
        <TouchableWithoutFeedback onPress={toggleModal}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View style={[styles.modalContainer, { transform: [{ translateX: slideRightAnim }] }]}>
        <TouchableOpacity onPress={() => {
          toggleModal();
          alert('Logged out');
          handleMenuItemPress('LoginScreen');
        }}>
          <Text style={styles.modalItem}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="SplashScreen" // Set SplashScreen as the initial screen
      screenOptions={({ navigation, route }) => ({
        header: () => (
          <CustomHeader
            navigation={navigation}
            options={{ title: route.name }}
          />
        ),
      })}
    >
      <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SignupScreen" component={SignupScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PublicHomeScreen" component={PublicHomeScreen} options={{ title: 'Public Home' }} />
      <Stack.Screen name="RescuerHomeScreen" component={RescuerHomeScreen} options={{ title: 'Rescuer Home' }} />
      <Stack.Screen name="AdminHomeScreen" component={AdminHomeScreen} options={{ title: 'Admin Home' }} />
      <Stack.Screen name="ReportAnimalScreen" component={ReportAnimalScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ReportsScreen" component={ReportsScreen} options={{ title: 'Reports' }} />
      <Stack.Screen name="DosAndDontsScreen" component={DosAndDontsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RescuesScreen" component={RescuesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddRescuerScreen" component={AddRescuerScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaskToCompleteScreen" component={TaskToCompleteScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SupAdminScreen" component={SupAdminScreen} options={{ title: 'Super Admin' }} />
      <Stack.Screen name="AddAdminScreen" component={AddAdminScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  </NavigationContainer>
);

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    backgroundColor: '#004D40',
    paddingBottom: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuContainer: {
    position: 'absolute',
    left: 0,
    top: 70,
    width: 200,
    backgroundColor: 'rgba(0, 77, 64, 0.9)',
    padding: 10,
    zIndex: 1,
    borderRadius: 10,
  },
  menuItem: {
    color: '#FFFFFF',
    paddingVertical: 10,
    fontSize: 18,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  modalContainer: {
    position: 'absolute',
    right: 0,
    top: 70,
    width: 200,
    backgroundColor: 'rgba(0, 77, 64, 0.9)',
    padding: 10,
    zIndex: 2,
    borderRadius: 10,
  },
  modalItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default AppNavigator;
