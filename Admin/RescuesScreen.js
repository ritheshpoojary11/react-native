import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, FlatList, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ref, onValue } from '../firebaseConfig';

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

  return (
    <View style={styles.container}>
      <ScrollView horizontal>
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.headerCell]}>Mobile Number</Text>
            <Text style={[styles.headerText, styles.headerCell]}>Reported Date</Text>
            <Text style={[styles.headerText, styles.headerCell]}>Location</Text>
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
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
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

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.headerContainer}>
        <Text style={styles.headerText1}>Rescues</Text>
      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: '100%' }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={styles.tabIndicator}
            style={styles.tabBar}
            labelStyle={styles.tabLabel}
          />
        )}
      />
    </View>
  );
};

export default RescuesScreen;

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
  headerText1: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    paddingTop: 30,
  },
  tabBar: {
    backgroundColor: '#004D40',
  },
  tabIndicator: {
    backgroundColor: '#fff',
  },
  tabLabel: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#004D40',
    padding: 10,
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  rowText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
  },
  skeletonRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  skeletonCell: {
    flex: 1,
    height: 20,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
  },
});
