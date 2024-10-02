import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal, Platform, Linking, ScrollView } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import * as IntentLauncher from 'expo-intent-launcher';
import { database, ref, onValue } from '../firebaseConfig';

const ReportsScreen: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [downloadHistoryVisible, setDownloadHistoryVisible] = useState(false);
  const [downloadedFiles, setDownloadedFiles] = useState<string[]>([]);

  // Fetch data from Firebase
  useEffect(() => {
    const dataRef = ref(database, 'reports'); // Adjust the path as needed

    const unsubscribe = onValue(dataRef, (snapshot) => {
      const fetchedData = snapshot.val();
      if (fetchedData) {
        const reportsArray = Object.keys(fetchedData).map(key => ({
          id: key,
          ...fetchedData[key]
        }));
        setData(reportsArray);
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  useEffect(() => {
    // Apply filter based on the selected month
    let filtered = data;

    if (selectedMonth !== 'All') {
      filtered = filtered.filter(item => new Date(item.reportedDate).getMonth() + 1 === parseInt(selectedMonth));
    }

    setFilteredData(filtered);
  }, [selectedMonth, data]);

  // Handle download functionality
  const handleDownload = async () => {
    try {
      const reportContent = filteredData
        .map((item) => `Rescue Report\nLocation: ${item.location}\nMobile Number: ${item.mobileNumber}\nReported Date: ${item.reportedDate}\n` +
          `Reported Time: ${item.reportedTime}\nSelected Animal: ${item.selectedAnimal}\nAssigned Rescuer: ${item.assignedRescuerMobileNumber}\n`)
        .join('\n');
      const fileName = `Rescue_Reports_${new Date().toISOString()}.txt`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, reportContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      setDownloadedFiles(prev => [...prev, fileUri]); // Store file URI in download history

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Download Complete',
          body: 'Tap to open the report.',
          data: { fileUri }, // Attach file URI to notification data
        },
        trigger: null,
      });

      Alert.alert('Download', 'The report has been downloaded. Please check your notifications to open it.');
    } catch (error) {
      console.error('Error downloading the report:', error);
      Alert.alert('Error', 'Failed to download the report.');
    }
  };

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { fileUri } = response.notification.request.content.data as { fileUri: string };
      if (fileUri) {
        openFile(fileUri);
      }
    });

    return () => subscription.remove();
  }, []);

  const openFile = async (fileUri: string) => {
    try {
      if (Platform.OS === 'android') {
        const contentUri = await FileSystem.getContentUriAsync(fileUri);
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
        });
      } else {
        // Add iOS implementation or fallback for sharing
      }
    } catch (error) {
      console.error('Error opening the file:', error);
      Alert.alert('Error', 'Failed to open the file.');
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Rescue Reports</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.filterButton} onPress={() => setFilterVisible(true)}>
            <MaterialIcons name="filter-list" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} onPress={() => setDownloadHistoryVisible(true)}>
            <MaterialIcons name="folder" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal={true}>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerText}>Location</Text>
            <Text style={styles.headerText}>Mobile Number</Text>
            <Text style={styles.headerText}>Reported Date</Text>
            <Text style={styles.headerText}>Reported Time</Text>
            <Text style={styles.headerText}>Selected Animal</Text>
            <Text style={styles.headerText}>Assigned Rescuer</Text>
            <Text style={styles.headerText}>Rescued Time</Text>
          </View>

          {paginatedData.map(item => (
            <View key={item.id} style={styles.tableRow}>
              <TouchableOpacity onPress={() => Linking.openURL(item.location)}>
                <Text style={[styles.rowText, { color: 'blue' }]}>Open Location</Text>
              </TouchableOpacity>
              <Text style={styles.rowText}>{item.mobileNumber}</Text>
              <Text style={styles.rowText}>{item.reportedDate}</Text>
              <Text style={styles.rowText}>{item.reportedTime}</Text>
              <Text style={styles.rowText}>{item.selectedAnimal}</Text>
              <Text style={styles.rowText}>{item.assignedRescuerMobileNumber || 'Unassigned'}</Text>
              <Text style={styles.rowText}>{item.rescuedTime || 'Not yet rescued'}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.paginationContainer}>
        <TouchableOpacity
          onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
        >
          <Text style={styles.paginationText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setCurrentPage((prev) => (endIndex < filteredData.length ? prev + 1 : prev))}
          disabled={endIndex >= filteredData.length}
          style={[styles.paginationButton, endIndex >= filteredData.length && styles.disabledButton]}
        >
          <Text style={styles.paginationText}>Next</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
        <Text style={styles.downloadButtonText}>Download All Reports</Text>
      </TouchableOpacity>

      {/* Filter Modal */}
      <Modal visible={filterVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Month</Text>

            <Picker
              selectedValue={selectedMonth}
              onValueChange={(itemValue) => setSelectedMonth(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="All" value="All" />
              <Picker.Item label="January" value="1" />
              <Picker.Item label="February" value="2" />
              <Picker.Item label="March" value="3" />
              <Picker.Item label="April" value="4" />
              <Picker.Item label="May" value="5" />
              <Picker.Item label="June" value="6" />
              <Picker.Item label="July" value="7" />
              <Picker.Item label="August" value="8" />
              <Picker.Item label="September" value="9" />
              <Picker.Item label="October" value="10" />
              <Picker.Item label="November" value="11" />
              <Picker.Item label="December" value="12" />
            </Picker>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setFilterVisible(false)}>
                <Text style={styles.modalButtonText}>Apply</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setFilterVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Download History Modal */}
      <Modal visible={downloadHistoryVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Download History</Text>
            {downloadedFiles.map((fileUri, index) => (
              <TouchableOpacity key={index} onPress={() => openFile(fileUri)}>
                <Text style={styles.downloadHistoryItem}>Report {index + 1}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalButton} onPress={() => setDownloadHistoryVisible(false)}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  filterButton: {
    marginLeft: 8,
    padding: 8,
    backgroundColor: '#004D40',
    borderRadius: 4,
  },
  tableContainer: {
    flexDirection: 'column',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    padding: 8,
  },
  headerText: {
    fontWeight: 'bold',
    width: 120, // Adjust as needed for column width
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  rowText: {
    width: 120, // Adjust as needed for column width
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  paginationButton: {
    padding: 10,
    backgroundColor: '#004D40',
    borderRadius: 4,
    marginHorizontal: 8,
  },
  paginationText: {
    color: '#fff',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  downloadButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#004D40',
    borderRadius: 4,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    padding: 10,
    backgroundColor: '#004D40',
    borderRadius: 4,
    width: '48%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
  },
  downloadHistoryItem: {
    padding: 8,
    fontSize: 16,
    color: '#004D40',
  },
});

export default ReportsScreen;
