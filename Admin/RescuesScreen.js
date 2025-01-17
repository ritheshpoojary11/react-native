import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, FlatList, ScrollView, TouchableOpacity, Modal, Linking } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { database, ref, onValue, update } from '../firebaseConfig';

const SkeletonLoader = () => (
  <View style={styles.skeletonRow}>
    <View style={styles.skeletonCell} />
    <View style={styles.skeletonCell} />
    <View style={styles.skeletonCell} />
    <View style={styles.skeletonCell} />
  </View>
);

const CompletedTab = () => {
  const [completedRescues, setCompletedRescues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reportsRef = ref(database, 'reports');
    onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const completed = Object.keys(data)
          .filter((key) => data[key].rescuedTime !== '' && data[key].reportedDate !== '')
          .map((key) => ({ id: key, ...data[key] }));
        setCompletedRescues(completed);
      }
      setLoading(false);
    });
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView horizontal>
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.headerCell]}>Mobile Number</Text>
            <Text style={[styles.headerText, styles.headerCell]}>Reported Date</Text>
            <Text style={[styles.headerText, styles.headerCell]}>Rescued Time</Text>
            <Text style={[styles.headerText, styles.headerCell]}>Assigned Rescuer</Text>
          </View>

          {loading ? (
            Array(4).fill(0).map((_, index) => <SkeletonLoader key={index} />)
          ) : (
            <FlatList
              data={completedRescues}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.tableRow}>
                  <Text style={[styles.rowText, styles.cell]}>{item.mobileNumber}</Text>
                  <Text style={[styles.rowText, styles.cell]}>{item.reportedDate}</Text>
                  <Text style={[styles.rowText, styles.cell]}>{item.rescuedTime}</Text>
                  <Text style={[styles.rowText, styles.cell]}>{item.assignedRescuerMobileNumber}</Text>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const PendingTab = () => {
  const [pendingRescues, setPendingRescues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reportsRef = ref(database, 'reports');
    onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const pending = Object.keys(data)
          .filter((key) => data[key].rescuedTime === '' && data[key].assignedRescuerMobileNumber !== '')
          .map((key) => ({ id: key, ...data[key] }));
        setPendingRescues(pending);
      }
      setLoading(false);
    });
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView horizontal>
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.headerCell]}>Mobile Number</Text>
            <Text style={[styles.headerText, styles.headerCell]}>Reported Date</Text>
            <Text style={[styles.headerText, styles.headerCell]}>Assigned Rescuer</Text>
          </View>

          {loading ? (
            Array(4).fill(0).map((_, index) => <SkeletonLoader key={index} />)
          ) : (
            <FlatList
              data={pendingRescues}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.tableRow}>
                  <Text style={[styles.rowText, styles.cell]}>{item.mobileNumber}</Text>
                  <Text style={[styles.rowText, styles.cell]}>{item.reportedDate}</Text>
                  <Text style={[styles.rowText, styles.cell]}>{item.assignedRescuerMobileNumber}</Text>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const UnassignedTab = () => {
  const [unassignedRescues, setUnassignedRescues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [rescuers, setRescuers] = useState([]);

  useEffect(() => {
    const reportsRef = ref(database, 'reports');
    onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const unassigned = Object.keys(data)
          .filter((key) => data[key].assignedRescuerMobileNumber === '')
          .map((key) => ({ id: key, ...data[key] }));
        setUnassignedRescues(unassigned);
      }
      setLoading(false);
    });
  }, []);

  const fetchRescuers = () => {
    const rescuersRef = ref(database, 'rescuers');
    onValue(rescuersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const rescuerList = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        setRescuers(rescuerList);
      }
    });
  };

  const handleAssign = (reportId) => {
    setSelectedReportId(reportId);
    fetchRescuers();
    setModalVisible(true);
  };

  const assignRescuer = (rescuerMobileNumber) => {
    if (!selectedReportId || !rescuerMobileNumber) return;
    const reportRef = ref(database, `reports/${selectedReportId}`);
    update(reportRef, { assignedRescuerMobileNumber: rescuerMobileNumber })
      .then(() => {
        alert(`Assigned rescuer with mobile: ${rescuerMobileNumber}`);
        setModalVisible(false);
        setSelectedReportId(null);
      })
      .catch((error) => {
        alert("Failed to assign rescuer. Please try again.");
        console.error("Error updating report:", error);
      });
  };
  

  return (
    <View style={styles.container}>
      <ScrollView horizontal>
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.headerCell]}>Mobile Number</Text>
            <Text style={[styles.headerText, styles.headerCell]}>Reported Date</Text>
            <Text style={[styles.headerText, styles.headerCell]}>Location</Text>
            <Text style={[styles.headerText, styles.headerCell]}>Action</Text>
          </View>

          {loading ? (
            Array(4).fill(0).map((_, index) => <SkeletonLoader key={index} />)
          ) : (
            <FlatList
              data={unassignedRescues}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.tableRow}>
                  <Text style={[styles.rowText, styles.cell]}>{item.mobileNumber}</Text>
                  <Text style={[styles.rowText, styles.cell]}>{item.reportedDate}</Text>
                  <TouchableOpacity onPress={() => Linking.openURL(item.location)}>
                    <Text style={[styles.rowText, { color: 'blue' }]}>Open Location</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.assignButton}
                    onPress={() => handleAssign(item.id)}
                  >
                    <Text style={styles.assignButtonText}>Assign</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Rescuer</Text>
            <FlatList
              data={rescuers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.rescuerButton}
                  onPress={() => assignRescuer(item.mobileNumber)}
                >
                  <Text style={styles.rescuerText}>{item.name} ({item.mobileNumber})</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const RescuesScreen = ({ navigation }) => {
  const [index, setIndex] = useState(0);
  const routes = [
    { key: 'completed', title: 'Completed' },
    { key: 'pending', title: 'Pending' },
    { key: 'unassigned', title: 'Unassigned' },
  ];

  const renderScene = SceneMap({
    completed: CompletedTab,
    pending: PendingTab,
    unassigned: UnassignedTab,
  });

  return (
    <View style={styles.screenContainer}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: 400 }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: '#004D40' }}
            style={{ backgroundColor: '#004D40' }}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: { 
    flex: 1, 
    paddingTop: 10, // Add space at the top
    backgroundColor: '#F5F5F5' // Optional: Set a background color to enhance visual separation
  },
  container: { flex: 1, paddingTop: 0 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#004D40', padding: 10 },
  headerText: { color: '#fff', fontWeight: 'bold' },
  headerCell: { width: 120, textAlign: 'center' },
  tableRow: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderColor: '#ccc' },
  rowText: { textAlign: 'center' },
  cell: { width: 120 },
  assignButton: { backgroundColor: '#004D40', padding: 8, borderRadius: 5 },
  assignButtonText: { color: '#fff', fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { margin: 20, padding: 20, backgroundColor: 'white', borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  rescuerButton: { paddingVertical: 10, width: '100%', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ccc' },
  rescuerText: { fontSize: 16, color: '#004D40' },
  closeButton: { marginTop: 20, color: '#004D40', fontSize: 16},
  skeletonRow: { flexDirection: 'row', padding: 10 },
  skeletonCell: { width: 120, height: 20, backgroundColor: '#ccc', marginRight: 10, borderRadius: 5 },
});

export default RescuesScreen;
