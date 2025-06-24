import React, { useState, useCallback, useContext, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  KeyboardAvoidingView, Platform, FlatList, RefreshControl, TouchableOpacity
} from 'react-native';
import {
  FAB, Portal, Modal, Provider as PaperProvider, DefaultTheme,
  Button, TextInput, Checkbox, Snackbar, Card, Divider, IconButton
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Or use `react-native-vector-icons`

import { DatePickerModal, registerTranslation } from 'react-native-paper-dates';
import { Dropdown } from 'react-native-element-dropdown';
import { useFocusEffect } from '@react-navigation/native';
import { format, parse, set, isSameDay } from 'date-fns';

import Header from '../components/Header';
import { AuthContext } from '../utils/AuthContext';
import useApi from '../utils/api';

export default function IntentScreen() {
  registerTranslation('en', {
    save: 'Save',
    selectSingle: 'Select date',
    selectMultiple: 'Select dates',
    selectRange: 'Select period',
    notAccordingToDateFormat: (inputFormat) =>
      `Date format must be ${inputFormat}`,
    mustBeHigherThan: (date) => `Must be later than ${date}`,
    mustBeLowerThan: (date) => `Must be earlier than ${date}`,
    mustBeBetween: (startDate, endDate) =>
      `Must be between ${startDate} and ${endDate}`,
    dateIsDisabled: 'Date not allowed',
    invalidInputLabel: 'Invalid date',
    cancel: 'Cancel',
    clear: 'Clear',
    ok: 'OK',
    close: 'Close',
    previous: 'Previous',
    next: 'Next',
    typeInDate: 'Type in date',
    inputMode: 'Input mode',
  });
  const { user, logout } = useContext(AuthContext);
  const { request } = useApi();

  const [intentList, setIntentList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [tab, setTab] = useState('All');

  const [selected, setSelected] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, msg: '' });

  const [modalVisible, setModalVisible] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [school, setSchool] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');

  const [holidayList, setHolidayList] = useState([]);
  const [isViewMode, setIsViewMode] = useState(false);


  const [formData, setFormData] = useState({
    oid: 0,
    intentfor: new Date(),
    school: 0,
    totalpresent: 0,
    milk: 0,
    rice: 0,
    sambar: 0,
    egg: 0,
    shengachikki: 0,
    banana: 0,
    total: 0,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fetchSchools = useCallback(async () => {
    try {
      const result = await request({ method: 'GET', url: `/school/${user.school}` });
      if (result.success) {
        setSchool(result.schools.map(item => ({
          oid: item.oid.toString(),
          name: item.schoolname,
        })));
      }
    } catch (err) {
      console.error('School error:', err.message);
    }
  }, [user.school]);

  const holidayMaster = useCallback(async () => {
    try {
      const result = await request({ method: 'GET', url: `/holiday/${user.ngo}` });
      if (result.success) {
        const rawHolidays = (result.holiday.map(item => ({
          holidaydate: item.holidays,
        })));
        const holidayList = rawHolidays.map(item =>
          item.holidaydate
        );
        //
        setHolidayList(holidayList);
      }
    } catch (err) {
      //console.error('School error:', err.message);
    }
  }, [user.ngo]);


  const checkDate = (date) => {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isHoliday = holidayList.some(holiday => isSameDay(holiday, date));
    if (isWeekend || isHoliday) {
      // setSnackbar({ visible: true, msg: 'Invalid date: Holiday or Weekend' });
      alert('Invalid date: Holiday or Weekend');
      return;
    }
    handleChange('intentfor', format(date, 'yyyy-MM-dd'));
    setShowDatePicker(false);
  }

  const fetchIntents = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await request({ method: 'GET', url: `/intent/${user.ngocode}` });
      if (result.success) {
        const list = result.intent;
        setIntentList(list);
        filterByTab(tab, list);
        const selectedMap = {};
        list.forEach(item => { selectedMap[item._id] = false; });
        setSelected(selectedMap);
      }
    } catch (error) {
      !error.status ? logout() : console.error(error.message);
    }
    setRefreshing(false);
  }, [user, tab]);

  const filterByTab = (tabKey, list) => {
    if (tabKey === 'All') return setFilteredList(list);
    const filtered = list.filter(item => item.istatus === tabKey);
    setFilteredList(filtered);
  };

  const toggleItem = (id) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSelectAll = () => {
    const newSelected = {};
    if (!selectAll) {
      filteredList.forEach(i => {
        newSelected[i.oid] = true;
      });
    }
    setSelected(newSelected);
    setSelectAll(!selectAll);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Created': return { color: '#2196F3' };
      case 'Delivered': return { color: '#FF9800' };
      case 'Received': return { color: '#4CAF50' };
      default: return { color: '#757575' };
    }
  };

  const openEditModal = (item, viewOnly = false) => {
    setFormData({
      oid: item.oid?.toString() || '0',
      intentfor: new Date(parse(item.intentfor, 'EEE dd-MM-yyyy', new Date())),
      school: item.school?.toString() || '0',
      totalpresent: item.totalpresent?.toString() || '0',
      milk: item.milk?.toString() || '0',
      rice: item.rice?.toString() || '0',
      sambar: item.sambar?.toString() || '0',
      egg: item.egg?.toString() || '0',
      shengachikki: item.shengachikki?.toString() || '0',
      banana: item.banana?.toString() || '0',
      total: item.total?.toString() || '0',
    }); // or item.schoolname, depending on your Dropdown structure
    const selected = school.find(s => s.oid == item.school);
    setSelectedSchool(selected.oid || null);
    setIsViewMode(viewOnly); // <- Freeze form
    setModalVisible(true);
  };
  const renderItem = ({ item }) => (
    <Card key={item.oid} style={styles.card} mode="outlined">
      <View style={styles.cardContent}>
        {(tab === 'Created' && user.usergroup === 2) || (tab === 'Delivered' && user.usergroup === 3) ? (
          <Checkbox
            status={selected[item.oid] ? 'checked' : 'unchecked'}
            onPress={() => toggleItem(item.oid)}
          />
        ) : null}
        {/* onPress={() => openEditModal(item, true)} */}
        <TouchableOpacity style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>{item.schoolname}</Text>
            <Text style={styles.itemSubtitle}>
              <MaterialCommunityIcons name="calendar" size={14} /> {item.intentfor}
            </Text>
            <Text style={[styles.statusText, getStatusStyle(item.istatus)]}>
              <MaterialCommunityIcons name="information" size={14} /> Status: {item.istatus}
            </Text>
          </View>
        </TouchableOpacity>
        {(tab === 'Created' && user.usergroup === 2) || (tab === 'Created' && user.usergroup === 3) ? (
          <>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => openEditModal(item)}
            />
            <IconButton
              icon="eye"
              size={20}
              onPress={() => openEditModal(item, true)}
            />
          </>
        ) : <IconButton
          icon="eye"
          size={20}
          onPress={() => openEditModal(item, true)}
        />}
      </View>
    </Card>
  );

  const updateStatus = async (status) => {
    const selectedIDs = Object.entries(selected).filter(([_, val]) => val).map(([id]) => id);
    if (!selectedIDs.length) {
      return setSnackbar({ visible: true, msg: 'No items selected' });
    }
    try {
      await request({
        method: 'PUT',
        url: `/intent/${user.ngocode}/updatestatus`,
        body: { oid: selectedIDs.join(','), createdby: user.oid, istatus: status }
      });
      setSnackbar({ visible: true, msg: 'Status updated successfully' });
      fetchIntents();
    } catch (err) {
      setSnackbar({ visible: true, msg: 'Update failed' });
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSchools();
      fetchIntents();
      holidayMaster();
    }, [])
  );

  React.useEffect(() => {
    const fields = ['oid', 'milk', 'rice', 'sambar', 'egg', 'shengachikki', 'banana'];
    const sum = fields.reduce((acc, field) => acc + (parseInt(formData[field]) || 0), 0);
    setFormData(prev => ({ ...prev, total: sum.toString() }));
  }, [formData.oid, formData.milk, formData.rice, formData.sambar, formData.egg, formData.shengachikki, formData.banana]);

  const validateFormData = () => {
    const requiredFields = ['intentfor', 'school', 'totalpresent', 'milk', 'rice', 'sambar', 'egg', 'shengachikki', 'banana'];
    for (let field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        setSnackbar({ visible: true, msg: `${field} is required` });
        return false;
      }
    }

    if (!selectedSchool) {
      setSnackbar({ visible: true, msg: `School selection is required` });
      return false;
    }

    return true;
  };

  const handleSubmit = async (status) => {
    if (!validateFormData()) return;
    const payload = { ...formData, intentfor: format(formData.intentfor, 'yyyy-MM-dd'), school: selectedSchool, istatus: status, createdby: user.oid };
// alert(`/intent/${user.ngocode}/`+(formData.oid == 0 ? 'addnew' : 'update'));
    try {
      await request({
        method: (formData.oid == 0 ? 'POST' : 'PUT'),
        url: `/intent/${user.ngocode}/`+(formData.oid == 0 ? 'addnew' : 'update'),
        body: payload
      });
      setSnackbar({ visible: true, msg: 'Intent Added successfully' });
      fetchIntents();
    } catch (err) {
      setSnackbar({ visible: true, msg: 'Failed' });
    }
    handleModalClose();
  };

  const getNextValidDate = () => {
    let nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1); // Start from tomorrow
    while (
      nextDate.getDay() === 0 || // Sunday
      nextDate.getDay() === 6 || // Saturday
      holidayList.some(holiday => isSameDay(holiday, nextDate))
    ) {
      nextDate.setDate(nextDate.getDate() + 1);
    }

    return nextDate;
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setFabOpen(false);
  };

  const handleModalOpen = () => {
    setIsViewMode(false); // <- Freeze form
    setModalVisible(true);
    setFormData({
      oid: '0',
      intentfor: getNextValidDate(),
      school: '',
      totalpresent: '',
      milk: '',
      rice: '',
      sambar: '',
      egg: '',
      shengachikki: '',
      banana: '',
      total: '',
    });
    setSelectedSchool('');

  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <PaperProvider theme={DefaultTheme}>
        <Header pageTitle="Intent" />
        {/* Modal */}
        <Portal>
          <Modal visible={modalVisible} onDismiss={handleModalClose} contentContainerStyle={styles.modalContainer}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={80} // Adjust as needed
            >
              <ScrollView contentContainerStyle={{ paddingBottom: 100 * 0.5 }}>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={handleModalClose}
                  style={{ position: 'absolute', top: -12, right: -12, zIndex: 1 }}
                />
                <Text style={styles.modalTitle}>Add/Edit Intent(s)</Text>
                {isViewMode ? (
                  <TextInput
                    key='Intent For'
                    label='Intent For'
                    value={format(formData.intentfor, 'dd-MM-yyyy')}
                    style={[styles.input, { marginBottom: 0 }]}
                    mode="outlined"
                    editable={!isViewMode} // 🔒 Freeze if true
                  />
                ) : (
                  <Button mode="outlined" onPress={() => setShowDatePicker(true)}>
                    {format(formData.intentfor, 'dd-MM-yyyy')}
                  </Button>
                )}
                {showDatePicker && (
                  <DatePickerModal
                    locale="en"
                    mode="single"
                    visible
                    date={formData.intentfor}
                    onDismiss={() => setShowDatePicker(false)}
                    onConfirm={({ date }) => {
                      const correctedDate = set(date, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }); // Avoids time zone cutoff
                      checkDate(date);
                    }}
                    editable={!isViewMode} // 🔒 Freeze if true
                  />
                )}
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                  <Dropdown
                    data={school}
                    labelField="name"
                    valueField="oid"
                    placeholder="Select School"
                    value={selectedSchool}
                    onChange={item => {
                      if (!isViewMode) {
                        setSelectedSchool(item.oid);
                        handleChange('school', item.oid);
                      }
                    }}
                    style={[styles.dropdown, isViewMode && { backgroundColor: '#f0f0f0' }]}
                    disable={isViewMode}
                  />
                </KeyboardAvoidingView>

                {['totalpresent', 'milk', 'rice', 'sambar', 'egg', 'shengachikki', 'banana'].map(field => (
                  <TextInput
                    key={field}
                    label={field}
                    value={formData[field]}
                    onChangeText={text => handleChange(field, text)}
                    keyboardType="numeric"
                    style={styles.input}
                    mode="outlined"
                    editable={!isViewMode} // 🔒 Freeze if true
                  />
                ))}
                <TextInput label="Total" value={formData.total} mode="outlined" style={styles.input} editable={false} />
                {!isViewMode && (
                  <View style={styles.buttonRow}>
                    <Button onPress={handleModalClose}>Close</Button>
                    <Button onPress={() => handleSubmit(-1)}>Draft</Button>
                    <Button mode="contained" onPress={() => handleSubmit(1)}>Save</Button>
                  </View>
                )}
              </ScrollView>
            </KeyboardAvoidingView>
          </Modal>
          <Snackbar
            visible={snackbar.visible}
            onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
            duration={3000} // 3 seconds
            action={{
              label: 'OK',
              onPress: () => setSnackbar({ ...snackbar, visible: false }),
            }}
            style={{
              opacity: 1, top: 10,
              alignSelf: 'center',
              zIndex: 9999,
              elevation: 10, // for Android
              backgroundColor: '#323232',
            }}
          >
            {snackbar.msg}
          </Snackbar>
        </Portal>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {['All', 'Created', 'Delivered', 'Received'].map(tabName => (
            <Button
              key={tabName}
              mode={tab === tabName ? 'contained' : 'outlined'}
              onPress={() => {
                setTab(tabName);
                filterByTab(tabName, intentList);
                setSelected({});
                setSelectAll(false);
              }}
              style={styles.tabButton}
              labelStyle={styles.tabLabel}
            >
              {tabName}
            </Button>
          ))}
        </View>

        {/* Select All */}
        {(tab === 'Created' && user.usergroup === 2) || (tab === 'Delivered' && user.usergroup === 3) ? (
          <View style={styles.selectAllRow}>
            <Checkbox status={selectAll ? 'checked' : 'unchecked'} onPress={toggleSelectAll} />
            <Text>Select All</Text>
          </View>
        ) : null}
        {/* List */}
        <FlatList
          data={filteredList}
          keyExtractor={(item, index) => item._id?.toString() || item.oid?.toString() || index.toString()}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchIntents} />}
        />

        {/* Bulk Action Button */}
        {(tab === 'Created' && user.usergroup === 2) || (tab === 'Delivered' && user.usergroup === 3) ? (
          <Button
            mode="contained"
            style={{ margin: 16 }}
            onPress={() => updateStatus(tab === 'Created' ? 2 : 3)}
          >
            {tab === 'Created' ? 'Mark as Delivered' : 'Mark as Received'}
          </Button>
        ) : null}

        {(user.usergroup === 3) ? (
          <FAB icon="plus" onPress={() => handleModalOpen()} style={{ position: 'absolute', bottom: 16, right: 16 }} />
        ) : null}
      </PaperProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    flexWrap: 'wrap', // Allow wrapping if screen is small
    padding: 10
  },

  tabButton: {
    flex: 1,
    marginHorizontal: 5,
    minHeight: 40,
    paddingHorizontal: 4,
  },

  tabLabel: {
    textAlign: 'center',
    flexWrap: 'wrap',
    fontSize: 14,
    width: '100%',
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 10,
    marginTop: 20,
    padding: 10
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  card: {
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#555',
  },
  statusText: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '600',
  },
});
