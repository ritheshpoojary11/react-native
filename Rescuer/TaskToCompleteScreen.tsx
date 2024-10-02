import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal, TextInput, Linking, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // For back arrow navigation
import { database, ref, onValue, update } from '../firebaseConfig'; // Firebase config
import { Ionicons } from '@expo/vector-icons'; // For back arrow icon
import { Picker } from '@react-native-picker/picker'; // For dropdown

const SkeletonLoader = () => (
  <View style={styles.card}>
    <View style={styles.skeletonText}></View>
    <View style={styles.skeletonText}></View>
    <View style={styles.skeletonText}></View>
    <View style={styles.skeletonButton}></View>
  </View>
);

const TaskToCompleteScreen = () => {
  const navigation = useNavigation();
  const [pendingRescues, setPendingRescues] = useState<any[]>([]);
  const [completedRescues, setCompletedRescues] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRescue, setSelectedRescue] = useState<any>(null);
  const [commentOption, setCommentOption] = useState(''); // Dropdown value
  const [comments, setComments] = useState(''); // For "Any other issues" input
  const [activeTab, setActiveTab] = useState('Pending'); // Controls the active tab
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    const reportsRef = ref(database, 'reports');
    onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const pending = Object.keys(data)
          .filter((key) => !data[key].rescuedTime || !data[key].rescuedDate)
          .map((key) => ({ id: key, ...data[key] }));

        const completed = Object.keys(data)
          .filter((key) => data[key].rescuedTime && data[key].rescuedDate)
          .map((key) => ({ id: key, ...data[key] }));

        setPendingRescues(pending);
        setCompletedRescues(completed);
        setIsLoading(false); // Set loading to false when data is loaded
      }
    });
  }, []);

  const handleDonePress = (rescue: any) => {
    setSelectedRescue(rescue);
    setModalVisible(true);
  };

  const handleSubmit = () => {
    if (selectedRescue) {
      const currentTime = new Date().toLocaleTimeString(); // Get current time
      const currentDate = new Date().toLocaleDateString(); // Get current date

      const rescueRef = ref(database, `reports/${selectedRescue.id}`);
      update(rescueRef, {
        rescuedTime: currentTime,   // Set current time
        rescuedDate: currentDate,   // Set current date
        comments: commentOption === 'Any other issues' ? comments : commentOption // Use dropdown or text input
      })
      .then(() => {
        setModalVisible(false);     // Close modal after update
        setComments('');            // Clear the comments input
        setCommentOption('');       // Clear the picker option
      })
      .catch((error) => {
        console.error("Error updating record: ", error);
      });
    }
  };

  const openLocationInMaps = (location: string) => {
    Linking.openURL(location);
  };
  const makePhoneCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const renderRescueItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      {/* Mobile Number with clickable icon */}
      <View style={styles.mobileContainer}>
        <Text style={styles.cardText}>Mobile Number: {item.mobileNumber}</Text>
        <TouchableOpacity onPress={() => makePhoneCall(item.mobileNumber)}>
          <Ionicons name="call" size={20} color="#6200EE" style={styles.phoneIcon} />
        </TouchableOpacity>
      </View>
      <Text style={styles.cardText}>Date: {item.reportedDate}</Text>
      <Text style={styles.cardText}>Animal: {item.selectedAnimal}</Text>
      {/* Location with Open Location button */}
      <TouchableOpacity onPress={() => openLocationInMaps(item.location)}>
        <Text style={styles.openLocationText}>Open Location</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.doneButton} onPress={() => handleDonePress(item)}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCompletedRow = ({ item }: { item: any }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{item.id}</Text>
      <Text style={styles.tableCell}>{item.description}</Text>
      <Text style={styles.tableCell}>{item.rescuedTime}</Text>
      <Text style={styles.tableCell}>{item.rescuedDate}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with Back Arrow */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task To Complete</Text>
      </View>

      {/* Tab buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Pending' && styles.activeTab]}
          onPress={() => setActiveTab('Pending')}
        >
          <Text style={styles.tabText}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Completed' && styles.activeTab]}
          onPress={() => setActiveTab('Completed')}
        >
          <Text style={styles.tabText}>Completed</Text>
        </TouchableOpacity>
      </View>

      {/* Pending Tab */}
      {activeTab === 'Pending' && (
        isLoading ? (
          // Render skeleton while loading
          <FlatList
            data={[1, 2, 3, 4]} // Dummy data to show skeleton items
            renderItem={() => <SkeletonLoader />}
            keyExtractor={(item) => item.toString()}
          />
        ) : (
          <FlatList
            data={pendingRescues}
            renderItem={renderRescueItem}
            keyExtractor={(item) => item.id}
          />
        )
      )}

      {/* Completed Tab (Table Structure) */}
      {activeTab === 'Completed' && (
        <View>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Phone</Text>
            <Text style={styles.tableHeaderText}>Rescued Time</Text>
            <Text style={styles.tableHeaderText}>Rescued Date</Text>
          </View>

          <FlatList
            data={completedRescues}
            renderItem={renderCompletedRow}
            keyExtractor={(item) => item.id}
          />
        </View>
      )}

      {/* Modal for comments input */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Select Task Status</Text>
          <Picker
            selectedValue={commentOption}
            style={styles.picker}
            onValueChange={(itemValue) => setCommentOption(itemValue)}
          >
            <Picker.Item label="Select an option" value="" />
            <Picker.Item label="Task completed" value="Task completed" />
            <Picker.Item label="Task not completed" value="Task not completed" />
            <Picker.Item label="Any other issues" value="Any other issues" />
          </Picker>

          {/* Show text input if "Any other issues" is selected */}
          {commentOption === 'Any other issues' && (
            <TextInput
              style={styles.input}
              placeholder="Enter details"
              value={comments}
              onChangeText={setComments}
            />
          )}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#004D40',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  backButton: {
    marginRight: 10,
    paddingTop: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    paddingTop: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#ddd',
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  mobileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneIcon: {
    marginRight: 10,
    paddingLeft: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#004D40',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004D40',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 5,
  },
  openLocationText: {
    color: '#6200EE',
    textDecorationLine: 'underline',
  },
  doneButton: {
    backgroundColor: '#004D40',
    paddingVertical: 10,
    marginTop: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#004D40',
    padding: 10,
  },
  tableHeaderText: {
    flex: 1,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 45,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 300,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  submitButton: {
    backgroundColor: '#004D40',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  skeletonText: {
    width: '90%',
    height: 15,
    backgroundColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  skeletonButton: {
    width: '30%',
    height: 30,
    backgroundColor: '#ccc',
    borderRadius: 5,
    marginTop: 10,
  },
});

export default TaskToCompleteScreen;
