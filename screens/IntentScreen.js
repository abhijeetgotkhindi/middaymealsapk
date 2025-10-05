import React, { useState, useCallback, useContext, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, FlatList, RefreshControl, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FAB, Portal, Modal, Provider as PaperProvider, DefaultTheme,
  Button, TextInput, Checkbox, Snackbar, Card, Divider, IconButton
} from 'react-native-paper';
// import { MaterialCommunityIcons } from '@expo/vector-icons'; // Or use `react-native-vector-icons`
import { FontAwesome } from '@expo/vector-icons';

import { DatePickerModal, registerTranslation } from 'react-native-paper-dates';
import { Dropdown } from 'react-native-element-dropdown';
import { useFocusEffect } from '@react-navigation/native';
import { format, parse, set, isSameDay } from 'date-fns';

import Header from '../components/Header';
import { AuthContext } from '../utils/AuthContext';
import useApi from '../utils/api';

// <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
// <Dropdown
// data={school}
// labelField="name"
// valueField="oid"
// placeholder="Select School"
// value={selectedSchool}
// onChange={item => {
// if (!isViewMode) {
// setSelectedSchool(item.oid);
// handleChange('school', item.oid);
// }
// }}
// style={[styles.dropdown, isViewMode && { backgroundColor: '#f0f0f0' }]}
// disable={isViewMode}
// />
// </KeyboardAvoidingView>
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

  const [schoolDetails, setSchoolDetails] = useState([]);
  const [school, setSchool] = useState([]);
  // const [selectedSchool, setSelectedSchool] = useState('');

  const [holidayList, setHolidayList] = useState([]);
  const [isViewMode, setIsViewMode] = useState(false);

  const [showRangePicker, setShowRangePicker] = useState(false);
  const today = new Date();
  const [dateRange, setDateRange] = useState({
    startDate: today,
    endDate: today,
  });
  const [formData, setFormData] = useState({
    oid: 0,
    intentfor: new Date(),
    school: 0,
    ...['g1', 'g2', 'g3', 'g4'].reduce((acc, grade) => {
      ['totalpresent', 'hotmeals', 'milk', 'egg', 'banana'].forEach(field => {
        acc[`${grade}${field}`] = '0';
      });
      return acc;
    }, {})
  });


  const handleChange = (key, field, value) => {
    // Update value first
    setFormData(prev => ({ ...prev, [field]: value }));
    // Perform validation only onBlur
    const validateField = () => {
      const totalReg = Number(formData[key + 'totalreg'] || 0);
      const totalPresent = Number(formData[key + 'totalpresent'] || 0);
      const hotmeals = Number(formData[key + 'hotmeals'] || 0);
      const milk = Number(formData[key + 'milk'] || 0);
      const egg = Number(formData[key + 'egg'] || 0);
      const banana = Number(formData[key + 'banana'] || 0);

      switch (field) {
        case key + 'totalpresent':
          if (Number(value) > totalReg) {
            setFormData(prev => ({ ...prev, [field]: '' }));
            alert('Total Present should be less than or equal to Total Reg');
          }
          break;
        case key + 'hotmeals':
          if (Number(value) > totalPresent) {
            setFormData(prev => ({ ...prev, [field]: '' }));
            alert('Hot Meals should be less than or equal to Total Present');
          }
          break;
        case key + 'milk':
          if (Number(value) > totalPresent) {
            setFormData(prev => ({ ...prev, [field]: '' }));
            alert('Milk should be less than or equal to Total Present');
          }
          break;
        case key + 'egg':
          if (Number(value) + banana > totalPresent) {
            setFormData(prev => ({ ...prev, [field]: '' }));
            alert('Egg + Banana should be less than or equal to Total Present');
          }
          break;
        case key + 'banana':
          if (Number(value) + egg > totalPresent) {
            setFormData(prev => ({ ...prev, [field]: '' }));
            alert('Egg + Banana should be less than or equal to Total Present');
          }
          break;
        default:
          break;
      }
    };
    return validateField;
  };

  const fetchSchools = useCallback(async () => {
    try {
      const result = await request({ method: 'GET', url: `/school/${user.school}` });
      if (result.success) {
        const schoolDetails = result.schools;
        setSchoolDetails(schoolDetails);
        setSchool(schoolDetails.map(item => ({
          oid: item.oid.toString(),
          name: item.schoolname,
        })));
      }
    } catch (err) {
      // console.error('School error:', err.message);
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
    const isWeekend = date.getDay() === 0;// || date.getDay() === 6;
    const isHoliday = holidayList.some(holiday => isSameDay(holiday, date));
    if (isWeekend || isHoliday) {
      // setSnackbar({ visible: true, msg: 'Invalid date: Holiday or Weekend' });
      alert('Invalid date: Holiday or Sunday/Weekend');
      return;
    }
    handleChange('', 'intentfor', format(date, 'yyyy-MM-dd'));
    setShowDatePicker(false);
  }

  const fetchIntents = useCallback(async (startDate = format(dateRange.startDate, "dd-MM-yyyy"), endDate = format(dateRange.endDate, "dd-MM-yyyy")) => {
    setRefreshing(true);
    try {
      const fromDate = format(startDate, "dd-MM-yyyy");
      const toDate = format(endDate, "dd-MM-yyyy");
      const result = await request({ method: 'GET', url: `/intent/${user.ngocode}/${user.school}/${fromDate} : ${toDate}` });
      if (result.success) {
        const list = result.intent;
        setIntentList(list);
        filterByTab(tab, list);
        const selectedMap = {};
        list.forEach(item => { selectedMap[item._id] = false; });
        setSelected(selectedMap);
      }
    } catch (error) {
      console.log(error);
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

  const openEditModal = (item, viewOnly = false) => {
    const fullIntent = intentList.find(intent => intent.oid == item.oid).createdDate;

    const grades = ['g1', 'g2', 'g3', 'g4'];
    const fields = ['totalreg', 'totalpresent', 'hotmeals', 'milk', 'egg', 'banana'];

    const dynamicFormData = {};

    grades.forEach(grade => {
      fields.forEach(field => {
        const key = `${grade}${field}`;
        dynamicFormData[key] = item[key]?.toString() || '0';
      });
    });

    setFormData({
      oid: item.oid?.toString() || '0',
      intentfor: new Date(parse(item.intentfor, 'EEE dd-MM-yyyy', new Date())),
      school: item.school?.toString() || '0',
      createdDate: fullIntent,
      ...dynamicFormData
    });
    // or item.schoolname, depending on your Dropdown structure
    const selected = school.find(s => s.oid == item.school);

    // setSelectedSchool(selected.oid || null);
    setIsViewMode(viewOnly); // <- Freeze form
    setModalVisible(true);
  };

  const getStatusColor = (status) => {
    return status === 'Created' ? '#2196F3' :
      status === 'Delivered' ? '#FF9800' :
        status === 'Received' ? '#4CAF50' : '#BDBDBD';
  };

  const renderItem = ({ item }) => (
    <Card style={[styles.card, { borderLeftColor: getStatusColor(item.istatus), borderLeftWidth: 5 }]}>
      <View style={styles.cardContent}>
        {(tab === 'Created' && user.usergroup === 2) || (tab === 'Delivered' && user.usergroup === 3) ? (
          <Checkbox
            status={selected[item.oid] ? 'checked' : 'unchecked'}
            onPress={() => toggleItem(item.oid)}
          />
        ) : null}
        <TouchableOpacity style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>{item.schoolname}</Text>
          <Text style={styles.itemSubtitle}><FontAwesome name="calendar" size={14} /> {item.intentfor}</Text>
          <Text style={[styles.statusText, { color: getStatusColor(item.istatus) }]}><FontAwesome name="info" size={14} /> Status: {item.istatus}</Text>
        </TouchableOpacity>
        {(tab === 'Created' && user.usergroup === 2) || (tab === 'Created' && user.usergroup === 3) ? (
          <IconButton icon="pencil" size={20} onPress={() => openEditModal(item)} />
        ) : null}
        <IconButton icon="eye" size={20} onPress={() => openEditModal(item, true)} />
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
      fetchIntents(dateRange.startDate, dateRange.endDate);
    } catch (err) {
      setSnackbar({ visible: true, msg: 'Update failed' });
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSchools();
      fetchIntents();
      holidayMaster();
      setTab('All');
    }, [])
  );

  React.useEffect(() => {
    const grades = ['g1', 'g2', 'g3', 'g4'];
    const fields = ['hotmeals', 'milk', 'egg', 'banana'];
    let sum = 0;
    grades.forEach(grade => {
      fields.forEach(field => {
        const key = `${grade}${field}`;
        sum += parseInt(formData[key]) || 0;
      });
    });
    setFormData(prev => ({ ...prev }));
  }, [
    formData.g1hotmeals, formData.g1milk, formData.g1egg, formData.g1banana,
    formData.g2hotmeals, formData.g2milk, formData.g2egg, formData.g2banana,
    formData.g3hotmeals, formData.g3milk, formData.g3egg, formData.g3banana,
    formData.g4hotmeals, formData.g4milk, formData.g4egg, formData.g4banana,
  ]);


  const validateFormData = () => {
    const requiredTopFields = ['intentfor', 'school'];
    const grades = [
      { key: 'g2', label: '1st - 5th Std' },
      { key: 'g3', label: '6th & 7th Std' },
      { key: 'g4', label: '8th - 10th Std' },
      { key: 'g1', label: 'LKG & UKG' },
    ];
    const requiredFields = [{ field: 'totalreg', fieldName: 'Total Reg' }, { field: 'totalpresent', fieldName: 'Total Present' }, { field: 'hotmeals', fieldName: 'Hot Meals' }, { field: 'milk', fieldName: 'Milk' }, { field: 'egg', fieldName: 'Egg' }, { field: 'banana', fieldName: 'Banana' }];

    // Check top-level required fields
    for (let field of requiredTopFields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        setSnackbar({ visible: true, msg: `${field} is required` });
        return false;
      }
    }

    // Check grade-wise required fields
    for (let grade of grades) {
      for (let field of requiredFields) {
        const key = `${grade.key}${field.field}`;
        if (!formData[key] || formData[key].toString().trim() === '') {
          setSnackbar({ visible: true, msg: `Field ${field.fieldName} is required for ${grade.label.toUpperCase()}` });
          return false;
        }
      }
    }

    // if (!selectedSchool) {
    // setSnackbar({ visible: true, msg: `School selection is required` });
    // return false;
    // }

    return true;
  };


  const handleSubmit = async (status) => {
    if (!validateFormData()) return;
    const payload = { ...formData, intentfor: format(formData.intentfor, 'yyyy-MM-dd'), school: user.school, istatus: status, createdby: user.oid };
    try {
      await request({
        method: (formData.oid == 0 ? 'POST' : 'PUT'),
        url: `/intent/${user.ngocode}/` + (formData.oid == 0 ? 'addnew' : 'update'),
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
      // nextDate.getDay() === 6 || // Saturday
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

  const resetFormData = () => {
    const grades = ['g1', 'g2', 'g3', 'g4'];
    const fields = ['totalpresent', 'hotmeals', 'milk', 'egg', 'banana'];

    const gradeFields = grades.reduce((acc, grade) => {
      fields.forEach(field => {
        acc[`${grade}${field}`] = '0';
      });

      switch (grade) {
        case 'g2':
          acc[`${grade}totalreg`] = `${(schoolDetails[0]?.['1std'] || 0) +
            (schoolDetails[0]?.['2std'] || 0) +
            (schoolDetails[0]?.['3std'] || 0) +
            (schoolDetails[0]?.['4std'] || 0) +
            (schoolDetails[0]?.['5std'] || 0)
            }`;
          break;

        case 'g3':
          acc[`${grade}totalreg`] = `${(schoolDetails[0]?.['6std'] || 0) +
            (schoolDetails[0]?.['7std'] || 0)
            }`;
          break;

        case 'g4':
          acc[`${grade}totalreg`] = `${(schoolDetails[0]?.['8std'] || 0) +
            (schoolDetails[0]?.['9std'] || 0) +
            (schoolDetails[0]?.['10std'] || 0)
            }`;
          break;

        case 'g1':
          acc[`${grade}totalreg`] = `${(schoolDetails[0]?.['lkg'] || 0) +
            (schoolDetails[0]?.['ukg'] || 0)
            }`;
          break;

        default:
          acc[`${grade}totalreg`] = `0`;
      }
      return acc;
    }, {});

    setFormData({
      oid: '0',
      intentfor: getNextValidDate(),
      school: '',
      ...gradeFields,
    });
  };


  const handleModalOpen = () => {
    setIsViewMode(false); // <- Freeze form
    setModalVisible(true);
    resetFormData();
    // setSelectedSchool('');

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
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {isViewMode ? 'View' : formData.oid === '0' ? 'Add' : 'Edit'} Intent
                  </Text>
                  <IconButton icon="close" size={22} onPress={handleModalClose} style={styles.modalCloseButton} />
                </View>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Basic Information</Text>
                  {isViewMode ? (
                    <>
                      <TextInput
                        key="Intent Created/Updated Date"
                        label="Intent Created/Updated Date"
                        value={format(new Date(formData.createdDate), 'dd-MM-yyyy')}
                        style={[styles.input, { marginBottom: 10 }]}
                        mode="outlined"
                        editable={false}
                      />
                      <TextInput
                        key='Intent For'
                        label='Intent For'
                        value={format(formData.intentfor, 'dd-MM-yyyy')}
                        style={[styles.input, { marginBottom: 0 }]}
                        mode="outlined"
                        editable={!isViewMode} // 🔒 Freeze if true
                      />
                    </>
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
                      date={new Date(formData.intentfor)}
                      onDismiss={() => setShowDatePicker(false)}
                      onConfirm={({ date }) => {
                        const correctedDate = set(date, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }); // Avoids time zone cutoff
                        checkDate(date);
                      }}
                      editable={!isViewMode} // 🔒 Freeze if true
                    />
                  )}
                </View>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Meal Details</Text>
                  {[
                    { key: 'g2', label: '1st - 5th Std' },
                    { key: 'g3', label: '6th & 7th Std' },
                    { key: 'g4', label: '8th - 10th Std' },
                    { key: 'g1', label: 'LKG & UKG' },
                  ].map(({ key, label }) => (
                    <View key={key} style={styles.section}>
                      <View style={styles.gradeSection}>
                        <Text style={styles.gradeTitle}>{label}</Text>
                        {[{ field: 'totalreg', fieldName: 'Total Reg' }, { field: 'totalpresent', fieldName: 'Total Present' }, { field: 'hotmeals', fieldName: 'Hot Meals' }, { field: 'milk', fieldName: 'Milk' }, { field: 'egg', fieldName: 'Egg' }, { field: 'banana', fieldName: 'Banana' }].map(({ field, fieldName }) => {
                          const fullField = `${key}${field}`;
                          return (
                            <TextInput
                              key={fullField}
                              label={fieldName}
                              value={formData[fullField]}
                              onChangeText={text => handleChange(key, fullField, text)()}
                              onBlur={() => handleChange(key, fullField, formData[fullField])()} // triggers validation
                              keyboardType="numeric"
                              style={styles.input}
                              mode="outlined"
                              editable={field !== 'totalreg' && !isViewMode}
                            />

                          );
                        })}
                      </View>
                    </View>
                  ))}

                  {/* <TextInput
                    label="Total"
                    value={formData.total}
                    mode="outlined"
                    style={styles.input}
                    editable={false}
                  /> */}
                </View>


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
        <View style={styles.tabRowFilter}>
          {showRangePicker && (
            <DatePickerModal
              locale="en"
              mode="range"
              visible
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onDismiss={() => setShowRangePicker(false)}
              onConfirm={({ startDate, endDate }) => {
                startDate = new Date(startDate)
                endDate = new Date(endDate)
                setDateRange({ startDate, endDate });
                setShowRangePicker(false);
                if (startDate && endDate) {
                  fetchIntents(startDate, endDate);
                }
              }}
            />
          )}
          <Button
            mode="outlined"
            style={{ margin: 10 }}
            onPress={() => setShowRangePicker(true)}
          >
            {dateRange.startDate && dateRange.endDate
              ? `${format(dateRange.startDate, "dd-MM-yyyy")} → ${format(dateRange.endDate, "dd-MM-yyyy")}`
              : "Select Date Range"}
          </Button>

        </View>
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
          refreshControl={<RefreshControl refreshing={refreshing}  onRefresh={() => fetchIntents(dateRange.startDate, dateRange.endDate)} />}
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
  gradeSection: {
    marginBottom: 16,
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    paddingHorizontal: 8,
  },

  gradeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  modalCloseButton: {
    margin: 0,
  },

  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  Mainsection: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
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

  tabRowFilter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: -10,
    marginTop: 10,
    flexWrap: 'wrap', // Allow wrapping if screen is small
  },

  tabButton: {
    flex: 1,
    marginHorizontal: 4,
    minHeight: 42,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#ccc',
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
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#777',
  },
  statusText: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: 'bold',
  },
});
